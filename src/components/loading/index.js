import React from 'react'
import './index.css'

const Loading = ({ hidden, ...props }) =>
  <div
    className="loading"
    hidden={hidden}
    {...props}
  >
    loading
    <span>.</span>
    <span>.</span>
    <span>.</span>
  </div>

export default Loading
