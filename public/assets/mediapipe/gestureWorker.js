// Classic WebWorker for MediaPipe Gesture Tracking
// Uses the CJS bundle with a shim for CommonJS.

// Shim for CommonJS environment in Classic Worker
self.exports = {};
self.module = { exports: self.exports };

console.log("[GestureWorker] Loading MediaPipe classic bundle...");
importScripts("/assets/mediapipe/vision_bundle_classic.js");

const FilesetResolver = self.module.exports.FilesetResolver || self.exports.FilesetResolver;
const HandLandmarker = self.module.exports.HandLandmarker || self.exports.HandLandmarker;

let handLandmarker = null;

const initHandLandmarker = async () => {
  try {
    const assetPath = "/assets/mediapipe";
    console.log("[GestureWorker] Initializing MediaPipe with assetPath:", assetPath);
    
    if (!FilesetResolver || !HandLandmarker) {
      console.error("[GestureWorker] MediaPipe objects not found. Exports:", Object.keys(self.exports));
      throw new Error("MediaPipe objects (FilesetResolver/HandLandmarker) not found in exports.");
    }
    
    const vision = await FilesetResolver.forVisionTasks(assetPath);
    
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: assetPath + "/hand_landmarker.task",
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numHands: 2
    });
    console.log("[GestureWorker] HandLandmarker created successfully");
  } catch (error) {
    console.error("[GestureWorker] MediaPipe Init Failed:", error);
    throw new Error("MediaPipe Init Failed: " + error.message);
  }
};

self.onmessage = async (event) => {
  const { type, payload } = event.data;

  if (type === "INIT") {
    try {
      await initHandLandmarker();
      self.postMessage({ type: "INIT_COMPLETE" });
    } catch (error) {
      self.postMessage({ type: "ERROR", payload: error.message });
    }
    return;
  }

  if (type === "PROCESS_FRAME") {
    if (!handLandmarker) return;

    const { imageBitmap, timestamp } = payload;
    
    try {
      const results = handLandmarker.detectForVideo(imageBitmap, timestamp);
      self.postMessage({ 
        type: "LANDMARKS", 
        payload: {
          landmarks: results.landmarks,
          worldLandmarks: results.worldLandmarks,
          handedness: results.handednesses,
          timestamp
        }
      });
    } catch (error) {
      self.postMessage({ type: "ERROR", payload: error.message });
    } finally {
      imageBitmap.close(); 
    }
  }
};