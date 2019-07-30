import React, { Component } from 'react';
import CanvasDraw from "react-canvas-draw";
import { w3cwebsocket as W3CWebSocket } from "websocket"


class Sender extends Component {
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
      console.log("Sender WebSocket client connected")
      websocketClient.send(Buffer.from("sender"))
    }
    window.addEventListener("mouseup", event => {
      const drawing = this.canvas.getSaveData()
      // console.log(JSON.stringify(drawing))
      websocketClient.send(Buffer.from(JSON.stringify(drawing)))
    })
  }

  render() {
    return (
      <React.Fragment>
        <h1>DrawProject: Sender</h1>
        <br/>
        <CanvasDraw
          ref={canvas => this.canvas = canvas}
          saveData={JSON.stringify(this.state.saveData)}
        />
      </React.Fragment>
    );
  }
}

export default Sender;
