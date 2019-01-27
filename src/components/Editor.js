import React, {Component} from 'react'
import {exec} from 'child_process'

export default class Editor extends Component {

  constructor() {
    super()
    this.state = {
      // videoFilePath: null
      videoFilePath: 'C:\\Users\\pekka\\Videos\\Captures\\SJ2D.mp4',
      segmentStarts: [],
      segmentEnds: [],
    }
    this.getVideoFilePathPrompt = this.getVideoFilePathPrompt.bind(this)
    this.getContents = this.getContents.bind(this)
    this.onRecordKeyDown = this.onRecordKeyDown.bind(this)
    this.onRecordKeyUp = this.onRecordKeyUp.bind(this)
    this.getVideoElement = this.getVideoElement.bind(this)
    this.generate = this.generate.bind(this)
    this.processSegments = this.processSegments.bind(this)
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

  getVideoElement() {
    return document.getElementById('videoElement')
  }

  onRecordKeyDown() {
    const segmentStarts = this.state.segmentStarts
    segmentStarts.push(this.getVideoElement().currentTime)
    this.setState({segmentStarts})
  }

  onRecordKeyUp() {
    const segmentEnds = this.state.segmentEnds
    segmentEnds.push(this.getVideoElement().currentTime)
    this.setState({segmentEnds})
  }

  processSegments(video) {
    this.state.segmentStarts.forEach((start, index) => {
      const matchingEnd = this.state.segmentEnds[index]
      console.log(start + ' to ' + matchingEnd)
    })
  }

  generate() {
    console.log('Generating!')
    const videoPath = this.state.videoFilePath
    console.log(videoPath)
    const start = 1
    const stop = 2
    const command = `ffmpeg -i ${videoPath} -t ${start} tempclip.mp4 -ss ${stop}`
    exec(command, (error, stdout, stderr) => {
      console.log(error)
      console.log(stderr)
      console.log(stdout)
    })
  }

  getContents() {
    if (!this.state.videoFilePath) {
      return this.getVideoFilePathPrompt()
    }

    return (
      <div className="masterVideoWrapper">
        <video src={this.state.videoFilePath} controls id="videoElement"/>
        <button onMouseDown={this.onRecordKeyDown} onMouseUp={this.onRecordKeyUp}>Record</button>
        <button onClick={this.generate}>Generate new video</button>
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
