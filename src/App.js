import React, { Component } from 'react';
import './App.css'  

import Sender from './Sender/Sender'
import Receiver from './Receiver/Receiver'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      role: null
    }
  }

  onButtonClick(e) {
    this.setState({
      ...this.state,
      role: e.target.id
    })
  }

  renderContent() {
    if (this.state.role === "sender") {
      return <Sender/>
    } else if (this.state.role === "receiver") {
      return <Receiver/>
    } else {
      return <React.Fragment>
        <h1>DrawProject: Welcome</h1>
        <br/>
        <p>I would like to be a:</p>
        <button id="sender" onClick={this.onButtonClick.bind(this)}>Sender</button>
        <button id="receiver" onClick={this.onButtonClick.bind(this)}>Receiver</button>
      </React.Fragment>
    }
  }

  render() {
    return <div className="App">
      {this.renderContent()}
    </div>
  }
}

export default App;
