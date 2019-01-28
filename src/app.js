import React, {Component} from 'react'
import {execSync} from 'child_process'
import fs from 'fs'

export default class App extends Component {

  constructor() {
    super()
    this.state = {
      projectStamp: null,
      videoFilePath: null,
      segmentStarts: [],
      segmentEnds: [],
      recording: false,
      busy: false
    }
    this.getVideoFilePathPrompt = this.getVideoFilePathPrompt.bind(this)
    this.getContents = this.getContents.bind(this)
    this.onRecordKeyDown = this.onRecordKeyDown.bind(this)
    this.onRecordKeyUp = this.onRecordKeyUp.bind(this)
    this.getVideoElement = this.getVideoElement.bind(this)
    this.generate = this.generate.bind(this)
    this.generateWrapper = this.generateWrapper.bind(this)
    this.getBusyDimmer = this.getBusyDimmer.bind(this)
    this.clearAllSegments = this.clearAllSegments.bind(this)
    this.getRecordedSegments = this.getRecordedSegments.bind(this)
    this.deleteSegment = this.deleteSegment.bind(this)
  }

  componentDidMount() {
    document.ondragover = document.ondrop = (e) => {
      e.preventDefault()
    }
    document.body.ondrop = (e) => {
      const projectStamp = new Date().getTime()
      e.preventDefault()
      this.setState({busy: true})
      this.setState({videoFilePath: e.dataTransfer.files[0].path})
      this.setState({projectStamp: projectStamp})
      this.setState({segmentStarts: []})
      this.setState({segmentEnds: []})
      this.getVideoElement().addEventListener('canplay', e => {
        this.setState({busy: false})
      })
    }
  }

  clearAllSegments() {
    this.setState({segmentStarts: []})
    this.setState({segmentEnds: []})
  }

  getVideoFilePathPrompt() {
    return (
      <div className="setVideoFilePathWrapper">
        Drag your file here
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
    this.setState({recording: true})
  }

  onRecordKeyUp() {
    const segmentEnds = this.state.segmentEnds
    segmentEnds.push(this.getVideoElement().currentTime)
    this.setState({segmentEnds})
    this.setState({recording: false})
  }

  generateWrapper() {
    this.setState({busy: true})
    setTimeout(this.generate, 300)
  }

  generate() {
    this.setState({busy: true})
    const videoPath = this.state.videoFilePath
    let counter = 0
    const tempFilePaths = []

    this.state.segmentStarts.forEach((start, index) => {
      counter++
      const end = this.state.segmentEnds[index]
      const tempFilePath = `temp/tempclip_${counter}.mp4`
      const duration = end - start
      const command = `ffmpeg -ss ${start} -t ${duration} -i "${videoPath}" "${tempFilePath}"`
      execSync(command)
      tempFilePaths.push(tempFilePath)
    })

    let listString = ''
    tempFilePaths.forEach(segment => {
      listString += `file '${segment.replace('temp/', '')}'` + '\n'
    })

    const listPath = 'temp/list.txt'

    fs.writeFileSync(listPath, listString)

    execSync(`cd temp`)
    execSync(`ffmpeg -f concat -safe 0 -i ${listPath} -c copy temp/${this.state.projectStamp}.mp4`)

    fs.unlinkSync(listPath)
    tempFilePaths.forEach(tempVideo => {
      fs.unlinkSync(tempVideo)
    })
    this.setState({busy: false})
  }

  deleteSegment(index) {
    const starts = this.state.segmentStarts
    const ends = this.state.segmentEnds
    this.setState({
      segmentStarts: this.state.segmentStarts.filter((x, i) => i !== index),
      segmentEnds: this.state.segmentEnds.filter((x, i) => i !== index),
    })
  }

  getRecordedSegments() {
    let counter = 0
    return this.state.segmentStarts.map((start, index) => {
      counter++
      const end = this.state.segmentEnds[index]
      return (
        <div className="segment" key={counter}>
          <strong>{counter}.</strong>
          {start.toFixed(1)} ➜ {end ? end.toFixed(1) : '...'}
          <button className="delete-segment-button" onClick={() => {
            this.deleteSegment(index)
          }}>✖
          </button>
        </div>
      )
    })
  }

  getContents() {
    if (!this.state.videoFilePath) {
      return this.getVideoFilePathPrompt()
    }

    return (
      <div className="masterVideoWrapper">
        <video src={this.state.videoFilePath} controls id="videoElement"/>
        <div className="tools">
          <button onMouseDown={this.onRecordKeyDown} onMouseUp={this.onRecordKeyUp}>Record</button>
          <button onClick={this.clearAllSegments}>Clear all</button>
          <button onClick={this.generateWrapper}>Done</button>
        </div>
        {this.getRecordedSegments()}
      </div>
    )
  }

  getBusyDimmer() {
    if (!this.state.busy) {
      return null
    }

    return (
      <div className="busy">Working...</div>
    )
  }

  render() {
    return (
      <div className={'App' + (this.state.recording ? ' recording' : '')}>
        {this.getBusyDimmer()}
        <h2>Video Editor</h2>
        {this.getContents()}
      </div>
    )
  }
}
