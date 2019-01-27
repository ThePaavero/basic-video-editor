import React, {Component} from 'react'

export default class Editor extends Component {

  constructor() {
    super()
    this.state = {
      // videoFilePath: null
      videoFilePath: 'C:\\Users\\pekka\\Videos\\Captures\\SJ2D.mp4',
      segmentsToKeep: []
    }
    this.getVideoFilePathPrompt = this.getVideoFilePathPrompt.bind(this)
    this.getContents = this.getContents.bind(this)
    this.onRecordKeyDown = this.onRecordKeyDown.bind(this)
  }

  getVideoFilePathPrompt() {
    return (
      <div className="setVideoFilePathWrapper">
        <label>
          <span>Please enter the path to your video file:</span>
          <input type="text" onKeyDown={e => {
            if (e.key === 'Enter') {
              this.setState({videoFilePath: e.currentTarget.value})
            }
          }}/>
        </label>
      </div>
    )
  }

  onRecordKeyDown(e) {
    const videoElement = document.getElementById('videoElement')
    console.log(videoElement)
  }

  getContents() {
    if (!this.state.videoFilePath) {
      return this.getVideoFilePathPrompt()
    }

    return (
      <div className="masterVideoWrapper">
        <video src={this.state.videoFilePath} controls id="videoElement"/>
        <button onMouseDown={this.onRecordKeyDown}>Record</button>
      </div>
    )
  }

  render() {

    return (
      <div className="Editor">
        {this.getContents()}
      </div>
    )
  }
}
