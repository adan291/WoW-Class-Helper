import { GoogleGenAI, Type } from '@google/genai';
import { AnalysisResult } from '../types';
import { en } from '../locales/en';
import { es } from '../locales/es';

const prompts = {
  en: {
    system: en.gemini_prompt_system,
    playerClass: en.gemini_prompt_playerClass,
    playerSpec: en.gemini_prompt_playerSpec,
    logData: en.gemini_prompt_logData,
    instruction: en.gemini_prompt_instruction,
  },
  es: {
    system: es.gemini_prompt_system,
    playerClass: es.gemini_prompt_playerClass,
    playerSpec: es.gemini_prompt_playerSpec,
    logData: es.gemini_prompt_logData,
    instruction: es.gemini_prompt_instruction,
  },
};

export async function analyzeLog(
  playerClass: string,
  playerSpec: string,
  logData: string,
  language: 'en' | 'es'
): Promise<AnalysisResult> {
  // Guild Manager usa su propia API key, con fallback a la general
  const apiKey =
    import.meta.env.VITE_GEMINI_API_KEY_GUILD_MANAGER || import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY_GUILD_MANAGER not configured');
  }

  const ai = new GoogleGenAI({ apiKey });
  const selectedPrompt = prompts[language];

  const prompt = `
    ${selectedPrompt.system}

    ${selectedPrompt.playerClass}: ${playerClass}
    ${selectedPrompt.playerSpec}: ${playerSpec}
    ${selectedPrompt.logData}:
    ---
    ${logData.substring(0, 2000)}...
    ---

    ${selectedPrompt.instruction}
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
            summary: {
              type: Type.OBJECT,
              properties: {
                averageDps: { type: Type.INTEGER, description: 'Average DPS' },
                peakDps: { type: Type.INTEGER, description: 'Peak DPS' },
                primaryAbilityUptimePercent: {
                  type: Type.INTEGER,
                  description: 'Uptime percentage',
                },
                primaryAbilityName: { type: Type.STRING, description: 'Key ability name' },
              },
            },
            commonErrors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of 2-3 common gameplay mistakes',
            },
            comparison: {
              type: Type.OBJECT,
              properties: {
                percentile: { type: Type.INTEGER, description: 'Performance percentile' },
                comment: { type: Type.STRING, description: 'Brief comparison comment' },
              },
            },
            chartsData: {
              type: Type.OBJECT,
              properties: {
                abilityUsage: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      abilityName: { type: Type.STRING },
                      casts: { type: Type.INTEGER },
                    },
                  },
                  description: 'Top 5 abilities and their cast counts',
                },
                downtimePercent: { type: Type.INTEGER, description: 'Percentage of inactive time' },
              },
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  spellIconUrl: { type: Type.STRING, description: 'URL to a WoW spell icon' },
                  suggestion: { type: Type.STRING, description: 'Actionable tip for improvement' },
                },
              },
              description: 'List of 2-3 actionable tips with spell icons',
            },
          },
        },
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AnalysisResult;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error(language === 'es' ? es.analyzer_error_gemini : en.analyzer_error_gemini);
  }
}
