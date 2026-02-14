# Codebase Summary

## Overall Purpose & Domain
This application, CircuitMind AI, is an advanced, AI-augmented workspace designed for the creation and prototyping of electronic circuits. It offers a rich, interactive user interface for developing wiring diagrams, managing a comprehensive library of electronic components, and visualizing circuits in both 2D and 3D environments.

The target audience spans electronics hobbyists, students, and professional engineers. Features such as the "Engineering Bootcamp" (`BootcampPanel.tsx`), user expertise levels managed by `userProfileService.ts`, and AI-assisted debugging capabilities (`ai-assisted-debugging-circuit-_20260123/metadata.json`) are tailored to accommodate a broad spectrum of skill levels.

The primary objective of CircuitMind AI is to streamline and accelerate the electronics design process. It achieves this by integrating a powerful AI assistant, powered by Google Gemini, directly into the design canvas. This AI can generate diagrams, propose connections, provide explanations for components, and audit circuits for potential errors. The application also introduces innovative interaction methods, including gesture control via "Neural Link" (`useNeuralLink.ts`).

## Key Concepts & Domain Terminology
*   **Wiring Diagram:** The fundamental data model representing an electronic circuit. It comprises a collection of `ElectronicComponent` instances and `WireConnection`s that define the interconnections between component pins.
*   **Electronic Component:** A structured data representation of a physical electronic part (ee.g., Arduino Uno, LED, resistor). It encapsulates metadata such as name, type, a list of pins, and a reference to its corresponding entry in the user's inventory.
*   **Inventory:** The user's personalized library of available electronic components. It functions as the authoritative source of truth; components placed on the diagram canvas are instances derived from items within this inventory (`InventoryContext.tsx`, `componentValidator.ts`).
*   **FZPZ:** A proprietary file format originating from the Fritzing electronics design software. CircuitMind AI extensively utilizes FZPZ files to import component metadata, pin definitions, and high-fidelity SVG visuals for rendering on the 2D canvas (`fzpzLoader.ts`, `FzpzVisual.tsx`).
*   **ActionIntent:** A structured command object that encapsulates a discrete operation requested by the AI, such as `addComponent` or `createConnection`. These intents are parsed from the AI's natural language responses and subsequently executed by the application (`types.ts`, `useAIActions.ts`).
*   **AI Context:** A comprehensive JSON object that captures the current state of the user's workspace, including the active diagram, inventory, selected items, and user profile. This context is transmitted to the AI with each request to facilitate context-aware and relevant responses (`aiContextBuilder.ts`).
*   **Neural Link:** The system enabling application control through hand gestures, captured via the device's camera. It leverages MediaPipe to track hand landmarks and translates specific gestures, such as pinching and swiping, into corresponding UI events (`useNeuralLink.ts`, `GestureEngine.ts`).
*   **Tactical HUD:** A Heads-Up Display that renders contextual information as dynamic overlays directly on the design canvas. This feature is utilized to present AI-generated tips, warnings, and detailed component data (`TacticalHUD.tsx`, `HUDContext.tsx`).
*   **Autonomy Settings:** A user-configurable ruleset that dictates which types of `ActionIntent` the AI is permitted to execute automatically versus those requiring explicit user confirmation. This mechanism provides a crucial layer of safety and control over the AI's operational capabilities (`useAutonomySettings.ts`).

## Data Persistence & State Management
The application employs a local-first architecture, relying exclusively on client-side storage mechanisms for data persistence.

*   **Primary Data Storage (IndexedDB):** Structured and potentially large datasets are stored in IndexedDB. The `storage.ts` service defines several object stores:
    *   `conversations`: Stores metadata related to chat histories.
    *   `messages`: Stores individual chat messages, represented as `EnhancedChatMessage`.
    *   `actions`: Maintains a log of executed actions, forming the basis for undo/redo functionality (`ActionRecord`).
    *   `inventory`: Caches the user's library of `ElectronicComponent`s.
    *   `parts`: Stores binary FZPZ file data (`ArrayBuffer`) and cached SVG visuals for custom components (`partStorageService.ts`).
    *   `profiles`: Manages various user profiles (`userProfileService.ts`).

*   **Version Control (isomorphic-git):** The application integrates a local Git repository within the browser's file system, facilitated by `lightning-fs`. The `gitService.ts` is responsible for creating versioned snapshots of the diagram and inventory, enabling a "Time Machine" feature for navigating project history (`ProjectTimeline.tsx`).

*   **Configuration & Session Storage (localStorage):** Simple key-value data, user preferences, and session-specific information are stored in `localStorage`. This includes the Google Gemini API key (`apiKeyStorage.ts`), layout preferences (`LayoutContext.tsx`), and the identifier of the currently active user profile.

*   **State Management (React Context):** Application state is managed through a suite of React Context providers, including `DiagramProvider`, `InventoryProvider`, `LayoutProvider`, and `ConversationProvider`. There is no evidence of a dedicated, external state management library like Redux or Zustand.

## External Dependencies & APIs
The application integrates with several critical external services and libraries to deliver its core functionality.

*   **Google Gemini:** This serves as the central external AI service, powering all generative capabilities. The application utilizes the `@google/genai` SDK to interact with various Gemini models for tasks such as chat, vision analysis, code generation (particularly for 3D models), and more. The `services/gemini/` directory houses a modular client and feature-specific functions.
*   **MediaPipe:** Employed for the "Neural Link" gesture control feature. The `@mediapipe/tasks-vision` library operates within a Web Worker (`gestureWorker.js`) to process camera frames and detect hand landmarks, which are then interpreted by the `GestureEngine.ts` for gesture recognition.
*   **Y.js / WebRTC:** The application includes dependencies for real-time collaboration (`yjs`, `y-webrtc`). The `collabService.ts` implements the logic for joining collaborative rooms and synchronizing diagram state between multiple peers, although the signaling server appears to be a local placeholder implementation.

## Configuration, Deployment & Environment
*   **Configuration:**
    *   The primary user-facing configuration is the Google Gemini API key, which is stored in `localStorage`.
    *   A `ConfigPortal.tsx` component allows users to export and import the entire application state (including UI settings, AI configurations, etc.) as a YAML file, managed by `configManager.ts`.
    *   The `.claude/` directory contains specific settings and hooks for development and integration with Anthropic's Claude AI assistant, including a script to synchronize task status with an external system referred to as "BrainGrid".

*   **CI/CD & Automation:**
    *   Based on the provided files, no explicit CI/CD pipeline configuration files (e.g., `.github/workflows`, `.gitlab-ci.yml`) are present.
    *   Automation scripts are located in the `scripts/` directory for tasks such as building a parts manifest from FZPZ files (`build-parts-manifest.ts`) and executing a comprehensive audit (`run-omni-audit.ts`).

*   **Build & Deployment Strategy:**
    *   The project is structured as a single-page application, built using Vite, as configured in `vite.config.ts`.
    *   The build process is initiated via the `vite build` command.
    *   It is configured as a Progressive Web App (PWA) through `vite-plugin-pwa`, enabling offline functionality and installability.
    *   The presence of `playwright.config.ts` and associated screenshot scripts indicates a strategy of utilizing Playwright for visual regression testing and generating a catalog of UI components.

## Technology Stack
*   **Languages & Runtimes:**
    *   TypeScript (version ~5.8.2)
    *   JavaScript (ES2022)
    *   Python (for verification scripts)
    *   Node.js (for scripting and tooling, version unknown)

*   **Frameworks & Libraries (Frontend):**
    *   React (version 19.2.3)
    *   Vite (version 6.2.0)
    *   Tailwind CSS (version 4.1.18)
    *   Framer Motion (version 12.29.0)
    *   Three.js (version 0.182.0)
    *   Recharts (version 3.7.0)
    *   i18next (version 25.8.0)

*   **Testing:**
    *   Vitest (version 4.0.16)
    *   Playwright (version 1.57.0)
    *   React Testing Library (version 16.3.1)
    *   JSDOM (version 27.4.0)

*   **Data Persistence (Client-Side):**
    *   IndexedDB (via direct browser API)
    *   localStorage (via direct browser API)
    *   isomorphic-git (version 1.36.2) with lightning-fs (version 4.6.2)

*   **External Services & APIs:**
    *   Google Gemini (client: `@google/genai` 1.34.0)
    *   MediaPipe (client: `@mediapipe/tasks-vision` 0.10.32)

*   **Collaboration:**
    *   Y.js (version 13.6.29)
    *   y-webrtc (version 10.3.0)

*   **Tooling & Linting:**
    *   ESLint (version 9.39.2)
    *   Prettier (version 3.7.4)
    *   PostCSS (version 8.5.6)