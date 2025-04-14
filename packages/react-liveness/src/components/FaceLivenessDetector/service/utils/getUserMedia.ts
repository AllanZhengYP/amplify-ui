/**
 * Creates a wrapper function that deduplicates concurrent calls to an async function.
 * If multiple calls are made while a promise is pending, it returns the same promise
 * instead of creating new ones.
 *
 * Note: the function input object must be JSON.stringify-able.
 */
function deduplicateInvocation<T extends (...args: any[]) => Promise<any>>(
  fn: T
): T {
  // Cache to store results and in-flight promises
  const cache = new Map<string, Promise<any>>();

  // Create a wrapped function with the same signature
  const wrapped = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // Generate a cache key from the arguments
    const key = JSON.stringify(args);

    // If we already have a result or in-flight promise for these args, return it
    if (cache.has(key)) {
      return cache.get(key);
    }

    // Otherwise, call the original function and cache the promise
    const resultPromise = fn(...args);
    cache.set(key, resultPromise);

    try {
      // Wait for the promise to resolve
      const result = await resultPromise;
      return result;
    } finally {
      cache.delete(key);
    }
  };

  // Return the wrapped function with the original function's type
  return wrapped as T;
}

export const getUserMedia = deduplicateInvocation(
  async (constraints: MediaTrackConstraints) => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: constraints,
      audio: false,
    });
    return mediaStream;
  }
);
