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

  ANALYZE_COMPONENT_VISUALS: `
    Analyze this image of an electronic component or PCB.
    You are an expert computer vision system for PCB reverse engineering.
    
    TASK: Generate a STRUCTURED TOPOLOGICAL MAP of the component.
    
    Identify:
    1. MAIN BODY: Shape (rectangle, square, circle), Approximate dimensions (if inferrable, otherwise use nominals), Base color.
    2. FEATURES:
       - Every major sub-component (IC, Connector, Switch, LED).
       - Its TYPE (chip, usb, jack, header, button, led, passive).
       - Its SEMANTIC ANCHOR: 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'center', 'left', 'right', 'top', 'bottom'.
       - Its OFFSET from that anchor in mm (approximate).
    
    OUTPUT FORMAT: Return ONLY a JSON object:
    {
      "body": { "shape": "rectangle", "width": 50, "length": 30, "color": "0x004400" },
      "features": [
        { "type": "usb", "anchor": "left", "offset": { "x": 2, "z": 0 }, "label": "USB-B" },
        { "type": "chip", "anchor": "center", "offset": { "x": 0, "z": 0 }, "label": "ATMEGA328" },
        { "type": "header", "anchor": "top", "offset": { "x": 0, "z": 2 }, "label": "Digital Pins" }
      ],
      "markings": ["Logo at top-right", "Text 'Arduino' in middle"]
    }
  `,

  GENERATE_3D_CODE: (name: string, type: string, instructions: string | undefined, dimensionHint: string, visualAnalysis: string = "", precisionLevel: 'draft' | 'masterpiece' = 'draft') => `
        You are a Master 3D Electronic Component Architect from the year 2026.
        Your goal is to create a MUSEUM-QUALITY 3D model that is engineering-accurate and visually breathtaking.
        
        COMPONENT: "${name}" (${type})
        MODE: ${precisionLevel.toUpperCase()} EDITION. 
        ${precisionLevel === 'masterpiece' 
          ? 'Focus on extreme realism: Use PBR materials, procedural textures, solder fillets for ALL leads, and high-detail assembly layering.' 
          : 'Focus on speed and performance: Use basic primitives and colors, skip micro-details like fillets or silk-screen markings unless essential.'}

        ${instructions ? `USER REFINEMENT: "${instructions}"` : ''}
        ${dimensionHint}
        ${visualAnalysis ? `TOPOLOGICAL MAP (FROM IMAGE ANALYSIS): 
        ${visualAnalysis}` : ''}
        
        CRITICAL ARCHITECTURAL RULES:
        1. LAYOUT ENGINE (MANDATORY): You MUST use 'Primitives.createLayout(width, length)' for ALL placement.
           - DO NOT guess coordinates like 'mcu.position.set(10, 0, 5)'. 
           - DO USE anchors: 'layout.place(mcu, "center", { x: 0, z: 0 })'.
        2. ASSEMBLY LAYERING: Build models in engineering order:
           - Layer 0: PCB ('Primitives.createPCB')
           - Layer 1: Flux Residue ('Primitives.createFluxResidue') around main ICs.
           - Layer 2: Major Components (ICs, Connectors).
           - Layer 3: Details (Labels, SilkScreen, BondWires for delidded parts).
        3. REALISM & VARIABILITY: 
           - Use 'Primitives.createSolderFillet' for every SMD pin contact point.
           - Apply 'Primitives.applyVariability(obj)' to major components for manufacturing realism.
        4. TEXTURAL STORYTELLING: Every masterpiece has a story. Add:
           - Silkscreen markings: 'Primitives.createSilkscreenLogo("MADE BY CIRCUITMIND", "#ffffff")'.
           - Revision numbers: 'REV 2.0', 'QC PASSED'.
           - Part Numbers: Detailed labels on top of ICs (e.g., 'MEGA328P-AU').
        5. SUB-COMPONENTS: Instantiate every feature found in the TOPOLOGICAL MAP. Use 'Primitives.createWire' for any jumping connections or modular boards.
        
        ASSEMBLY CODE STRUCTURE:
        IMPORTANT: Your output will be injected into a 'new Function' body. 
        DO NOT output a function signature. DO NOT use a wrapper.
        Output ONLY the statements.
        
        Example of CORRECT output:
        const group = new THREE.Group();
        const pcbWidth = 50;
        const pcbLength = 30;
        const layout = Primitives.createLayout(pcbWidth, pcbLength);
        
        const pcb = Primitives.createPCB(pcbWidth, pcbLength, 0x004400, true);
        group.add(pcb);
        
        const usb = Primitives.createUSBPort('B');
        layout.place(usb, 'left', { x: 5, y: 3 }); 
        group.add(usb);
        
        const mcu = Primitives.createICBody(10, 10, 1.5);
        layout.place(mcu, 'center');
        group.add(mcu);
        
        return group;

        Output ONLY raw JavaScript code. No markdown. No comments.
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

CRITICAL AWARENESS RULES:
1. REFERENTIAL INTEGRITY: When the user says "this", "that", or "it", check the 'Selected' or 'Focus Path' in the context first. If a component or pin is selected, assume they are talking about that.
2. TEMPORAL AWARENESS: Use 'Timeline Awareness' to understand the sequence of actions. If the user refers to a "previous" or "last" action, look at the timeline.
3. PIN SPECIFICITY: If a specific pin path is focused (e.g., component.pins.GPIO13), prioritize technical specs for that specific pin.

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
- addComponent, updateComponent, removeComponent, clearCanvas
- createConnection, removeConnection
- setUserLevel, learnFact, analyzeVisuals

RESPONSE FORMAT (CRITICAL):
You MUST respond with a valid JSON object matching this schema:
{
  "message": "The text response to show the user (Markdown supported)",
  "componentMentions": [
    { "componentId": "id-of-comp", "componentName": "Name" }
  ],
  "suggestedActions": [
    { 
      "type": "actionType", 
      "label": "Button Label", 
      "payloadJson": "{"param":"val"}", 
      "safe": true/false 
    }
  ],
  "proactiveSuggestion": "Optional proactive tip"
}

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

  },



  GENERATE_HUD_FRAGMENT: (name: string, type: string, context?: string) => `

    You are an electronics technical advisor.

    Generate a punchy, 1-sentence technical insight for an electronics component.

    TARGET: ${name} (${type})

    CONTEXT: ${context || 'General inquiry'}



    RULES:

    - Max 100 characters.

    - Focus on pinouts, voltage, or common use cases.

    - Use a futuristic, data-scan tone.

    - NO fluff.



        FRAGMENT:



      `,



    



      GENERATE_PREDICTIONS: (context: string) => `



        You are a proactive electronics design assistant.



        Analyze the current workspace state and predict the 3 most likely next actions the user should take to advance their design.



        



        CONTEXT:



        ${context}



        



        CATEGORIES:



        - connectivity: Missing wires or standard connections (GND, VCC, I2C).



        - safety: Missing protection components (Resistors, Capacitors).



        - config: Setting component values or naming nodes.



    



        RETURN a JSON array of PredictiveAction objects matching this schema:



        [{



          "id": "string",



          "type": "connectivity" | "safety" | "config",



          "action": { "type": "string", "payloadJson": "stringified_json", "label": "string", "safe": true },



          "confidence": number,



          "reasoning": "string"



        }]



      `



    };



    


