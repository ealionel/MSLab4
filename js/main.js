/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

const snapshotButton = document.querySelector("button#snapshot");
const filterSelect = document.querySelector("select#filter");

// Put variables in global scope to make them available to the browser console.

const video = document.querySelector("video");
const snapshotCanvas = document.querySelector("#snapshotCanvas");
const videoCanvas = document.querySelector("#videoCanvas");

videoCanvas.width = 1280;
videoCanvas.height = 720;

snapshotCanvas.width = 640;
snapshotCanvas.height = 480;

window.video = video;
window.snapshotCanvas = snapshotCanvas;
window.videoCanvas = videoCanvas;

snapshotButton.onclick = function () {
  snapshotCanvas.className = filterSelect.value;
  snapshotCanvas
    .getContext("2d")
    .drawImage(videoCanvas, 0, 0, snapshotCanvas.width, snapshotCanvas.height);
};

filterSelect.onchange = function () {
  videoCanvas.className = filterSelect.value;
};

const constraints = {
  audio: false,
  video: true,
};

function applyCanny(src, parameters) {}

filters = {
  canny: (src, parameters) => {
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    cv.Canny(src, src, 50, 100, 3, false);
    cv.cvtColor(src, src, cv.COLOR_GRAY2RGBA, 0);
  },
};

const filtersList = [
  {
    value: "none",
    name: "None",
  },
  {
    value: "blur",
    name: "Blur",
  },
  {
    value: "grayscale",
    name: "Grayscale",
  },
  {
    value: "invert",
    name: "Invert",
  },
  {
    value: "sepia",
    name: "Sepia",
  },
  {
    value: "canny",
    name: "Canny",
    handler: filters.canny,
  },
];

function initFilters(selectElement) {
  for (let filter of filtersList) {
    const option = document.createElement("option");
    option.setAttribute("value", filter.value);
    option.innerHTML = filter.name;

    selectElement.appendChild(option);
  }
}

initFilters(filterSelect);

cv["onRuntimeInitialized"] = () => {
  function handleSuccess(stream) {
    window.stream = stream; // make stream available to browser console
    video.srcObject = stream;

    const [streamTrack] = stream.getVideoTracks();

    const { width, height } = streamTrack.getSettings();

    video.height = height;
    video.width = width;

    console.log(width, height);

    render();
  }

  function render() {
    let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    let cap = new cv.VideoCapture(video);

    cap.read(src);

    const currentFilter = filterSelect.value;

    if (currentFilter == "canny") {
      filters.canny(src);
    }

    cv.imshow("videoCanvas", src);

    src.delete();
    window.requestAnimationFrame(render);
  }

  function handleError(error) {
    console.error(
      "navigator.MediaDevices.getUserMedia error: ",
      error.message,
      error.name
    );
  }

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(handleSuccess)
    .catch(handleError);
};
