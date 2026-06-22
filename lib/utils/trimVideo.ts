export function isTrimSupported(): boolean {
  return (
    typeof document !== "undefined" &&
    typeof HTMLVideoElement !== "undefined" &&
    "captureStream" in HTMLVideoElement.prototype &&
    typeof MediaRecorder !== "undefined"
  );
}

const MIN_BITRATE = 4_000_000;
const MAX_BITRATE = 12_000_000;

// MediaRecorder's default bitrate is well below what phone cameras record
// at, which is why trimmed clips looked noticeably worse than the original
// even though the upload itself is untouched — this estimates a bitrate
// from the actual resolution instead of taking the browser's default.
function estimateBitrate(width: number, height: number): number {
  const bitsPerPixelPerFrame = 0.12;
  const assumedFps = 30;
  const estimate = width * height * assumedFps * bitsPerPixelPerFrame;
  return Math.min(MAX_BITRATE, Math.max(MIN_BITRATE, Math.round(estimate)));
}

// Re-encodes a window of the source video in-browser (via captureStream +
// MediaRecorder) so only the trimmed clip is ever uploaded — the original,
// untrimmed file never leaves the browser.
export function trimVideoFile(
  file: File,
  startTime: number,
  clipDuration = 15,
): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!isTrimSupported()) {
      reject(new Error("Trimming isn't supported in this browser"));
      return;
    }

    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    const cleanup = () => URL.revokeObjectURL(objectUrl);

    video.onloadedmetadata = () => {
      const stream = (
        video as HTMLVideoElement & { captureStream: () => MediaStream }
      ).captureStream();
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const videoBitsPerSecond = estimateBitrate(
        video.videoWidth || 720,
        video.videoHeight || 1280,
      );
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond,
      });
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        cleanup();
        // Recorded with the codec-specific mimeType (for quality), but the
        // resulting File is reported as plain "video/webm" — the codec
        // suffix isn't a real file type and would fail the server's
        // content-type allowlist otherwise.
        resolve(
          new File([new Blob(chunks, { type: mimeType })], "reel.webm", {
            type: "video/webm",
          }),
        );
      };
      recorder.onerror = () => {
        cleanup();
        reject(new Error("Failed to trim video"));
      };

      video.currentTime = startTime;
      video.onseeked = () => {
        video.onseeked = null;
        recorder.start();
        video.play().catch(() => {});
        setTimeout(() => {
          video.pause();
          recorder.stop();
        }, clipDuration * 1000);
      };
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Could not read video file"));
    };
  });
}
