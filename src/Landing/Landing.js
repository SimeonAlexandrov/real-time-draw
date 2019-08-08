import React, { Component } from 'react';
import { Link } from "react-router-dom"
import PropTypes from "prop-types"

import MSG_TYPES from "../_constants"
import { Form, Icon, Input, Button } from "antd"


import Page from "../_components/Page"


class Landing extends Component {
    constructor(props) {
        super(props)

        this.state = {
            userId: "",
            cannotSubmit: true
        }
    }

    onInputChange({target}) {
        this.setState({
            userId: target.value,
            cannotSubmit: false
        })
    }

    render() {
        return (
            <Page title="Real time draw">
                <Form layout="inline" style={{textAlign: "center"}}>
                    <Form.Item >
                        <Input
                            size="large"
                            prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            placeholder="Username"
                            onChange={this.onInputChange.bind(this)}
                            value={this.state.userId}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            size="large"
                            type="primary" 
                            htmlType="submit"
                            disabled={this.state.cannotSubmit}
                        >
                            <Link to={{pathname:"/lobby", userProps: { userId: this.state.userId }}}> Start </Link>
                        </Button>
                    </Form.Item>
                </Form>
            </Page>
        );
    }
}
export default Landing;
