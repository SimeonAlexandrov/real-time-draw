import React, { Component } from "react";
import { Table, Tag, Icon} from "antd"

const { Column } = Table

const USER_STATUS_COLOR_MAP = {
    "drawing": "orange",
    "guessing": "orange",
    "waiting": "lime",
    "available": "green"
}

class UsersTable extends Component {
    render() {
        return (
            <Table 
                dataSource={this.props.users}
                title={() => "Users"} 
            >
                <Column 
                    title="Username"
                    dataIndex="userId"
                    key="userId"
                />
                <Column
                    title="Status"
                    dataIndex="status"
                    key="status"
                    render={
                        status => (
                            <Tag color={USER_STATUS_COLOR_MAP[status]} key={status}>
                                {status === "drawing" ? <Icon type="edit"/> : null}{" " + status.toUpperCase()}
                            </Tag>
                        )
                    }
                />
                <Column 
                    title="Game"
                    dataIndex="game"
                    key="game"
                />
            </Table>
        )
    }
}

export { UsersTable }