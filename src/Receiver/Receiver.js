import React, { Component } from 'react';
import CanvasDraw from "react-canvas-draw";
import PropTypes from "prop-types"

class Receiver extends Component {
  constructor(props) {
    super(props)
    
    this.state = {
      saveData: JSON.stringify({ lines: []}),
      canvas: null
    }
  }

  componentWillReceiveProps(props) {
    console.warn("Receiver will receive props")
    if (props.round && props.round.CurrentDrawing !== "") {
      
      this.setState({
        ...this.state,
        saveData: props.round.CurrentDrawing
      })
    }
  }

  render() {
    return (
      <React.Fragment>
        <h1>DrawProject: Receiver</h1>
        <h2>Hi, {this.props.clientId}. Try to guess the drawing</h2>
        <p>{this.props.round ? JSON.stringify(this.props.round) : null }</p>
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
