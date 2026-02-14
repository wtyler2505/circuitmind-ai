# UI/UX Audit Quick Reference

## 🔴 Critical Issues (Fix First)

### 1. Accessibility Blockers
```css
/* ADD THIS to your global CSS or Tailwind config */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 2. Icon-Only Buttons
```tsx
// ❌ BAD
<button onClick={handleClick}>
  <TrashIcon />
</button>

// ✅ GOOD
<button 
  onClick={handleClick}
  aria-label="Delete item"
  title="Delete item"
>
  <TrashIcon />
</button>
```

### 3. Keyboard Support for Drag-and-Drop
```tsx
// Add to draggable components
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    // Activate drag mode or show positioning controls
  }
  // Arrow keys for positioning
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
    // Move component by grid units
  }
};
```

## 🟡 High Priority Fixes

### 4. Add Alt Text to Images
```tsx
// Files needing alt text:
// - components/ChatMessage.tsx:273
// - components/layout/AppHeader.tsx:78
// - components/ComponentEditorModal.tsx:442, 891
// - components/inventory/InventoryItem.tsx:67
// - components/Inventory.tsx:552
// - components/AssistantSidebar.tsx:103

// Example fix:
<img src={logoUrl} alt="CircuitMind AI Logo" />
<img src={componentImg} alt={`${component.name} component icon`} />
```

### 5. Color + Icon for Status
```tsx
// ❌ BAD (color only)
<div className="text-green-500">Success</div>

// ✅ GOOD (color + icon + text)
<div className="flex items-center gap-1 text-green-500">
  <CheckCircleIcon className="w-4 h-4" />
  <span>Success</span>
</div>
```

### 6. Responsive Text Sizes
```tsx
// ❌ BAD (too small on mobile)
<p className="text-xs">Important information</p>

// ✅ GOOD (readable on all devices)
<p className="text-sm md:text-base">Important information</p>
```

### 7. Responsive Widths
```tsx
// ❌ BAD (causes horizontal scroll)
<div className="w-[500px]">Content</div>

// ✅ GOOD (responsive)
<div className="w-full max-w-md">Content</div>
```

### 8. Consistent Focus Indicators
```tsx
// Add to tailwind.config.js
module.exports = {
  theme: {
    extend: {
      // Standardize focus styles
    }
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class', // only apply to .form-input etc
    }),
  ]
}

// Or create utility class
// .focus-standard { @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 }
```

## 🟢 Medium Priority Improvements

### 9. SVG Accessibility
```tsx
// ❌ BAD
<svg>...</svg>

// ✅ GOOD
<svg role="img" aria-label="Circuit diagram showing LED connection">
  <title>LED Circuit</title>
  <desc>A circuit diagram showing an LED connected to a resistor and battery</desc>
  ...
</svg>
```

### 10. Modal Accessibility
```tsx
// Required for all modals:
import { useEffect, useRef } from 'react';

function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store current focus
      returnFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus modal
      modalRef.current?.focus();
      
      // Trap focus
      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          // Implement focus trap logic
        }
      };
      
      document.addEventListener('keydown', handleTab);
      return () => document.removeEventListener('keydown', handleTab);
    } else {
      // Return focus on close
      returnFocusRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <h2 id="modal-title">Modal Title</h2>
      {children}
    </div>
  );
}
```

## Testing Checklist

### Automated
- [ ] Install jest-axe: `npm i -D @axe-core/react jest-axe`
- [ ] Add axe tests to existing test suites
- [ ] Run `npm test` and fix violations

### Manual - Keyboard
- [ ] Can reach all interactive elements with Tab
- [ ] Tab order is logical
- [ ] Enter/Space activates buttons
- [ ] Esc closes modals/menus
- [ ] Arrow keys work in lists/menus

### Manual - Screen Reader
- [ ] Test with NVDA (Windows) or VoiceOver (Mac)
- [ ] All images announce meaningful text
- [ ] Forms have labels
- [ ] Dynamic changes are announced
- [ ] Heading structure makes sense

### Manual - Mobile
- [ ] Test on iPhone 12+ (Safari)
- [ ] Test on Android (Chrome)
- [ ] Touch targets ≥ 44×44px
- [ ] No horizontal scroll at 320px width
- [ ] Pinch-to-zoom works

### Manual - Vision
- [ ] Test with Windows High Contrast
- [ ] Test with browser zoom at 200%
- [ ] Use color blindness simulator
- [ ] Verify WCAG AA contrast ratios

## Browser Support

| Browser | Min Version | Status |
|---------|-------------|--------|
| Chrome | 90+ | ✅ Primary |
| Firefox | 88+ | ✅ Supported |
| Safari | 14+ | ✅ Supported |
| Edge | 90+ | ✅ Supported |
| IE 11 | N/A | ❌ Not supported (Vite/React 18) |

## Priority Order

1. **This Week**: Add reduced-motion, fix semantic HTML
2. **Next Week**: Alt text, color+icons, responsive fixes
3. **Week 3**: Focus styles, loading states, modal traps
4. **Week 4**: Comprehensive testing and validation

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
