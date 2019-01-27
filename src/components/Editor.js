import React, {Component} from 'react'
import {execSync} from 'child_process'
import fs from 'fs'

export default class Editor extends Component {

  constructor() {
    super()
    this.state = {
      // videoFilePath: null,
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
    execSync(`ffmpeg -f concat -safe 0 -i ${listPath} -c copy temp/DONE.mp4`)

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
        <video src={this.state.videoFilePath} controls id="videoElement" style={{width: '650px'}}/>
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
