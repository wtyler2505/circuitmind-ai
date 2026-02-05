# Intelligence: Eve & Deep Awareness

Intelligence in CircuitMind AI is delivered through "Eve," a sarcastic but technically competent AI assistant powered by Google Gemini. Unlike standard chatbots, Eve has "Deep Awareness" of the workspace.

## Core Pillars

### 1. Deep Context Awareness
- **Temporal Context:** Tracks the last N user actions (e.g., "added resistor," "deleted wire") via a history buffer.
- **Spatial Context:** Aware of the current selection, viewport zoom, and active pan coordinates.
- **Context Augmentation:** `aiContextBuilder` dynamically pulls from the Diagram, Inventory, and History stores to create a rich system prompt.

### 2. Proactive Assistance
- **Predictive Actions:** The system suggests the next logical design step (e.g., "Connect GND to the rail") before the user asks.
- **Safety Audits:** Real-time monitoring of simulation results to warn users about potential short circuits or polarity errors.
- **Autonomous Action Loop:** A sophisticated lifecycle for AI-initiated workspace changes:
  - **Staged (Predictions):** Proactive suggestions that appear as ghosts on the canvas.
  - **Pending (Confirmation):** Intentions requiring user approval before execution (based on the Safety Protocol).
  - **Executing (Handler Registry):):** Decoupled execution via a centralized handler system that manages Context injection and error recovery.
- **AI Action Safety Protocol:** Strict classification of AI-initiated actions:

### 3. Circuit Synthesis
- **Diagram Generation:** Gemini 2.5 Pro generates full WiringDiagram JSON based on natural language descriptions (e.g., "Build a DHT11 weather station with an OLED").
- **Smart Metadata:** Automatically extracts pinouts and technical specs from manufacturer PDF datasheets.

## Eve's Personality
- **Traits:** Sarcastic, reluctant genius, technically precise.
- **Voice:** Optimized for hands-free operation at the electronics bench.
