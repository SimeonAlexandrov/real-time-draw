import React, { Component } from 'react';
import CanvasDraw from "react-canvas-draw";
import { w3cwebsocket as W3CWebSocket } from "websocket"
import PropTypes from "prop-types"

import MSG_TYPES from "../_constants"

class Receiver extends Component {
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
      const initMessage = { 
        id: this.props.clientId,
        cause: MSG_TYPES.INIT 
      }
      websocketClient.send(this.prepareMessage(initMessage))
    }
    websocketClient.onmessage = message => {
      console.log("Received message from websocket connection", message.data)
      if (message.data) {
        this.setState({
          ...this.state,
          saveData: message.data
        })
      }
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
        <h2>Hi, {this.props.clientId}. Try to guess the drawing</h2>
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

Receiver.propTypes = {
  clientId: PropTypes.string.isRequired
}

export default Receiver;
