export const videoJsOptions = {
  controls: true,
  width: 320,
  height: 240,
  fluid: false,
  bigPlayButton: false,
  controlBar: {
      volumePanel: false
  },
  plugins: {
    record: {
      audio: false,
      video: true,
      maxLength: 10,
      displayMilliseconds: false,
      debug: true
    }
  }
};
