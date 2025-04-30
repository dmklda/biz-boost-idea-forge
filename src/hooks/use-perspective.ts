
import { useEffect } from 'react';

/**
 * A hook that adds perspective styles to elements
 * This hook is used to add 3D perspective effects to elements
 */
export function usePerspective() {
  useEffect(() => {
    // Add the perspective styles if they don't exist
    if (!document.getElementById('perspective-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'perspective-styles';
      styleElement.innerHTML = `
        .perspective-3d {
          perspective: 1000px;
        }
        .rotate-y-5 {
          transform: rotateY(5deg);
        }
      `;
      document.head.appendChild(styleElement);
    }
    
    return () => {
      // Clean up - remove styles when no longer needed
      const styleElement = document.getElementById('perspective-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);
}
