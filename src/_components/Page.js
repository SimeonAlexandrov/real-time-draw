import React, { Component } from 'react';
import { Layout, Typography } from "antd"

const  { Title } = Typography
const { Header, Footer, Content } = Layout

class Page extends Component {

  render() {
    return (
        <Layout style={{height: "100vh"}}>
        <Header style={{backgroundColor: "#fff", textAlign: "center"}}>
            <Title style={{padding: "10px"}}> {this.props.title}</Title>
        </Header>
        <Content style={{ padding: '5% 10% 5% 10%'}}>
          <div style={{ background: '#fff', padding: 24,  margin: "auto", borderRadius: "25px" }}>
              {this.props.children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Real time draw project</Footer>
      </Layout>
    );
  }
}
export default Page;