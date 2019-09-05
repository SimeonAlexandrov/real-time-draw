import React, { Component } from 'react';
import { withRouter } from "react-router-dom"
import {  Row, Col } from "antd"
import { w3cwebsocket as W3CWebSocket } from "websocket"

import MSG_TYPES from "../_constants"

import Page from "../_components/Page"
import { UsersTable } from "./UsersTable"
import { GamesTable } from "./GamesTable"

import Receiver from "../Receiver/Receiver"
import Sender from '../Sender/Sender'

class Lobby extends Component {
    constructor(props) {
        super(props)
        this.state = {
            websocketClient: null,
            users: [],
            games: [], 
            userInfo: null,
            shouldRenderReceiver: false,
            shouldRenderSender: false,
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
    
    debugMessage = (newState) => {
        console.log("Message received!")
        console.log("Current user: ", this.props.location.userProps.userId)
        const clients = newState.clients.map(cl => JSON.parse(cl))
        // console.log("Clients: ",clients)
        const games = newState.games.map(g => JSON.parse(g))
        console.log("Games: ", games)
    }

    checkIfGameHasStartedForCurrentUser = (userInfo) => {
        console.warn("Checking...")
        if (userInfo ) {
            const joinedGame = userInfo.game
            const filteredGames = this.state.games
                .filter(g => g.id === joinedGame)
            if (filteredGames.length === 0) {
                console.log("No game joined")
                this.setState({
                    ...this.state,
                    shouldRenderSender: false, 
                    shouldRenderReceiver: false
                })
            } else if(filteredGames.length > 1) {
                console.log("Oops")
            } else {
                if (filteredGames[0].status === "inProgress") {
                    if (userInfo.status === "drawing") {
                       this.setState({
                           ...this.state, 
                           shouldRenderSender: true,
                        shouldRenderReceiver: false
                    })
                    } else if (userInfo.status === "guessing") {
                        this.setState({
                            ...this.state,
                            shouldRenderSender: false, 
                            shouldRenderReceiver: true
                        })
                    }
                }
            }
        }
    }
    
    onReceiveMessage (message) {
        const newState = JSON.parse(message.data)
        const userProps = this.props.location.userProps
        this.debugMessage(newState)
        let thisUserInfo 
        this.setState({
            ...this.state,
            users: newState.clients.map(cl => {
                const { UUID, Status, JoinedGame} = JSON.parse(cl) 

                const userInfo = {
                    key: UUID,
                    userId: UUID.split("-")[0],
                    status: Status,
                    game: JoinedGame,
                }
                if (userProps.userId === userInfo.userId) {
                    thisUserInfo = userInfo
                } 
                return userInfo
            }),
            games: newState.games.map(g => {
                const {ID, Status, Players, Creator, CurrentRound } = JSON.parse(g)
                return {
                    key: ID,
                    id: ID,
                    playersJoined: Players.length,
                    status: Status,
                    currentRound: CurrentRound,
                    canJoin: Status === "pending" && Creator.split("-")[0] !== userProps.userId
                }
            }) 
        }, () => {
            if (thisUserInfo && !this.state.userInfo) {
                this.setState({
                    ...this.state,
                    userInfo: thisUserInfo
                }, () => {
                    this.checkIfGameHasStartedForCurrentUser(this.state.userInfo)
                })
            } else if (thisUserInfo) {
                this.checkIfGameHasStartedForCurrentUser(thisUserInfo)
            }
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

    onDrawEvent(drawing) {
        const userId = this.props.location.userProps ?  this.props.location.userProps.userId : null
        const uuid = this.state.users.filter(user => user.userId === userId)[0].key
        const drawMessage = {
            id: uuid,
            cause: MSG_TYPES.DRAW,
            payload: drawing
        }
        this.state.websocketClient.send(this.prepareMessage(drawMessage))
    }

    onGuessEvent(target) {
        const userId = this.props.location.userProps ?  this.props.location.userProps.userId : null
        const uuid = this.state.users.filter(user => user.userId === userId)[0].key
        const guessMessage = {
            id: uuid,
            cause: MSG_TYPES.GUESS
        }
        this.state
            .websocketClient
            .send(
                this.prepareMessage(guessMessage)
            )
    }

    renderLobby(userId) {
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
        )

    }

    render() {
        console.log("State: ", this.state)
        const userId = this.props.location.userProps ?  this.props.location.userProps.userId : null
        if (this.state.user && this.state.userInfo.joinedGame === "") {
            return this.renderLobby(userId)
        } else if (this.state.shouldRenderReceiver && this.state.games.length > 0) {
            return (
                <Receiver 
                    onGuessEvent={this.onGuessEvent.bind(this)}
                    clientId={this.state.userInfo.userId}
                    round={
                        this.state.games
                            .filter(g => g.ID === this.state.userInfo.joinedGame)[0]
                            .currentRound
                    }
                />
            )
        } else if (this.state.shouldRenderSender && this.state.games.length > 0) {
            return (
                <Sender 
                    onDrawEvent={this.onDrawEvent.bind(this)} 
                    clientId={this.state.userInfo.userId}
                    round={
                        this.state.games
                            .filter(g => g.ID === this.state.userInfo.joinedGame)[0]
                            .currentRound
                    }
                />
            )
        } else {
            return this.renderLobby(userId)
        }
    }
}
const withRouterLobby = withRouter(Lobby)
export { withRouterLobby as Lobby}
