
import { GoogleGenAI } from "@google/genai";
import type { WowClass, Specialization } from '../types.ts';

// Per coding guidelines, `process.env.API_KEY` is assumed to be available.
// The GoogleGenAI instance is initialized directly without fallbacks.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateContentWithGemini = async (prompt: string, sourceUrls?: string): Promise<string> => {
    try {
        let finalPrompt = prompt;
        if (sourceUrls && sourceUrls.trim() !== '') {
            const urls = sourceUrls.split('\n').filter(url => url.trim() !== '').map(url => `- ${url.trim()}`).join('\n');
            finalPrompt = `IMPORTANT: Your primary task is to act as an expert World of Warcraft guide writer. You MUST use the information from the following web pages to construct your answer. If the information from these sources conflicts with your base knowledge, you MUST prioritize the information from the provided URLs. At the end of your response, you MUST cite the URLs you used under a "Sources:" heading.\n\nProvided URLs:\n${urls}\n\n---\n\nOriginal Request:\n${prompt}`;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: finalPrompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate content from AI. Please check the console for more details.");
    }
};

export const getOverview = (wowClass: WowClass, sourceUrls?: string): Promise<string> => {
    const prompt = `Provide a detailed and engaging overview for the ${wowClass.name} class in World of Warcraft for the latest expansion. Include its core identity, playstyle, strengths, weaknesses, and a summary of the most significant changes in the most recent major patch. Format the response using markdown.`;
    return generateContentWithGemini(prompt, sourceUrls);
};

export const getSpecGuide = (wowClass: WowClass, spec: Specialization, sourceUrls?: string): Promise<string> => {
    const prompt = `Generate a comprehensive, expert-level guide focusing on the build, stats, and advanced strategies for the ${spec.name} ${wowClass.name} specialization in World of Warcraft's latest expansion. Format the response using markdown. Include the following detailed sections:

1.  **Stat Priority:**
    *   List the optimal secondary stats (e.g., Haste > Mastery > Critical Strike > Versatility) for this specialization.
    *   Provide a clear explanation of *why* each stat is important and how it interacts with the spec's kit.

2.  **Mythic+ Talent Build:**
    *   **Core Strengths & Use Case:** Start this section with a bold brief explanation (e.g., "**Ideal for:** Sustained AoE and high utility in Mythic+ keys.").
    *   Explain the core philosophy of the Mythic+ build.
    *   List the "must-have" talents.
    *   Highlight key choice nodes and explain when to take which option for dungeons.

3.  **Alternative Talent Builds:**
    *   Provide 1-2 brief example builds for other content types (e.g., "Single-Target Raid", "PvP").
    *   For each, include a "**Core Strengths:**" summary line.

4.  **Advanced Tips:**
    *   **Nuanced Mechanics:** Explain any complex interactions or hidden mechanics that average players might miss.
    *   **Common Mistakes:** Detail specific errors players often make with this spec (rotational or positional) and how to avoid them.
    *   **Pro-Tips:** specific tricks to maximize throughput or survivability in high-difficulty content.`;
    return generateContentWithGemini(prompt, sourceUrls);
};

export const getRotationGuide = (wowClass: WowClass, spec: Specialization, sourceUrls?: string): Promise<string> => {
    const prompt = `Generate a detailed rotation and ability priority guide for the ${spec.name} ${wowClass.name} specialization in World of Warcraft's latest expansion. Format the response using markdown.

CRITICAL FORMATTING INSTRUCTION:
When listing specific class abilities, major offensive cooldowns, or defensive cooldowns, you MUST format them exactly like this:
\`[Ability Name]{Cooldown: X sec. ID: SpellID. Description: A brief 1-sentence description of what the ability does.}\`

Examples:
\`[Mortal Strike]{Cooldown: 6 sec. ID: 12294. Description: A vicious strike that deals high physical damage and reduces healing received.}\`
\`[Heroic Leap]{Cooldown: 45 sec. ID: 6544. Description: Leaps to a target location, dealing damage to all enemies within 8 yards.}\`

*   **Cooldown:** Provide the base cooldown.
*   **ID:** Provide the main Spell ID for the ability (best estimate for current patch).
*   **Description:** Provide a short summary *inside* the curly braces after the ID.

Include the following sections:

1.  **Single-Target Rotation:**
    *   A strict priority list of abilities. Explain *why* for each line.

2.  **Multi-Target (AoE) Rotation:**
    *   A priority list for fighting multiple enemies. Mention target counts.

3.  **Offensive Cooldown Usage:**
    *   Explain how to integrate major offensive cooldowns (Avatar, Combustion, Wings, etc.) for maximum burst.
    *   Use the specific \`[Ability]{...}\` format.

4.  **Defensive Cooldowns & Survival:**
    *   **Dedicated Section:** List each major defensive cooldown using the \`[Ability]{...}\` format.
    *   For each defensive, provide specific bullet points on **When to Use**:
        *   "Use on high incoming magic damage."
        *   "Save for Boss X's specific ability."
    *   Include Spell IDs for all defensives.`;
    return generateContentWithGemini(prompt, sourceUrls);
};

export const getAddons = (wowClass: WowClass, sourceUrls?: string): Promise<string> => {
    const prompt = `List the most essential addons and WeakAuras for a ${wowClass.name} player in World of Warcraft's latest expansion. Format the response using markdown.
- **Addons:** Categorize them into "General Must-Haves" (like DBM, Details!) and "${wowClass.name} Specific". Briefly explain why each is useful.
- **WeakAuras:** 
  - Describe the key things a ${wowClass.name} must track, including major offensive cooldowns, defensive cooldowns, procs, and resource levels. 
  - Provide specific examples of WeakAura search terms for wago.io to find popular, comprehensive packs (e.g., "Afenar Warrior", "Luxthos Shaman").`;
    return generateContentWithGemini(prompt, sourceUrls);
};

export const getDungeonTips = (wowClass: WowClass, spec: Specialization, dungeonName?: string, sourceUrls?: string): Promise<string> => {
    let targetDungeon = dungeonName || "two popular Mythic+ dungeons from the current season";
    
    const prompt = `For a ${spec.name} ${wowClass.name}, provide specific, expert-level tips for ${targetDungeon} in World of Warcraft.
    
    Structure the response as follows:
    
    1.  **General Dungeon Strategy:**
        *   **Key Utility:** Where can this spec's utility (stuns, dispels, knocks) be used on specific trash packs?
    
    2.  **Boss Breakdown (Major Bosses):**
        *   Iterate through the main bosses of the dungeon.
        *   For each boss, provide **Spec-Specific Tips**:
            *   "Use [Defensive Cooldown] during Phase 2 when..."
            *   "Save burst for the add spawn at..."
            *   "Position yourself at X to bait Y mechanic."
    
    Format the response in markdown. Use the \`[Ability Name]{Cooldown: X sec. ID: Y}\` format if referencing specific class spells.`;
    return generateContentWithGemini(prompt, sourceUrls);
};
