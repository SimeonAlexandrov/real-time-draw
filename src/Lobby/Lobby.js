import React, { Component } from 'react';


import { w3cwebsocket as W3CWebSocket } from "websocket"
import MSG_TYPES from "../_constants"
import { Icon, Button, Row, Col, Statistic, Tag, Table } from "antd"

import Page from "../_components/Page"
const { Column } = Table
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


const userColumns = [
    {
        title: 'Username',
        dataIndex: 'userId',
        key: 'userId'
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: status => (
            <Tag color={USER_STATUS_COLOR_MAP[status]} key={status}>
              {status === "drawing" ? <Icon type="edit"/> : null}{" " + status.toUpperCase()}
            </Tag>
        )
    },
    {
        title: "Game",
        dataIndex: "game",
        key: "game"
    }

]

const USER_STATUS_COLOR_MAP = {
    "drawing": "orange",
    "guessing": "orange",
    "waiting": "lime",
    "available": "green"
}

const users = [
    {
        key: 1,
        userId: "pesho",
        status: "drawing",
        game: "Only noobs"
    },
    {
        key: 2,
        userId: "gosho",
        status: "guessing",
        game: "Only noobs"
    },
    {
        key: 3,
        userId: "tosho",
        status: "guessing",
        game: "Only noobs" 
    },
    {
        key: 3,
        userId: "losho",
        status: "waiting", 
        game: "Only pros"
    },
    {
        key: 4,
        userId: "mosho",
        status: "available", 
        game: null
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

    prepareMessage = (objectMessage) => Buffer.from(JSON.stringify(objectMessage)) 

    componentDidMount() {
        const userProps = this.props.location.userProps
        if (userProps) {
            const websocketClient = new W3CWebSocket(`ws://127.0.0.1:8000/ws?id=${userProps.userId}`)
            websocketClient.onopen = () => {
                console.log("Landing WebSocket client connected")
                const initMessage = { 
                    id: userProps.userId,
                    cause: MSG_TYPES.INIT 
                  }
                websocketClient.send(this.prepareMessage(initMessage))
            }
            websocketClient.onmessage = message => {
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
            this.setState({websocketClient})

        } else {
            console.log("Not connected yet")
        }
    
    }

    onCreateNew(e) {
        const createNewGameMessage = {
            id: this.props.location.userProps.userId,
            cause: MSG_TYPES.CREATE_NEW_GAME,
            payload: "new-game-1234" // TODO add actual game info
        }
        this.state.websocketClient.send(this.prepareMessage(createNewGameMessage))
    }

    render() {
        return (
            <Page title="Lobby">
               <Row gutter={16}>
                    <Col span={12}>
                        <Table 
                            dataSource={games}
                            title={() => "Games"} 
                            
                        >
                            <Column 
                                title="Id"
                                dataIndex="id"
                                key="id"
                            />
                            <Column
                                title="Players joined"
                                dataIndex="playersJoined"
                                key="playersJoined"
                                render={
                                    playersJoined => <Statistic value={playersJoined} />
                                }
                            />
                            <Column
                                title="Status"
                                dataIndex="status"
                                key="status"
                                render={ 
                                    status => (
                                        <Tag color={status === "pending" ? "green" : "orange"} key={status}>
                                          {status.toUpperCase()}
                                        </Tag>
                                      )
                                }
                            />
                            <Column
                                title={() => <Button onClick={this.onCreateNew.bind(this)}> Create new</Button>}
                                key="action"
                                dataIndex="canJoin"
                                render={canJoin => canJoin ? <Button> Join </Button> : null}
                            />
                        </Table>
                    </Col>
                    <Col span={12}>
                        <Table 
                            columns={userColumns} 
                            dataSource={this.state.users}
                            title={() => "Users"} 
                        />
                    </Col>
                </Row>
            </Page>
        );
    }
}
export default Lobby;
