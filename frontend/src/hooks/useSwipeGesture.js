import { useEffect, useRef } from 'react';

/**
 * A hook to detect swipe gestures on touch devices
 * @param {Object} options - Configuration options
 * @param {Function} options.onSwipeLeft - Callback for left swipe
 * @param {Function} options.onSwipeRight - Callback for right swipe
 * @param {number} options.threshold - Minimum distance for a swipe (px)
 * @param {number} options.timeout - Maximum time for a swipe (ms)
 * @returns {Object} - Ref to attach to the element
 */
const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  timeout = 300
}) => {
  const elementRef = useRef(null);

  useEffect(() => {
    // Always define these variables and functions
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e) => {
      if (!e.touches || e.touches.length === 0) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const handleTouchEnd = (e) => {
      if (!e.changedTouches || e.changedTouches.length === 0) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();
      const deltaTime = endTime - startTime;

      // Only register as a swipe if it's within the timeout
      if (deltaTime > timeout) return;

      const deltaX = endX - startX;
      const deltaY = endY - startY;

      // Ensure the swipe is more horizontal than vertical
      if (Math.abs(deltaX) < Math.abs(deltaY)) return;

      // Check if the swipe distance exceeds the threshold
      if (Math.abs(deltaX) >= threshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
    };

    // Get the element from the ref
    const element = elementRef.current;

    // Only add event listeners if we have an element
    if (element) {
      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchend', handleTouchEnd);

      // Return cleanup function
      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    }

    // Always return a cleanup function, even if empty
    return () => {};
  }, [onSwipeLeft, onSwipeRight, threshold, timeout]);

  return elementRef;
};

export default useSwipeGesture;
