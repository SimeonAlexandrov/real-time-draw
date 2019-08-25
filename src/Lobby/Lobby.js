import React, { Component } from 'react';


import { w3cwebsocket as W3CWebSocket } from "websocket"
import MSG_TYPES from "../_constants"
import {  Row, Col } from "antd"

import Page from "../_components/Page"
import { UsersTable } from "./UsersTable"
import { GamesTable } from "./GamesTable"

const games = [
    {
        key: 1,
        id: "Only pros",
        playersJoined: 1,
        status: "pending",
        canJoin: true
    },
    {
        key: 2,
        id: "Only noobs",
        playersJoined: 3,
        status: "in progress",
        canJoin: false
    }
]



class Lobby extends Component {
    constructor(props) {
        super(props)
        this.state = {
            websocketClient: null,
            users: []
        }
    }

    componentDidMount() {
        const userProps = this.props.location.userProps
        if (userProps) {
            this.onWebsocketOpen(userProps)
        } else {
            console.warn("Cannot connect to server")
        }
    
    }

    prepareMessage = (objectMessage) => Buffer.from(JSON.stringify(objectMessage)) 

    onReceiveMessage (message) {
        const newState = JSON.parse(message.data)
        console.log(newState)

        this.setState({
            ...this.state,
            users: newState.clients.map(cl => {
                const userData = JSON.parse(cl)
                return {
                    key: userData.UUID,
                    userId: userData.UUID.split("-")[0],
                    status: userData.Status
                }
            })
        })
    }

    onWebsocketOpen (userProps) {
        const websocketClient = new W3CWebSocket(`ws://127.0.0.1:8000/ws?id=${userProps.userId}`)
        websocketClient.onopen = () => {
            console.log("Landing WebSocket client connected")
            const initMessage = { 
                id: userProps.userId,
                cause: MSG_TYPES.INIT 
              }
            websocketClient.send(this.prepareMessage(initMessage))
        }
        websocketClient.onmessage = this.onReceiveMessage.bind(this)
        this.setState({websocketClient})
    }
    
    onCreateNewGame(gameId) {
        const createNewGameMessage = {
            id: this.props.location.userProps.userId,
            cause: MSG_TYPES.CREATE_NEW_GAME,
            payload: gameId
        }
        this.state.websocketClient.send(this.prepareMessage(createNewGameMessage))
    }

    render() {
        return (
            <Page title="Lobby">
               <Row gutter={16}>
                    <Col span={12}>
                        <GamesTable
                            games={games}
                            onCreateNew={this.onCreateNewGame.bind(this)}
                        />
                    </Col>
                    <Col span={12}>
                        <UsersTable users={this.state.users} />
                    </Col>
                </Row>
            </Page>
        );
    }
}
export default Lobby;
