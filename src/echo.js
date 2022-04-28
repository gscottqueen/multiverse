import { useEffect, useRef, useState } from "react";
import { userMediaConfig } from "./config/user-media-config";
import { domReady } from "./utilities/domReady";
import { Video, Log } from "./components";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import { Camera } from "@mediapipe/camera_utils";

const Echo = () => {
  const previewElement = useRef(null);
  const recordingElement = useRef(null);
  const canvasElement = useRef(null);
  const [urls, setUrls] = useState([]);
  const [message, setMessage] = useState("");
  const [recordingTimeMS, setRecordingTimeMS] = useState(1000);

  useEffect(() => {
    const preview = previewElement.current;
    const recording = recordingElement.current;
    const canvas = canvasElement.current;
    const canvasCtx = canvas.getContext("2d");
    const selfieSegmentation = new SelfieSegmentation({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
      },
    });

    selfieSegmentation.setOptions({
      modelSelection: 1,
      selfieMode: true,
      smoothSegmentation: true
    });

    function wait(delayInMS) {
      return new Promise((resolve) => setTimeout(resolve, delayInMS));
    }

    function startRecording(stream, lengthInMS) {
      let recorder = new MediaRecorder(stream);
      let data = [];

      recorder.ondataavailable = (event) => data.push(event.data);
      recorder.start();
      setMessage(recorder.state + " for " + lengthInMS / 1000 + " seconds...");

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
          setUrls([urls, url]);
          recordingTimeMS < 15000 && setRecordingTimeMS(recordingTimeMS + 1000)
          recording.src = urls[urls.length - 1];

          setMessage(
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
            setMessage("Camera or microphone not found. Can’t record.");
          } else {
            setMessage(error);
          }
        });
    }

    domReady(start);

    function onResults(results) {
      if (recordingTimeMS > 3000 && results.segmentationMask) {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        canvasCtx.drawImage(
          results.segmentationMask,
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Only overwrite existing pixels.
        canvasCtx.globalCompositeOperation = "source-out";
        canvasCtx.fillStyle = "#00FF00";
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        // Only overwrite missing pixels.
        canvasCtx.globalCompositeOperation = "destination-in"
        canvasCtx.drawImage(results.image, 0, 0, canvas.width, canvas.height)

        canvasCtx.drawImage(
          results.segmentationMask,
          0,
          0,
          canvas.width,
          canvas.height
        )

        canvasCtx.restore();
      } else {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    selfieSegmentation.onResults(onResults);

    const camera = new Camera(preview, {
      onFrame: async () => {
        await selfieSegmentation.send({ image: preview });
      },
      width: canvas.width,
      height: canvas.height,
    });
    camera.start();
  }, [recordingTimeMS, setMessage, urls]);

  return (
    <>
      <Video
        id="preview"
        hidden={recordingTimeMS < 2000}
        videoRef={previewElement}
        width={`${window.innerWidth}px`}
        height={`${window.innerHeight}px`}/>
      <Video
        id="recording"
        videoRef={recordingElement}
        width={`${window.innerWidth}px`}
        height={`${window.innerHeight}px`}/>
      <canvas
        hidden={recordingTimeMS > 2000}
        className="output_canvas"
        width={`${window.innerWidth}px`}
        height={`${window.innerHeight}px`}
        ref={canvasElement}
      ></canvas>
      <Log message={message} />
    </>
  );
};

export default Echo;
