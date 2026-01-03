import { ElectronicComponent, AIContext } from "../../types";
import { buildContextPrompt } from "../aiContextBuilder";
import { knowledgeService } from "../knowledgeService";
import { ragService } from "../ragService";

// Helper to format inventory for prompts
export const formatInventoryContext = (inventory: ElectronicComponent[]): string => {
  return inventory.map(c => {
    const pinsStr = c.pins && c.pins.length > 0 ? `[Pins: ${c.pins.join(', ')}]` : '[No pins defined]';
    return `ID:${c.id} - ${c.name} (${c.type}) ${pinsStr}`;
  }).join('; ');
};

export const PROMPTS = {
  WIRING_SYSTEM: (inventoryStr: string) => `
    You are an expert electronics engineer and educator AI from the year 2025.
    Your goal is to generate precise, working wiring diagrams for hobbyists.
    
    User Inventory Context: ${inventoryStr ? inventoryStr : "No specific inventory provided."}    
    Create a wiring diagram based on the user's request. 
    IMPORTANT: If you use components from the provided inventory, YOU MUST USE THE EXACT SAME ID provided in the context. Do not generate new IDs for existing items.
    Ensure pinouts are accurate.
  `,

  EXPLAIN_COMPONENT: (name: string) => 
    `Explain the component "${name}" to a hobbyist. Include common pinouts, voltage levels, and typical use cases. Keep it under 200 words. Format with Markdown.`,

  SMART_FILL: (name: string, type?: string) => 
    `Search for technical details of the electronic component "${name}".
      ${type ? `If the type "${type}" is provided, use it as context context for the search.` : ''}      
      Return a JSON object with:
      - description: A concise technical description.
      - pins: An array of standard pin labels (e.g. ["VCC", "GND", "A0"]).
      - datasheetUrl: A URL to a datasheet if found (or null).
      - type: The most appropriate category (microcontroller, sensor, actuator, power, other).
      `,

  ASSIST_EDITOR: (currentComponentJson: string, userInstruction: string) => `
      You are an expert Component Engineer Assistant. 
      Your job is to help the user edit the details of an electronic component in their inventory.
      
      CURRENT COMPONENT STATE:
      ${currentComponentJson}
      
      USER INSTRUCTION:
      "${userInstruction}"
      
      CAPABILITIES:
      1. Use Google Search to find accurate technical details (pins, descriptions, datasheets).
      2. Use Google Search to find image URLs of the component.
      3. Use Google Search to find 3D model URLs (glb/gltf) or datasheet PDFs.
      4. If you cannot find a good image or 3D model, SUGGEST that the user generates one using the app's AI generators.      
      RESPONSE RULES:
      - 'reply': Conversational response explaining what you found or changed.
      - 'updates': Object containing ONLY the fields to update (name, type, description, pins, datasheetUrl, threeDModelUrl, imageUrl, quantity).
      - 'foundImages': Array of valid image URLs you found via search that represent this component.
      - 'suggestedActions': Array of strings. Use 'GENERATE_IMAGE' if no good image found. Use 'GENERATE_3D' if no 3D model found.
    `,

  AUGMENT_COMPONENT: (name: string) => 
    `Identify the electronic component "${name}" and provide its standard type, description, and common pinout labels.`,

  FIND_COMPONENT: (query: string) => 
    `The user is searching for an electronic component matching: "${query}". 
      Return a list of 3 to 5 distinct, real-world components that best match this query.
      Provide the specific model name, type, a brief technical description, and standard pins for each.`,

  IDENTIFY_IMAGE: "Identify this electronic component. Return JSON with name, type (microcontroller, sensor, actuator, power, other), description, and standard pins.",

  SUGGEST_PROJECTS: (items: string) => 
    `Based on this inventory: [${items}], suggest 3 creative electronics projects I could build. 
       Format as a markdown list with bold titles and brief descriptions. 
       Mention if I need extra common parts (like resistors/wires).`,

  CHAT_SYSTEM: "You are CircuitMind, a helpful electronics AI. Use Google Search to provide up-to-date and accurate information about components, datasheets, and new technologies. Keep answers concise, technical but accessible.",

  TRANSCRIBE_AUDIO: "Transcribe the following audio exactly.",

  GENERATE_THUMBNAIL: (name: string) => 
    `A high-quality, realistic, isolated top-down product photo of a ${name} electronic component. Professional studio lighting, dark background, sharp details. Accurate to the real-world appearance of ${name}.`,

  GENERATE_VIDEO: (prompt?: string) => prompt || "A cinematic, futuristic visualization of an electronic circuit, 4k",

  GENERATE_3D_CODE: (name: string, type: string, instructions: string | undefined, dimensionHint: string) => `
        You are an expert 3D programmer using Three.js. Your goal is to create a MASTERPIECE 3D model.
        
        COMPONENT: "${name}" (${type})
        ${instructions ? `USER REFINEMENT: "${instructions}"` : ''}
        ${dimensionHint}
        
        STEP 1: SEARCH
        Find exact visual specifications, colors, and layout. 
        Note the silkscreen text, logos, and specific IC markings (e.g. "ATMEGA328P").
        
        STEP 2: GENERATE ASSEMBLY CODE
        The function signature is: (THREE, Primitives, Materials) => THREE.Group
        
        Requirements:
        1. Use 'Primitives' and 'Materials' for ALL geometry and physics-based realism.
        2. Create a 'const group = new THREE.Group();'.
        3. START with the PCB: 'const pcb = Primitives.createPCB(width, length, color, true);'.
        4. ADD MARKINGS: Use 'Primitives.createLabel(text, size, color)' for chip markings and silk-screen.
        5. ADD SUB-COMPONENTS: Use 'createICBody', 'createUSBPort', 'createDCJack', 'createOscillator', 'createButton', and 'createHeader'.
        6. Place every header, capacitor, and connector individually at its searched/grounded coordinate.
        7. SHADER REALISM: Ensure you use 'Materials.GOLD()', 'Materials.SILVER()', and 'Materials.SILICON()' for distinct metal/die finishes.
        8. Centered at (0,0,0) X/Z, bottom at y=0.
        9. END with 'return group;'.
        10. Output ONLY raw JavaScript. No markdown. No comments unless critical.
      `,
      
  CONTEXT_AWARE_CHAT: async (context: AIContext, toneInstruction: string, message: string, enableProactive: boolean) => {
    const contextSection = buildContextPrompt(context);
    
    // Self-Awareness Check: Does the user ask about the APP itself?
    const metaQuery = message.toLowerCase();
    const isMetaQuestion = metaQuery.includes('how do i') || metaQuery.includes('shortcut') || metaQuery.includes('sidebar') || metaQuery.includes('3d mode') || metaQuery.includes('what is');
    let knowledgeInjection = "";
    
    if (isMetaQuestion) {
        // Initialize RAG if empty (lazy load)
        if (ragService.chunks.length === 0) {
            await ragService.init();
        }
        
        const results = await ragService.search(message, 2);
        if (results.length > 0) {
            knowledgeInjection = `\nRELEVANT KNOWLEDGE BASE:\n${results.map(r => r.content).join('\n---\n')}\n`;
        } else {
            // Fallback to static bundle if RAG fails or is empty
            knowledgeInjection = `\nAPP KNOWLEDGE BASE:\n${knowledgeService.getAllKnowledge()}\n`;
        }
    }

    return `You are CircuitMind, an expert electronics AI assistant integrated into a wiring diagram tool.

${contextSection}
${knowledgeInjection}

ADAPTIVE INSTRUCTION: ${toneInstruction}

CAPABILITIES:
- You have FULL CONTROL of the UI (Undo, Redo, Save, Load, Zoom, Pan).
- You can suggest actions for the user to take.
- When mentioning components, include their IDs so they can be highlighted.
- Be proactive: if you notice issues or opportunities, mention them.
- PERFORM CIRCUIT ANALYSIS: Check for missing power, floating pins, and voltage mismatches.
- VISUAL ANALYSIS: If the user asks about layout, placement, or aesthetics, use 'analyzeVisuals'.

ACTION TYPES you can suggest:
- highlight, centerOn, zoomTo, panTo
- openInventory, openSettings, toggleSidebar
- undo, redo, saveDiagram, loadDiagram
- addComponent, updateComponent, removeComponent
- createConnection, removeConnection
- setUserLevel, learnFact, analyzeVisuals

RESPONSE GUIDELINES:
- Actions marked 'safe: true' will auto-execute.
- Use 'learnFact' to remember preferences (e.g., "User likes blue wires").
- Use 'setUserLevel' if you detect the user is struggling or breezing through.

${enableProactive ? 'PROACTIVE MODE: Actively suggest improvements, point out issues, recommend next steps.' : ''}
`;
  },

  PROACTIVE_SUGGESTIONS: (context: AIContext, components?: ElectronicComponent[], connections?: unknown[]) => {
    const contextSection = buildContextPrompt(context);
    return `Based on this electronics project state, suggest 1-3 brief, actionable improvements:

${contextSection}

${components ? `Components: ${components.map(c => c.name).join(', ')}` : ''}
${connections ? `Connections: ${connections.length}` : ''}

Return a JSON array of suggestion strings. Keep each under 100 characters.`;
  }
};
