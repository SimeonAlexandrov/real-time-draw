import React, { Component } from 'react';
import CanvasDraw from "react-canvas-draw";
import PropTypes from 'prop-types'

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
    window.addEventListener("mouseup", event => {
      if(this.canvas) {
        const drawing = this.canvas.getSaveData()
        this.props.onDrawEvent(drawing)
      }
    })
  }

  render() {
    return (
      <React.Fragment>
        <h1>DrawProject: Sender</h1>
        <h2>Hi, {this.props.clientId}. Try to draw *placeholder*</h2>
        <br/>
        <div style={{width:"100%"}}>
          <div style={{ display: "table", margin: "0 auto", border: "1px solid black"}}>
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
