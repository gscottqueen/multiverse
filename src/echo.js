import { useEffect, useRef, useState } from 'react';
import { userMediaConfig } from './user-media-config';

const Echo = () =>  {
  const previewElement = useRef(null)
  const recordingElement = useRef(null)
  const echoElement = useRef(null)
  const rippleElement = useRef(null)
  const logElement = useRef(null)
  const [urls, setUrls] = useState([])
  const [number, setNumber] = useState(0)
  const [message, setMessage] = useState('')
  const recordingTimeMS = 3000;

  useEffect(() => {
  const preview = previewElement.current
  const recording = recordingElement.current
  const echo = echoElement.current
  const ripple = rippleElement.current
  // const log = logElement.current

  function wait(delayInMS) {
    return new Promise(resolve => setTimeout(resolve, delayInMS));
  }

  function startRecording(stream, lengthInMS) {
    let recorder = new MediaRecorder(stream);
    let data = [];

    recorder.ondataavailable = event => data.push(event.data);
    recorder.start();
    setMessage(recorder.state + " for " + (lengthInMS/1000) + " seconds...");

    let stopped = new Promise((resolve, reject) => {
      recorder.onstop = resolve;
      recorder.onerror = event => reject(event.name);
    });

    let recorded = wait(lengthInMS).then(
      () => recorder.state === "recording" && recorder.stop()
    );

    return Promise.all([
      stopped,
      recorded
    ])
    .then(() => data);
  }

 function start() {
  navigator.mediaDevices.getUserMedia(userMediaConfig).then(stream => {
      preview.srcObject = stream;
      preview.captureStream = preview.captureStream || preview.mozCaptureStream;
      return new Promise(resolve => preview.onplaying = resolve);
    }).then(() => startRecording(preview.captureStream(), recordingTimeMS))
    .then (recordedChunks => {
      let recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(recordedBlob)
      console.log(url.blob)
      setUrls([urls, url])
      console.log(urls)
      recording.src = urls[urls.length - 1];

      setMessage("Successfully recorded " + recordedBlob.size + " bytes of " +
          recordedBlob.type + " media.");
      setNumber(number + 1)
      console.log(number)
      if (number > 1 ) {
      echo.src = urls[urls.length - 2];
      }

      if (number > 6 ) {
      ripple.src = urls[urls.length - 6];
      }
          console.log(number, urls)
      start()
    })
    .catch((error) => {
      if (error.name === "NotFoundError") {
        setMessage("Camera or microphone not found. Can’t record.");
      } else {
        setMessage(error);
      }
    })
  }

  if (
      document.readyState === "complete" ||
      ( document.readyState !== "loading" &&
        !document.documentElement.doScroll )
  ) {
    start();
  } else {
    document.addEventListener("DOMContentLoaded", start);
  }

  }, [urls, number, setMessage])

  return (
    <>
  <video
    id="preview"
    width="1200"
    autoPlay
    muted
    ref={previewElement}></video>
  <video
    id="recording"
    width="1200"
    autoPlay
    muted
    ref={recordingElement}></video>
  <video
    id="echo"
    width="1200"
    autoPlay
    muted
    ref={echoElement}></video>
  <video
    id="ripple"
    width="1200"
    autoPlay
    muted
    ref={rippleElement}></video>
  <pre id="log" ref={logElement}>{message}</pre>

    </>
  )
}

export default Echo
