import React, { Component } from "react"

import { Table, Statistic, Tag, Button, Popover, Input, Icon } from "antd"

const { Column } = Table

class GamesTable extends Component {
    constructor(props) {
        super(props)

        this.state = {
            gameId: "",
            isPopoverVisible: false,
            isSubmitEnabled: false
        }
    }
    
    onCreateNewInputChange({target}) {
        this.setState({
            ...this.state,
            gameId: target.value,
            isSubmitEnabled: true
        })
    }

    onSubmit() {
        this.setState({...this.state, isPopoverVisible: false})
        this.props.onCreateNew(this.state.gameId)
    }

    onVisibleChange = visible => {
        this.setState({ ...this.state, isPopoverVisible: true })
    }


    renderCreateNewButton() {
        return (
            <Popover
            content={(
                <div style={{display: "flex", justifyContent: "spaceBetween"}}>
                    <Input
                        prefix={<Icon type="plus" style={{ color: 'rgba(0,0,0,.25)'}} />}
                        placeholder="Game ID"
                        onChange={this.onCreateNewInputChange.bind(this)}
                        value={this.state.gameId}
                    />
                    <Button disabled={!this.state.isSubmitEnabled} onClick={this.onSubmit.bind(this)}> Submit</Button>
                </div>
            )}
            title="Enter a game id"
            trigger="click"
            visible={this.state.isPopoverVisible}
            onVisibleChange={this.onVisibleChange}
          >
            <Button>Create New</Button>
          </Popover>
        )
    }

    renderJoinButton(cellValue, record) {
        console.log(record)
        return  cellValue ? <Button onClick={() => this.props.onJoinClick(record.id)}> Join </Button> : null
    }

    render() {
        return (
            <Table 
                dataSource={this.props.games}
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
                    title={this.renderCreateNewButton.bind(this)}
                    key="action"
                    dataIndex="canJoin"
                    render={this.renderJoinButton.bind(this)}
                />
            </Table>
        )
    }
}

export { GamesTable }