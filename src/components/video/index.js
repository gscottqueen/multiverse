import React from 'react'
import './index.css'

const Video = ({id, videoRef, ...props}) => <video
  id={id}
  playsInline
  autoPlay
  muted
  ref={videoRef}
  {...props}/>

export default Video
