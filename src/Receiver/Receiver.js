import React, { Component } from 'react';
import CanvasDraw from "react-canvas-draw";
import { w3cwebsocket as W3CWebSocket } from "websocket"


class Receiver extends Component {
  constructor(props) {
    super(props)
    
    this.state = {
      saveData: { lines: []},
      canvas: null
    }
  }
  
  componentDidMount() {
    const websocketClient = new W3CWebSocket("ws://127.0.0.1:8000/ws")
    websocketClient.onopen = () => {
      console.log("Receiver WebSocket client connected")
    }
    window.addEventListener("mouseup", event => {
      const drawing = this.canvas.getSaveData()
      websocketClient.send(Buffer(JSON.stringify(drawing)))
    })
  }

  render() {
    return (
      <React.Fragment>
        <h1>DrawProject: Receiver</h1>
        <br/>
        <CanvasDraw
          ref={canvas => this.canvas = canvas}
          saveData={JSON.stringify(this.state.saveData)}
        />
      </React.Fragment>
    );
  }
}

export default Receiver;
