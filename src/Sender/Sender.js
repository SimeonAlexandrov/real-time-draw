import React, { Component } from 'react';
import CanvasDraw from "react-canvas-draw";
import PropTypes from 'prop-types'
import { Row, Col } from "antd"

import Page from "../_components/Page"
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
      <Page title={`Hi, ${this.props.clientId}. Try to draw ${this.props.round.TargetLabel}`}>
        <div style={{width:"100%"}}>
          <h2 style={{textAlign: "center"}}>Round: {this.props.round.ID}</h2>
          <Row>
            <Col span={8}/>
            <Col span={8}>
              <div style={{ display: "table", margin: "0 auto", border: "1px solid black"}}>
                <CanvasDraw
                  ref={canvas => this.canvas = canvas}
                  saveData={this.state.saveData}
                />
              </div>
            </Col>
            <Col span={8}/>
          </Row>
        </div>
      </Page>
    );
  }
}

Sender.propTypes = {
  clientId: PropTypes.string.isRequired
}

export default Sender;
