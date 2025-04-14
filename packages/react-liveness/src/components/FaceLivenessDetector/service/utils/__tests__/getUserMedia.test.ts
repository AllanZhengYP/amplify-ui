import { getUserMedia } from '../getUserMedia';

describe('getUserMedia', () => {
  const mockGetUserMedia = jest.fn();
  beforeEach(() => {
    const mockNavigatorMediaDevices = {
      getUserMedia: mockGetUserMedia,
    };
    Object.defineProperty(window.navigator, 'mediaDevices', {
      writable: true,
      value: mockNavigatorMediaDevices,
    });
  });

  it('should prevent concurrent call with same parameters', async () => {
    mockGetUserMedia.mockImplementation(
      async (constraints: MediaTrackConstraints) => {
        return `USER_STREAM_${JSON.stringify(constraints)}`;
      }
    );
    const constraints1 = { frameRate: 15 };
    const constraints2 = { frameRate: 20 };
    const result = await Promise.all([
      getUserMedia(constraints1),
      getUserMedia(constraints1),
      getUserMedia(constraints2)
    ]);
    expect(result).toStrictEqual([
      `USER_STREAM_${JSON.stringify({video: constraints1, audio: false})}`,
      `USER_STREAM_${JSON.stringify({video: constraints1, audio: false})}`,
      `USER_STREAM_${JSON.stringify({video: constraints2, audio: false})}`,
    ]);
    expect(mockGetUserMedia).toHaveBeenCalledTimes(2);
  });
});
