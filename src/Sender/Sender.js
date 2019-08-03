import React, { Component } from 'react';
import CanvasDraw from "react-canvas-draw";
import { w3cwebsocket as W3CWebSocket } from "websocket"
import PropTypes from 'prop-types'

import MSG_TYPES from "../_constants"

class Sender extends Component {
  constructor(props) {
    super(props)
    
    this.state = {
      saveData: JSON.stringify({ lines: []}),
      canvas: null
    }
  }
  
  prepareMessage = (objectMessage) => Buffer.from(JSON.stringify(objectMessage)) 

  componentDidMount() {
    const websocketClient = new W3CWebSocket(`ws://127.0.0.1:8000/ws?id=${this.props.clientId}`)
    websocketClient.onopen = () => {
      console.log("Sender WebSocket client connected")
      const initMessage = { 
        id: this.props.clientId,
        cause: MSG_TYPES.INIT 
      }
      websocketClient.send(this.prepareMessage(initMessage))
    }

    websocketClient.onmessage = (message) => {
      console.log("Received message from server")
      console.log(message)
    }

    window.addEventListener("mouseup", event => {
      const drawing = this.canvas.getSaveData()
      const drawMessage = {
        id: this.props.clientId,
        cause: MSG_TYPES.DRAW,
        payload: drawing
      }
      websocketClient.send(this.prepareMessage(drawMessage))
    })
  }

  render() {
    return (
      <React.Fragment>
        <h1>DrawProject: Sender</h1>
        <h2>Hi, {this.props.clientId}. Try to draw *placeholder*</h2>
        <br/>
        <div style={{width:"100%"}}>
          <div style={{ display: "table",margin: "0 auto", border: "1px solid black"}}>
            <CanvasDraw
              ref={canvas => this.canvas = canvas}
              saveData={this.state.saveData}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

Sender.propTypes = {
  clientId: PropTypes.string.isRequired
}

export default Sender;
