let video = null;

async function startLivenessCheck() {
  video = document.getElementById("webcam");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    document.getElementById("livenessResult").innerText =
      "✅ Webcam started, please move slightly";

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
      let checkedPixels = 0;

      // compare every 50th pixel only → lighter
      for (let i = 0; i < currentFrame.data.length; i += 200) {
        diff += Math.abs(currentFrame.data[i] - lastFrame.data[i]);
        checkedPixels++;
      }

      const avgDiff = diff / checkedPixels;

      // 🔹 much lower threshold for liveness
      if (avgDiff > 5) {
        document.getElementById("livenessResult").innerText =
          "✅ Liveness Verified (movement detected)";
        return; // stop checking once verified
      }
    }

    lastFrame = currentFrame;
    requestAnimationFrame(checkFrame);
  }

  requestAnimationFrame(checkFrame);
}
