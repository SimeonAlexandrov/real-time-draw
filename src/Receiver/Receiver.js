import React, { Component } from 'react';
import CanvasDraw from "react-canvas-draw";
import { Row, Col, Button } from "antd"
import PropTypes from "prop-types"

import Page from "../_components/Page"

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
      <Page title={`Hi, ${this.props.clientId}. Try to guess the drawing`}>
        <h2>Hi, {this.props.clientId}. Try to guess the drawing</h2>
        <br/>
        <div style={{width:"100%"}}>
          <div style={{ display: "table",margin: "0 auto", border: "1px solid black"}}>
            <CanvasDraw
              ref={canvas => this.canvas = canvas}
              saveData={this.state.saveData}
            />
          </div>
          <Row gutter={16} style={{marginBottom: "16px"}}>
              <Col span={12}>
                <Button>{this.props.round.LabelOptions[0]}</Button>
              </Col>
              <Col span={12}>
                <Button>{this.props.round.LabelOptions[1]}</Button>
              </Col>
            </Row>
            <Row gutter={16} style={{marginBottom: "16px"}}>
              <Col span={12}>
                <Button>{this.props.round.LabelOptions[2]}</Button>
              </Col>
              <Col span={12}>
                <Button>{this.props.round.LabelOptions[3]}</Button>
              </Col>
            </Row>
        </div>
      </Page>
    );
  }
}

Receiver.propTypes = {
  clientId: PropTypes.string.isRequired
}

export default Receiver;
