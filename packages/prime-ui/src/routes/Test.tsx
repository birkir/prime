import React from 'react';
import { Layout, Breadcrumb, Icon, Card, Table, Button, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { fieldResolver } from '../fieldResolver';

const { Content, Header } = Layout;

const tabs = [{
  key: 'tab1',
  tab: 'Main',
}, {
  key: 'tab2',
  tab: 'SEO',
}];

const columns = [{
  title: 'Name',
  dataIndex: 'name',
  key: 'name',
}, {
  title: 'API ID',
  dataIndex: 'apiId',
  key: 'apiId',
}, {
  title: 'Type',
  dataIndex: 'type',
  key: 'type',
}, {
  title: 'Count',
  dataIndex: 'count',
  key: 'count',
}];

const dataSource = Array.from({ length: 10 }).map(() => ({
  name: 'Row',
  apiId: 'asdf',
  type: 'Single',
  count: Math.floor(Math.random() * 100),
}));

export class Test extends React.Component {


  fields: any;

  state = {
    loaded: false,
  };

  componentDidMount() {
    this.getFields();
  }

  async getFields() {
    this.fields = await fieldResolver();
    this.setState({ loaded: true });
  }

  get FieldString() {
    if (this.fields) {
      return this.fields.string;
    }
    return null;
  }

  render() {
    const { FieldString } = this;
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

        {this.state.loaded && (
          <Content style={{ padding: 32 }}>
            <FieldString />
          </Content>
        )}

        {/* <Content style={{ padding: 32 }}>

          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 16, }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: 0 }}>Schemas</h1>
            </div>
            <Button type="primary">Create new</Button>
          </div>
          <Card
            tabList={tabs}
            activeTabKey="tab1"
            bodyStyle={{ padding: 0 }}
            hoverable
          >
            <Table
              dataSource={dataSource}
              columns={columns}
              pagination={false}
            />
          </Card>

        </Content> */}
      </Layout>
    );
  }
}
