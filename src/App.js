import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom"

import './App.css'  
import Sender from './Sender/Sender'
import Receiver from './Receiver/Receiver'
import Landing from './Landing/Landing'
import { Lobby } from './Lobby/Lobby'
class App extends Component {

  render() {
    return (
      <Router>
        <Route exact path="/" component={Landing} />
        <Route path="/lobby" component={Lobby} />
        <Route path="/drawing" component={Sender} />
        <Route path="/guessing" component={Receiver} />
      </Router>
    )
  }
}

export default App;
