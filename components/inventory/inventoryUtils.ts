import React from 'react';

// Helper to resize images
export const resizeImage = (base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

// Helper for type icons
export const getTypeIcon = (type: string) => {
  const iconPath = `/assets/ui/icon-${type}.png`;
  // We return an IMG element logic that can be used in JSX
  // However, since this was returning JSX, we need to return React Element.
  // The onError handler needs to attach to the DOM element.
  return React.createElement('img', {
    src: iconPath,
    alt: type,
    className: "w-full h-full object-contain p-1",
    onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const target = e.target as HTMLImageElement;
      target.style.display = 'none';
      const parent = target.parentElement;
      if (parent) {
        // Check if span already exists to prevent duplicates
        if (!parent.querySelector('span.fallback-icon')) {
            const span = document.createElement('span');
            span.className = 'text-[10px] font-mono text-slate-600 font-bold fallback-icon';
            span.innerText = type.charAt(0).toUpperCase();
            parent.appendChild(span);
        }
      }
    }
  });
};
