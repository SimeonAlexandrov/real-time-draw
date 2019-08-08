import React, { Component } from 'react';
import PropTypes from "prop-types"

import MSG_TYPES from "../_constants"
import { Form, Icon, Input, Button, Row, Col, Divider, Statistic, Tag, Table } from "antd"

import Page from "../_components/Page"

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

const gamesColumns = [
  {
    title: 'Id',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: 'Players Joined',
    dataIndex: 'playersJoined',
    key: 'playersJoined',
    render: playersJoined => (
        <Statistic value={playersJoined} />
    )
  },
  {
    title: 'Status',
    key: 'status',
    dataIndex: 'status',
    render: status => (
            <Tag color={status === "pending" ? "green" : "orange"} key={status}>
              {status.toUpperCase()}
            </Tag>
          )
  },
  {
    title: () => (<Button> Create new</Button> ),
    key: 'action',
    dataIndex: 'canJoin',
    render: canJoin => canJoin ? <Button> Join </Button> : null
  },

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
        this.state = {}
    }

    componentDidMount() {
        console.log("Opening web socket connection for user, ", this.props.location.userProps ? this.props.location.userProps.userId : "")
    }
    render() {
        return (
            <Page title="Lobby">
               <Row gutter={16}>
                    <Col span={12}>
                        <Table 
                            columns={gamesColumns} 
                            dataSource={games}
                            title={() => "Games"} 
                        />
                    </Col>
                    <Col span={12}>
                        <Table 
                            columns={userColumns} 
                            dataSource={users}
                            title={() => "Users"} 
                        />
                    </Col>
                </Row>
            </Page>
        );
    }
}
export default Lobby;
