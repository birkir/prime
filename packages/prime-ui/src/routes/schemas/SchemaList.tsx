import * as React from 'react';
import { observer } from 'mobx-react';
import { Table, Card, Button, Popconfirm, Icon, Drawer, Divider, Layout } from 'antd';
import { History } from 'history';
import { ColumnProps } from 'antd/lib/table';
import { Link, Route, Switch } from 'react-router-dom';
import { Instance } from 'mobx-state-tree';
import { get } from 'lodash';

import { CreateForm } from './components/CreateForm';
import { Toolbar } from '../../components/toolbar/Toolbar';
import { ContentType } from '../../stores/models/ContentType';
import { ContentTypes } from '../../stores/contentTypes';

const { Content } = Layout;

const tabs = [{
  key: '',
  tab: 'Content Types',
}, {
  key: 'slices',
  tab: 'Slices',
// }, {
//   key: 'templates',
//   tab: 'Templates'
}];

interface IContentType extends Instance<typeof ContentType> {}

@observer
export class SchemaList extends React.Component<any> {

  formRef: any = React.createRef();

  state = {
    settingsVisible: false,
    createVisible: false,
    settingsId: null,
    tab: get(this.props, 'match.params.tab', ''),
  }

  componentDidMount() {
    ContentTypes.loadAll();
  }

  get columns(): ColumnProps<IContentType>[] {
    return [{
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render(_text: string, record: any) {
        return (<Link to={`/schemas/edit/${record.id}`}>{record.title}</Link>);
      }
    }, {
      title: 'API',
      dataIndex: 'name',
      key: 'name',
      render(_text: string, record: any) {
        return (<i>{record.name}</i>);
      }
    }, {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <>
          {!record.isSlice && (
            <>
              <Link to={`/documents/schema/${record.id}`}>Documents ({record.entriesCount})</Link>
              <Divider type="vertical" />
              <Link to={`/schemas/settings/${record.id}`}>Settings</Link>
              <Divider type="vertical" />
            </>
          )}
          <Popconfirm
            title="Are you sure?"
            icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
            onConfirm={record.remove}
          >
            <a href="#">Delete</a>
          </Popconfirm>
        </>
      )
    }]
  }

  get data(): IContentType[] {
    return ContentTypes.list;
  }

  onCreateNewClick = (e: React.MouseEvent<HTMLElement>) => {
    this.props.history.replace('/schemas/create');
  }

  onCloseDrawer = () => {
    if (this.formRef.current) {
      this.formRef.current.resetFields();
    }
    this.props.history.replace('/schemas/' + this.state.tab);
  }

  onTabChange = (tab: string) => {
    this.setState({ tab });
    this.props.history.replace('/schemas/' + tab);
  }

  onRouteCreate = () => {
    console.log('create');
    if (this.state.createVisible === false) {
      this.setState({ createVisible: true });
    }

    return null;
  }

  onRouteTabChange = (props: any) => {
    const parts = props.match.path.split('/');
    const tab = parts[parts.length - 1];
    if (tab !== this.state.tab) {
      this.setState({ tab });
    }

    return this.onRouteDefault();
  }

  onRouteSettings = ({ match }: any) => {
    const settingsId = match.params.id;
    if (this.state.settingsVisible === false) {
      this.setState({ settingsVisible: true });
    }
    if (this.state.settingsId !== settingsId) {
      this.setState({ settingsId });
    }
    return null;
  }

  onRouteDefault = () => {
    if (this.state.createVisible === true) {
      this.setState({ createVisible: false });
    }
    if (this.state.settingsVisible === true) {
      this.setState({ settingsVisible: false });
    }

    return null;
  }

  render() {
    return (
      <Layout>
        <Toolbar>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0 }}>Schemas</h2>
          </div>
          <Button type="primary" onClick={this.onCreateNewClick}>Create new</Button>
        </Toolbar>

        <Switch>
          <Route render={this.onRouteCreate} exact path="/schemas/create" />
          <Route render={this.onRouteTabChange} exact path="/schemas/slices" />
          <Route render={this.onRouteTabChange} exact path="/schemas/templates" />
          <Route render={this.onRouteSettings} exact path="/schemas/settings/:id" />
          <Route render={this.onRouteDefault} />
        </Switch>

        <Content style={{ padding: 32 }}>

          <Card
            tabList={tabs}
            bodyStyle={{ padding: 0 }}
            className="with-table-pagination"
            hoverable
            onTabChange={this.onTabChange}
            activeTabKey={this.state.tab}
          >
            <Table
              dataSource={this.data.filter(n => this.state.tab === 'slices' ? n.isSlice : !n.isSlice )}
              columns={this.columns}
              pagination={false}
              rowKey="id"
            />
          </Card>
        </Content>

        <Drawer
          title="Edit Schema"
          width={280}
          placement="right"
          maskClosable={true}
          onClose={this.onCloseDrawer}
          visible={this.state.settingsVisible}
          style={{
            height: 'calc(100% - 55px)',
            overflow: 'auto',
            paddingBottom: 53,
          }}
        >
          <h3>Schema settings</h3>
          <p>{this.state.settingsId}</p>
        </Drawer>

        <Drawer
          title="Create Schema"
          width={280}
          placement="right"
          maskClosable={true}
          onClose={this.onCloseDrawer}
          visible={this.state.createVisible}
          style={{
            height: 'calc(100% - 55px)',
            overflow: 'auto',
            paddingBottom: 53,
          }}
        >
          <CreateForm
            ref={this.formRef}
            onCancel={this.onCloseDrawer}
            onSubmit={(contentType) => {
              this.onCloseDrawer();
              this.props.history.push(`/schemas/edit/${contentType.id}`);
            }}
          />
        </Drawer>
      </Layout>
    );
  }
}
