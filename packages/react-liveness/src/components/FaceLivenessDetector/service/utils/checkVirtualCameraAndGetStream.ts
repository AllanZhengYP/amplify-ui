import { LivenessContext } from '../types';
import { isCameraDeviceVirtual, } from './';

/**
 * Creates a wrapper function that deduplicates concurrent calls to an async function.
 * If multiple calls are made while a promise is pending, it returns the same promise
 * instead of creating new ones.
 * 
 * Note: This function **assumes** the concurrent function inputs are the same. The
 * returned promise is the result the the 1st input of the concurrent invocation.
 * This is a simplified implementation to prevent getting camera stream repeatedly.
 */
function deduplicateInvocation<Context extends object, ServiceOutput>(
  fn: (input: Context) => Promise<ServiceOutput>
): (input: Context) => Promise<ServiceOutput> {
  let recentPromise: Promise<ServiceOutput> | null = null;

  const wrapped = async (input: Context): Promise<ServiceOutput> => {
    if (recentPromise) {
      return recentPromise;
    }

    recentPromise = fn(input);

    try {
      const result = await recentPromise;
      return result;
    } finally {
      recentPromise = null;
    }
  };

  return wrapped;
}

export const checkVirtualCameraAndGetStream = deduplicateInvocation(async function _checkVirtualCameraAndGetStream(context: LivenessContext) {
  const { videoConstraints } = context.videoAssociatedParams!;

  const devices = await navigator.mediaDevices.enumerateDevices();
  const realVideoDevices = devices
    .filter((device) => device.kind === 'videoinput')
    .filter((device) => !isCameraDeviceVirtual(device));

  if (!realVideoDevices.length) {
    throw new Error('No real video devices found');
  }

  const existingDeviceId = getLastSelectedCameraId();
  const initialStream = await navigator.mediaDevices.getUserMedia({
    video: {
      ...videoConstraints,
      ...(existingDeviceId ? { deviceId: existingDeviceId } : {}),
    },
    audio: false,
  });

  // Ensure that at least one of the cameras is capable of at least 15 fps
  const tracksWithMoreThan15Fps = initialStream
    .getTracks()
    .filter((track) => {
      const settings = track.getSettings();
      return settings.frameRate! >= 15;
    });

  if (tracksWithMoreThan15Fps.length < 1) {
    throw new Error('No camera found with more than 15 fps');
  }

  // If the initial stream is of real camera, use it otherwise use the first real camera
  const initialStreamDeviceId =
    tracksWithMoreThan15Fps[0].getSettings().deviceId;
  const isInitialStreamFromRealDevice = realVideoDevices.some(
    (device) => device.deviceId === initialStreamDeviceId
  );

  const deviceId = isInitialStreamFromRealDevice
    ? initialStreamDeviceId
    : realVideoDevices[0].deviceId;

  let realVideoDeviceStream = initialStream;
  if (!isInitialStreamFromRealDevice) {
    realVideoDeviceStream = await navigator.mediaDevices.getUserMedia({
      video: {
        ...videoConstraints,
        deviceId: { exact: deviceId },
      },
      audio: false,
    });
  }
  setLastSelectedCameraId(deviceId!);

  return {
    stream: realVideoDeviceStream,
    selectedDeviceId: initialStreamDeviceId,
    selectableDevices: realVideoDevices,
  };
})