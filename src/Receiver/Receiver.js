import React, { Component } from 'react';
import CanvasDraw from "react-canvas-draw";
import { Row, Col, Button, notification } from "antd"
import PropTypes from "prop-types"

import Page from "../_components/Page"

const openNotificationWithIcon = type => {
  notification[type]({
    message: 'Notification Title',
    description:
      'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
  });
};

class Receiver extends Component {
  constructor(props) {
    super(props)
    
    this.state = {
      saveData: JSON.stringify({ lines: []}),
      canvas: null
    }
  }

  componentWillReceiveProps(props) {
    const round = props.round
    const currentDrawing = round.CurrentDrawing
    const latestGuess = round.LatestGuess

    console.log("Round: ")
    console.log(round)

    if (round && currentDrawing !== "") {
      
      this.setState({
        ...this.state,
        saveData: props.round.CurrentDrawing,
      })
    }
    console.log("Receiver: component will receive props")
    if (round && 
      latestGuess.Origin) {
      if (!this.props.round.LatestGuess.Origin || 
        this.props.round.LatestGuess.Guess !== latestGuess.Guess) {
          notification["success"]({
            message: `Correct guess from ${latestGuess.Origin.UUID.split("-")[0]}`,
            description:  `${latestGuess.Origin.UUID.split("-")[0]} thinks that ${round.Drawer.split("-")[0]} is drawing ${latestGuess.Guess}`
          })
      }
    }
  }

  render() {
    return this.props.round.LabelOptions ? (
      <Page title={`Hi, ${this.props.clientId}. Try to guess the drawing`}>
        <h2 style={{textAlign: "center"}}>Round: {this.props.round.ID}</h2>
        <div style={{width:"100%"}}>
          <Row gutter={16}>
            <Col span={8}/>
            <Col span={8}>
              <div style={{ display: "table",margin: "0 auto", border: "1px solid black"}}>
                <CanvasDraw
                  ref={canvas => this.canvas = canvas}
                  saveData={this.state.saveData}
                  disabled
                />
            </div>
            </Col>
            <Col span={8}/>
          </Row>
          <Row gutter={16} style={{marginTop: "16px", marginBottom: "16px"}}>
              <Col span={8}/>
              <Col span={4} style={{textAlign: "center"}}>
                <Button
                  onClick={() => this.props.onGuessEvent(this.props.round.LabelOptions[0])}
                >
                  {this.props.round.LabelOptions[0]}
                </Button>
              </Col>
              <Col span={4} style={{textAlign: "center"}}>
                <Button
                  onClick={() => this.props.onGuessEvent(this.props.round.LabelOptions[1])}
                >
                  {this.props.round.LabelOptions[1]}
                </Button>
              </Col>
              <Col span={8}/>
            </Row>
            <Row gutter={16} style={{marginBottom: "16px"}}>
              <Col span={8}/>
              <Col span={4} style={{textAlign: "center"}}>
                <Button
                  onClick={() => this.props.onGuessEvent(this.props.round.LabelOptions[2])}
                >
                  {this.props.round.LabelOptions[2]}
                </Button>
              </Col>
              <Col span={4} style={{textAlign: "center"}}>
                <Button
                  onClick={() => this.props.onGuessEvent(this.props.round.LabelOptions[3])}
                >
                  {this.props.round.LabelOptions[3]}
                </Button>
              </Col>
              <Col span={8}/>
            </Row>
            
        </div>
      </Page>
    ) : null
  }
}

Receiver.propTypes = {
  clientId: PropTypes.string.isRequired
}

export default Receiver;
