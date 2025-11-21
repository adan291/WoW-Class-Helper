import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Optimized state hook with debouncing
 * Prevents excessive re-renders by debouncing state updates
 */
export const useOptimizedState = <T,>(
  initialValue: T,
  debounceMs = 300
): [T, (value: T | ((prev: T) => T)) => void] => {
  const [state, setState] = useState<T>(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const pendingValueRef = useRef<T | ((prev: T) => T) | null>(null);

  const setOptimizedState = useCallback((value: T | ((prev: T) => T)) => {
    pendingValueRef.current = value;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState(pendingValueRef.current as T | ((prev: T) => T));
      pendingValueRef.current = null;
    }, debounceMs);
  }, [debounceMs]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, setOptimizedState];
};

/**
 * Optimized state hook with throttling
 * Limits state updates to a maximum frequency
 */
export const useThrottledState = <T,>(
  initialValue: T,
  throttleMs = 300
): [T, (value: T | ((prev: T) => T)) => void] => {
  const [state, setState] = useState<T>(initialValue);
  const lastUpdateRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const pendingValueRef = useRef<T | ((prev: T) => T) | null>(null);

  const setThrottledState = useCallback((value: T | ((prev: T) => T)) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;

    if (timeSinceLastUpdate >= throttleMs) {
      setState(value);
      lastUpdateRef.current = now;
      pendingValueRef.current = null;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } else {
      pendingValueRef.current = value;

      if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          setState(pendingValueRef.current as T | ((prev: T) => T));
          lastUpdateRef.current = Date.now();
          pendingValueRef.current = null;
          timeoutRef.current = undefined;
        }, throttleMs - timeSinceLastUpdate);
      }
    }
  }, [throttleMs]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, setThrottledState];
};

/**
 * Optimized state hook with memoization
 * Only updates if value actually changed
 */
export const useMemoizedState = <T,>(
  initialValue: T,
  compareFn?: (prev: T, next: T) => boolean
): [T, (value: T | ((prev: T) => T)) => void] => {
  const [state, setState] = useState<T>(initialValue);

  const setMemoizedState = useCallback((value: T | ((prev: T) => T)) => {
    setState((prevState) => {
      const nextState = typeof value === 'function' ? (value as (prev: T) => T)(prevState) : value;

      // Use custom compare function if provided
      if (compareFn) {
        return compareFn(prevState, nextState) ? prevState : nextState;
      }

      // Default shallow comparison
      return prevState === nextState ? prevState : nextState;
    });
  }, [compareFn]);

  return [state, setMemoizedState];
};

/**
 * Optimized state hook with lazy initialization
 * Initializes state only when needed
 */
export const useLazyState = <T,>(
  initializer: () => T
): [T, (value: T | ((prev: T) => T)) => void] => {
  const [state, setState] = useState<T>(() => initializer());

  return [state, setState];
};
