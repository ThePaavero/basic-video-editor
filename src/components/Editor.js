import React, {Component} from 'react'
import {execSync} from 'child_process'
import fs from 'fs'

export default class Editor extends Component {

  constructor() {
    super()
    this.state = {
      projectStamp: null,
      videoFilePath: null,
      segmentStarts: [],
      segmentEnds: [],
    }
    this.getVideoFilePathPrompt = this.getVideoFilePathPrompt.bind(this)
    this.getContents = this.getContents.bind(this)
    this.onRecordKeyDown = this.onRecordKeyDown.bind(this)
    this.onRecordKeyUp = this.onRecordKeyUp.bind(this)
    this.getVideoElement = this.getVideoElement.bind(this)
    this.generate = this.generate.bind(this)
  }

  componentDidMount() {
    document.ondragover = document.ondrop = (e) => {
      e.preventDefault()
    }
    document.body.ondrop = (e) => {
      console.log(e.dataTransfer.files[0].path)
      const projectStamp = new Date().getTime()
      console.log('projectStamp: ' + projectStamp)
      e.preventDefault()
      this.setState({videoFilePath: e.dataTransfer.files[0].path})
      this.setState({projectStamp: projectStamp})
      this.setState({segmentStarts: []})
      this.setState({segmentEnds: []})
    }
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
  }

  onRecordKeyUp() {
    const segmentEnds = this.state.segmentEnds
    segmentEnds.push(this.getVideoElement().currentTime)
    this.setState({segmentEnds})
  }

  generate() {
    console.log('Generating!')
    const videoPath = this.state.videoFilePath
    console.log(videoPath)
    let counter = 0
    const tempFilePaths = []

    this.state.segmentStarts.forEach((start, index) => {
      counter++
      const end = this.state.segmentEnds[index]
      console.log(start + ' to ' + end)
      const tempFilePath = `temp/tempclip_${counter}.mp4`
      const duration = end - start
      console.log('duration:', duration)
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
