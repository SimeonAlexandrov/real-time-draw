import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom"

import './App.css'  
import Sender from './Sender/Sender'
import Receiver from './Receiver/Receiver'
import Landing from './Landing/Landing'
import Lobby from './Lobby/Lobby'
class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      role: null,
      id: "",
      ready: false
    }
  }

  onOptionChange(e) {
    this.setState({
      ...this.state,
      role: e.target.id
    })
  }

  onIdChange(e) {
    this.setState({
      ...this.state,
      id: e.target.value 
    })
  }

  onSubmit(e) {
    this.setState({
      ...this.state,
      ready: true
    })
  }

  renderContent() {
    const state = this.state
    if (state.ready && state.role === "sender") {
      return <Sender clientId={state.id}/>
    } else if (state.ready && state.role === "receiver") {
      return <Receiver clientId={state.id}/>
    } else {
      return <React.Fragment>
        <h1>DrawProject: Welcome</h1>
        <br/>
        <p>Join as: </p>
        <form onSubmit={this.onSubmit.bind(this)}>
          <input 
            type="text" 
            value={state.id} 
            onChange={this.onIdChange.bind(this)}
          />
          <label>
            <input 
              type="radio" 
              id="sender" 
              checked={state.role === "sender"}
              onChange={this.onOptionChange.bind(this)} 
            />
            Sender
          </label>
          <label>
            <input 
              type="radio" 
              id="receiver" 
              checked={state.role === "receiver"}
              onChange={this.onOptionChange.bind(this)}
            />
            Receiver
          </label>
          <button id="sender" type="submit" >Join</button>
        </form>
      </React.Fragment>
    }
  }

  render() {
    // return <div className="App">
    //   {this.renderContent()}
    // </div>

    return (
      <Router>
        <Route exact path="/" component={Landing} />
        <Route path="/lobby" component={Lobby} />
    </Router>
    )
  }
}

export default App;
