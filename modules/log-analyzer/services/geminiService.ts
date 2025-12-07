import { GoogleGenAI, Type } from '@google/genai';
import {
  LogSummary,
  SpellStats,
  Role,
  AIStrategyResult,
  AIMiniGameConfig,
  SpellAIAnalysis,
} from '../types';

const getAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const classifySpellsByRole = async (
  spells: SpellStats[]
): Promise<Record<string, SpellAIAnalysis>> => {
  const ai = getAI();
  if (!ai) {
    console.warn('No API Key provided, returning empty classifications');
    return {};
  }

  const spellNames = spells.map((s) => s.name);
  const prompt = `
    Given the following list of World of Warcraft boss abilities, for each ability:
    1. Categorize it by which Player Role is most responsible for handling it or most affected by it (Tank, Healer, Melee DPS, Ranged DPS).
    2. Provide a very brief (max 15 words) description of what the ability likely does based on its name and standard WoW mechanics (e.g., "Frontal cone, tank swap", "Raid wide AoE damage").

    Spells: ${spellNames.join(', ')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  spellName: { type: Type.STRING },
                  roles: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  description: {
                    type: Type.STRING,
                    description: 'Brief 10-15 word description of the spell effect.',
                  },
                },
                required: ['spellName', 'roles', 'description'],
              },
            },
          },
        },
      },
    });

    const json = JSON.parse(response.text || '{}');
    const result: Record<string, SpellAIAnalysis> = {};

    if (json.items && Array.isArray(json.items)) {
      json.items.forEach((item: { spellName?: string; roles?: Role[]; description?: string }) => {
        if (item.spellName && item.roles) {
          result[item.spellName] = {
            roles: item.roles,
            description: item.description || 'No description available.',
          };
        }
      });
    }

    return result;
  } catch (error) {
    console.error('Gemini Classification Error:', error);
    return {};
  }
};

export const generateStrategy = async (summary: LogSummary): Promise<AIStrategyResult> => {
  const ai = getAI();
  if (!ai) {
    return {
      markdown: '## No API Key\nPlease provide a Gemini API Key to generate strategies.',
      phases: [],
    };
  }

  const spellSummary = summary.spells
    .map((s) => ({
      name: s.name,
      avgDamage: s.avgDamage,
      frequency: s.count,
      firstCastTime: s.timestamp[0],
    }))
    .sort((a, b) => b.avgDamage - a.avgDamage)
    .slice(0, 15);

  const prompt = `
    You are a World of Warcraft Raid Leader expert. Analyze this combat log summary for the encounter "${summary.encounterName}".

    Duration: ${summary.duration} seconds.
    Key Enemy Spells: ${JSON.stringify(spellSummary)}

    1. Create a detailed phase-by-phase strategy guide in Markdown.
    2. Identify 2-3 likely phases based on spell timing (e.g. if a spell starts appearing only after 100s).
    3. For each major spell, explain how players should react (e.g. "Tanks swap", "Healers cooldown", "DPS spread").
    4. Use bullet points and bold text for clarity.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return {
      markdown: response.text || 'Failed to generate strategy.',
      phases: [],
    };
  } catch (e) {
    return { markdown: `Error generating strategy: ${e}`, phases: [] };
  }
};

export const generateMiniGameConfig = async (summary: LogSummary): Promise<AIMiniGameConfig> => {
  const ai = getAI();
  if (!ai) {
    return {
      bossName: summary.encounterName,
      mechanics: [
        {
          name: 'Fire',
          type: 'dodge',
          color: '#ff0000',
          description: 'Dodge the fire',
          damage: 10,
          interval: 2000,
          radius: 30,
        },
      ],
    };
  }

  const spellNames = summary.spells.map((s) => s.name).slice(0, 5);

  const prompt = `
    Based on these WoW spells: ${spellNames.join(', ')} from boss ${summary.encounterName}.
    Create a configuration for a simple 2D survival mini-game.
    Return a JSON object with a list of 'mechanics'.
    Each mechanic has:
    - name: string (spell name)
    - type: 'dodge' (avoid area) | 'soak' (stand in area)
    - color: hex string (e.g. #FF0000 for fire)
    - description: short instruction
    - damage: number (1-100)
    - interval: number (ms between casts, 1000-5000)
    - radius: number (pixels, 20-100)
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const data = JSON.parse(response.text || '{}');
    return {
      bossName: summary.encounterName,
      mechanics: data.mechanics || [],
    };
  } catch (e) {
    console.error('Game Gen Error', e);
    return {
      bossName: summary.encounterName,
      mechanics: [
        {
          name: 'Generic Blast',
          type: 'dodge',
          color: '#ff0000',
          description: 'Avoid',
          damage: 20,
          interval: 2000,
          radius: 40,
        },
      ],
    };
  }
};
