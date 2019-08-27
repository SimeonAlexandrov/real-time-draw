import React, { Component } from 'react';
import { withRouter } from "react-router-dom"
import {  Row, Col } from "antd"
import { w3cwebsocket as W3CWebSocket } from "websocket"

import MSG_TYPES from "../_constants"

import Page from "../_components/Page"
import { UsersTable } from "./UsersTable"
import { GamesTable } from "./GamesTable"

class Lobby extends Component {
    constructor(props) {
        super(props)
        this.state = {
            websocketClient: null,
            users: [],
            games: [], 
            userInfo: null
        }
    }

    componentDidMount() {
        const userProps = this.props.location.userProps
        if (userProps) {
            this.onWebsocketOpen(userProps)
        } else {
            this.props.history.push("/")
        }
    
    }

    prepareMessage = (objectMessage) => Buffer.from(JSON.stringify(objectMessage)) 

    onReceiveMessage (message) {
        const newState = JSON.parse(message.data)
        console.log("Message received!")
        console.log(message)
        this.setState({
            ...this.state,
            users: newState.clients.map(cl => {
                const { UUID, Status, JoinedGame} = JSON.parse(cl) 
                const userProps = this.props.location.userProps
                const userInfo = {
                    key: UUID,
                    userId: UUID.split("-")[0],
                    status: Status,
                    game: JoinedGame,
                }
                if (userProps.userId === userInfo.userId) {
                    this.setState({
                        ...this.state,
                        userInfo
                    })
                } 
                return userInfo
            }),
            games: newState.games.map(g => {
                const {ID, Status, Players, Creator } = JSON.parse(g)
                return {
                    key: ID,
                    id: ID,
                    playersJoined: Players.length,
                    status: Status,
                    canJoin: Status === "pending" && Creator.split("-")[0] !== this.props.location.userProps.userId
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

    onJoinGame(gameId) {
        const userId = this.props.location.userProps ?  this.props.location.userProps.userId : null
        const uuid = this.state.users.filter(user => user.userId === userId)[0].key
        const joinGameMessage = {
            id: uuid,
            cause: MSG_TYPES.JOIN_GAME,
            payload: gameId
        }

        this.state.websocketClient.send(this.prepareMessage(joinGameMessage))
    }

    render() {
        const userId = this.props.location.userProps ?  this.props.location.userProps.userId : null
        return (
            <Page title="Lobby">
               <Row gutter={16}>
                    <Col span={12}>
                        <GamesTable
                            games={this.state.games}
                            user={userId}
                            onCreateNew={this.onCreateNewGame.bind(this)}
                            onJoinClick={this.onJoinGame.bind(this)}
                        />
                    </Col>
                    <Col span={12}>
                        <UsersTable 
                            user={userId}
                            users={this.state.users} 
                        />
                    </Col>
                </Row>
            </Page>
        );
    }
}
const withRouterLobby = withRouter(Lobby)
export { withRouterLobby as Lobby}
