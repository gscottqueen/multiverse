import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import Record from 'videojs-record/dist/videojs.record.js';
import RecordRTC from 'recordrtc';
import 'webrtc-adapter';
import { videoJsOptions } from './video-js-config'
import 'video.js/dist/video-js.min.css';
import 'videojs-record/dist/css/videojs.record.css';
import './video.css'

const Video = () =>  {
  const videoNodeElement = useRef(null)

  useEffect(() => {
    const videoNode = videoNodeElement.current
    console.log(videoNode)
    const player = videojs(videoNode, videoJsOptions, () => {
          // print version information at startup
          const version_info = 'Using video.js ' + videojs.VERSION +
              ' with videojs-record ' + videojs.getPluginVersion('record') +
              ' and recordrtc ' + RecordRTC.version;
          videojs.log(version_info);
          })
            // device is ready
        player.on('deviceReady', () => {
            console.log('device is ready!');
        });

        // user clicked the record button and started recording
        player.on('startRecord', () => {
            console.log('started recording!');
        });

        // user completed recording and stream is available
        player.on('finishRecord', () => {
            // recordedData is a blob object containing the recorded data that
            // can be downloaded by the user, stored on server etc.
            console.log('finished recording: ', player.recordedData);
        });

        // error handling
        player.on('error', (element, error) => {
            console.warn(error, element);
        });

        player.on('deviceError', () => {
            console.error('device error:', player.deviceErrorCode);
        });
    return () => {
      // player.dispose();
    };
  }, [])

  return (
    <div data-vjs-player>
      <video
        id="myVideo"
        ref={videoNodeElement}
        className="video-js vjs-default-skin"
        playsInline></video>
    </div>
  )
}

export default Video
