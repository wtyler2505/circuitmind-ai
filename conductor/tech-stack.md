# Tech Stack

## Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4) + PostCSS
- **State Management:** React Context API
- **Animations:** Framer Motion

## Visualization & Graphics
- **3D Engine:** Three.js
- **Canvas:** Direct Three.js integration (Custom `ThreeViewer`)
- **Icons:** Lucide React / Custom SVG / Custom-generated high-fidelity assets

## Data & Persistence
- **Storage:** IndexedDB / LocalStorage
- **Sync & Versioning:** Isomorphic-git + Lightning-FS
- **Exports:** jsPDF (PDF) + PapaParse (CSV)
- **Networking:** Web Serial API (Hardware) + WebRTC (P2P Sync)
- **Utilities:** QRCode.react (Pairing)

## AI & Intelligence
- **LLM Provider:** Google Gemini (via `@google/genai`)
- **Models:**
  - Logic/Diagrams: `gemini-2.5-pro`
  - Chat/Fast Tasks: `gemini-2.5-flash`
  - Video: `veo-3.1`
- **Vector Search:** `client-vector-search`

## Testing
- **Unit:** Vitest
- **E2E/Visual:** Playwright
- **Library:** React Testing Library
