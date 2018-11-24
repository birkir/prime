import React from 'react';
import { Layout, Breadcrumb, Icon, Card, Table, Button, Row, Col } from 'antd';
import { Link } from 'react-router-dom';

const { Content, Header } = Layout;

export class Home extends React.Component {

  componentDidMount() {
  }

  render() {
    return (
      <Layout>
        <Header
          style={{
            backgroundColor: 'white',
            boxShadow: '0 2px 4px 0 rgba(0, 24, 36, 0.06)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Breadcrumb>
            <Breadcrumb.Item><Icon type="home" /></Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/schemas">Schemas</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Blog</Breadcrumb.Item>
          </Breadcrumb>
        </Header>

        <Content style={{ padding: 32 }}>
          <h1>Welcome</h1>
        </Content>
      </Layout>
    );
  }
}
