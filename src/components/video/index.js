import React from 'react'
import './index.css'

const Video = ({id, videoRef}) => <video
  id={id}
  width="1200"
  playsInline
  autoPlay
  muted
  ref={videoRef}/>

export default Video
