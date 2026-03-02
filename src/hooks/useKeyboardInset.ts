import { useState, useEffect, useRef } from 'react';

/**
 * Tracks the height of the on-screen keyboard using VisualViewport API.
 * Returns `keyboardInset` in pixels — the amount of screen covered by the keyboard.
 * Returns 0 on desktop or when keyboard is closed.
 */
export function useKeyboardInset() {
  const [keyboardInset, setKeyboardInset] = useState(0);
  const prevInset = useRef(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      // On mobile, when keyboard opens, visualViewport.height shrinks.
      // The difference between window.innerHeight and vv.height + vv.offsetTop
      // gives us the keyboard height.
      const inset = Math.max(
        0,
        Math.round(window.innerHeight - vv.height - vv.offsetTop)
      );
      prevInset.current = inset;
      setKeyboardInset(inset);
    };

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);

    // Initial check
    update();

    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return { keyboardInset, isKeyboardOpen: keyboardInset > 0 };
}
