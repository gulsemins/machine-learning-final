const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 900;

let ballPosition = { x: 100, y: 100 };
const boxPosition = { x: 50, y: canvas.height / 2 };
const ballRadius = 25;
const boxSize = 100;

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the ball
  ctx.beginPath();
  ctx.arc(
    canvas.width - ballPosition.x,
    ballPosition.y,
    ballRadius,
    0,
    Math.PI * 2
  );
  ctx.lineWidth = 4;
  ctx.fillStyle = "blue";
  ctx.fill(); //Draw the border of the circle
  ctx.closePath();

  // Draw the box
  ctx.beginPath();
  ctx.rect(boxPosition.x, boxPosition.y, boxSize + 50, boxSize + 50);
  ctx.strokeStyle = "green";
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.closePath();
}

drawScene();

async function setupHandPoseDetection() {
  const model = handPoseDetection.SupportedModels.MediaPipeHands;
  const detectorConfig = {
    runtime: "mediapipe", // or 'tfjs'
    solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/hands`,
  };

  const detector = await handPoseDetection.createDetector(
    model,
    detectorConfig
  );

  video = await setupCamera();
  video.play();

  detectHands(detector);
}

async function setupCamera() {
  const video = document.createElement("video");
  video.width = 900;
  video.height = 900;

  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });
  video.srcObject = stream;

  await new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });

  return video;
}

async function detectHands(detector) {
  const hands = await detector.estimateHands(video);

  if (hands.length > 0) {
    const hand = hands[0];
    const keypoints = hand.keypoints;

    // Use the index finger tip (keypoint 8) to control the ball
    const indexFingerTip = keypoints.find((k) => k.name === "index_finger_tip");
    if (indexFingerTip) {
      // Mapping the video coordinates to canvas coordinates
      ballPosition.x = (indexFingerTip.x / video.videoWidth) * canvas.width;
      ballPosition.y = (indexFingerTip.y / video.videoHeight) * canvas.height;
    }
  }

  drawScene();
  requestAnimationFrame(() => detectHands(detector));
}

setupHandPoseDetection();
