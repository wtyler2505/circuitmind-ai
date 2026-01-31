import React, { useMemo } from 'react';
import { motion, useSpring } from 'framer-motion';
import { HandLandmark } from '../../services/gesture/GestureEngine';

interface NeuralCursorProps {
  landmarks: HandLandmark[] | null;
  isEngaged: boolean;
  containerRect: DOMRect | null;
}

export const NeuralCursor: React.FC<NeuralCursorProps> = ({ 
  landmarks, 
  isEngaged, 
  containerRect 
}) => {
  // Use springs for smooth movement
  const springConfig = { damping: 25, stiffness: 200, restDelta: 0.001 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  // Map normalized hand coordinates to container pixels
  // Note: MediaPipe X is mirrored for webcam, we might need to flip it
  useMemo(() => {
    if (landmarks && landmarks.length > 0 && containerRect) {
      const indexFinger = landmarks[8];
      const targetX = (1 - indexFinger.x) * containerRect.width;
      const targetY = indexFinger.y * containerRect.height;
      x.set(targetX);
      y.set(targetY);
    }
  }, [landmarks, containerRect, x, y]);

  if (!landmarks || !isEngaged) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[100] overflow-hidden">
      {/* Main Glow Dot */}
      <motion.div
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        className="absolute w-6 h-6 rounded-full bg-neon-cyan shadow-[0_0_15px_#00f3ff] mix-blend-screen"
      >
        <div className="absolute inset-0 rounded-full border border-white animate-ping opacity-50" />
      </motion.div>

      {/* Connection lines between landmarks (Holographic hand) */}
      <svg className="absolute inset-0 w-full h-full opacity-30">
        <HandOutline landmarks={landmarks} containerRect={containerRect} />
      </svg>
    </div>
  );
};

const HandOutline: React.FC<{ landmarks: HandLandmark[], containerRect: DOMRect | null }> = ({ landmarks, containerRect }) => {
  if (!containerRect) return null;

  const points = landmarks.map(l => ({
    x: (1 - l.x) * containerRect.width,
    y: l.y * containerRect.height
  }));

  // Hand connections (MediaPipe standard)
  const connections = [
    [0, 1, 2, 3, 4], // Thumb
    [0, 5, 6, 7, 8], // Index
    [9, 10, 11, 12], // Middle
    [13, 14, 15, 16], // Ring
    [0, 17, 18, 19, 20], // Pinky
    [5, 9, 13, 17] // Palm
  ];

  return (
    <g stroke="#00f3ff" strokeWidth="1" fill="none">
      {connections.map((chain, i) => (
        <polyline
          key={i}
          points={chain.map(idx => `${points[idx].x},${points[idx].y}`).join(' ')}
        />
      ))}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2" fill="#00f3ff" />
      ))}
    </g>
  );
};
