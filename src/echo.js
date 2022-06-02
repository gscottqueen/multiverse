import { useEffect, useRef, useState } from "react";
import { userMediaConfig } from "./config/user-media-config";
import { domReady } from "./utilities/domReady";
import { Video } from "./components";
import { Camera } from "@mediapipe/camera_utils";

const Echo = () => {
  const previewElement = useRef(null);
  const recordingElement = useRef(null);
  const [recordingTimeMS, setRecordingTimeMS] = useState(10000);

  useEffect(() => {
    const preview = previewElement.current;
    const recording = recordingElement.current;

    function wait(delayInMS) {
      return new Promise((resolve) => setTimeout(resolve, delayInMS));
    }

    function startRecording(stream, lengthInMS) {
      let recorder = new MediaRecorder(stream);
      let data = [];

      recorder.ondataavailable = (event) => data.push(event.data);
      recorder.start();
      console.log(recorder.state + " for " + lengthInMS / 1000 + " seconds...");

      let stopped = new Promise((resolve, reject) => {
        recorder.onstop = resolve;
        recorder.onerror = (event) => reject(event.name);
      });

      let recorded = wait(lengthInMS).then(
        () => recorder.state === "recording" && recorder.stop()
      );

      return Promise.all([stopped, recorded]).then(() => data);
    }

    function start() {
      navigator.mediaDevices
        .getUserMedia(userMediaConfig)
        .then((stream) => {
          preview.srcObject = stream;
          preview.captureStream =
            preview.captureStream || preview.mozCaptureStream;
          return new Promise((resolve) => (preview.onplaying = resolve));
        })
        .then(() => startRecording(preview.captureStream(), recordingTimeMS))
        .then((recordedChunks) => {
          let recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
          const url = URL.createObjectURL(recordedBlob);
          recordingTimeMS < 15000 && setRecordingTimeMS(recordingTimeMS + 1000)
          recording.src = url;

          console.log(
          "Successfully recorded " +
              recordedBlob.size +
              " bytes of " +
              recordedBlob.type +
              " media."
          );
          start();
        })
        .catch((error) => {
          if (error.name === "NotFoundError") {
            console.log("Camera or microphone not found. CanU+2019t record.");
          } else {
            console.log(error);
          }
        });
    }

    domReady(start);

    const camera = new Camera(preview, {});
    camera.start();
  }, [recordingTimeMS]);

  return (
    <>
      <p
      hidden={recordingTimeMS > 10000}>loading...</p>
      <Video
        id="preview"
        hidden={recordingTimeMS < 11000}
        videoRef={previewElement}
        width={`${window.innerWidth}px`}
        height={`${window.innerHeight}px`}/>
      <Video
        id="recording"
        videoRef={recordingElement}
        width={`${window.innerWidth}px`}
        height={`${window.innerHeight}px`}/>
    </>
  );
};

export default Echo;
