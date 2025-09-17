let video = null;

async function startLivenessCheck() {
  video = document.getElementById("webcam");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    document.getElementById("livenessResult").innerText =
      "✅ Webcam started, please move your head or blink";

    detectLiveness(video);
  } catch (err) {
    document.getElementById("livenessResult").innerText = "❌ Camera access denied.";
    console.error("Error accessing webcam:", err);
  }
}

function detectLiveness(videoElement) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  let lastFrame = null;
  let movementCount = 0;

  function checkFrame() {
    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      requestAnimationFrame(checkFrame);
      return;
    }

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const currentFrame = context.getImageData(0, 0, canvas.width, canvas.height);

    if (lastFrame) {
      let diff = 0;
      for (let i = 0; i < currentFrame.data.length; i += 20) { // skip pixels for speed
        diff += Math.abs(currentFrame.data[i] - lastFrame.data[i]);
      }

      if (diff > 20000) { // 🔹 lowered threshold
        movementCount++;
      }
    }

    lastFrame = currentFrame;

    if (movementCount > 1) { // 🔹 easier condition
      document.getElementById("livenessResult").innerText =
        "✅ Liveness Verified (movement detected)";
      return;
    }

    requestAnimationFrame(checkFrame);
  }

  requestAnimationFrame(checkFrame);
}
