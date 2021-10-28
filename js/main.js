const video = document.getElementById("video");

let Ages = [];


// This basically loades all the models before starting the video.
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  faceapi.nets.ageGenderNet.loadFromUri("/models")
]).then(startVideo);


// This basically takes video from webcam and show it on the "video" tag.
function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => (video.srcObject = stream),
    err => console.error(err)
  );
}

video.addEventListener("playing", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {

    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks() // To detect face landmarks
      .withFaceExpressions() // To detect face expressions
      .withAgeAndGender();   // To detect age

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    // To clear the previously made rectangle
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    // Calculating age every 1000 ms
    const age = resizedDetections[0].age;
    const calculatedAge = agepredictions(age);

    const bottomRight = {
      x: resizedDetections[0].detection.box.bottomRight.x - 50,
      y: resizedDetections[0].detection.box.bottomRight.y
    };

    new faceapi.draw.DrawTextField(
      [`${faceapi.utils.round(calculatedAge, 0)} years`],
      bottomRight
    ).draw(canvas);

  }, 1000);
});


function agepredictions(age) {
  Ages = [age].concat(Ages).slice(0, 30);

  const calculatedAge =
    Ages.reduce((total, a) => total + a) / Ages.length;

  return calculatedAge;
}





