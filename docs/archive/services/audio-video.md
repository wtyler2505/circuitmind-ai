# Audio & Video Services

## Live Audio Session (`services/liveAudio.ts`)
Handles the real-time, bi-directional voice conversation with Gemini.

### Connection Flow
1.  **Init**: `LiveSession` class instantiated.
2.  **Connect**: `ai.live.connect` called with `gemini-2.5-flash-native-audio-preview-09-2025`.
3.  **Stream Setup**: `navigator.mediaDevices.getUserMedia` captures mic.
4.  **Worklet Replacement**: We use a `ScriptProcessorNode` (legacy but reliable for this prototype) to intercept raw audio buffer.

### Audio Encoding (Input)
The model expects **PCM 16-bit, 16kHz**.
- Browser gives: Float32 (usually 44.1kHz or 48kHz).
- **Process**:
    1.  Downsample/Resample (conceptually, though currently relying on context config).
    2.  Convert Float32 (-1.0 to 1.0) to Int16 (-32768 to 32767).
    3.  Base64 encode.
    4.  Send via `session.sendRealtimeInput`.

### Audio Decoding (Output)
The model returns **PCM 16-bit, 24kHz**.
- **Process**:
    1.  Base64 decode to bytes.
    2.  Convert Int16 bytes to Float32 for the Web Audio API.
    3.  Create `AudioBuffer` at 24kHz.
    4.  Schedule playback using `nextStartTime` to ensure gapless audio (queuing chunks).

## Video Generation (`generateCircuitVideo`)
- **Model**: `veo-3.1-fast-generate-preview`.
- **Polling**: Veo operations are asynchronous. We implement a `while (!operation.done)` loop with a 5-second polling interval to wait for the video to generate.
- **Auth Hack**: The returned video URI requires the API Key to be appended (`${uri}&key=${API_KEY}`) to be playable in a standard HTML `<video>` tag.
