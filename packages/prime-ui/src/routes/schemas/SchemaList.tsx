import * as React from 'react';
import { observer } from 'mobx-react';
import { Table, Card, Button, Popconfirm, Icon, Drawer, Layout } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import { Link, Route, Switch } from 'react-router-dom';
import { Instance } from 'mobx-state-tree';
import { get } from 'lodash';

import { Toolbar } from '../../components/toolbar/Toolbar';
import { ContentType } from '../../stores/models/ContentType';
import { ContentTypes } from '../../stores/contentTypes';
import { EditContentType } from './components/EditContentType';

const { Content } = Layout;

const tabs = [{
  key: '',
  tab: 'Content Types',
}, {
  key: 'slices',
  tab: 'Slices',
}, {
  key: 'templates',
  tab: 'Templates'
}];

interface IContentType extends Instance<typeof ContentType> {}

@observer
export class SchemaList extends React.Component<any> {

  formRef: any = React.createRef();

  state = {
    visible: false,
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
    }, {
      title: 'API Name',
      dataIndex: 'name',
      key: 'name',
      render(_text: string, record: any) {
        return (<i>{record.name}</i>);
      }
    }, {
      title: 'Type',
      key: 'type',
      render: (text: string, record: any) => {
        return record.settings.single ? 'Single' : 'Repeatable';
      },
    }, {
      title: 'Documents',
      key: 'documents',
      render: (text, record) => (
        <Link
          to={`/documents/schema/${record.id}`}
          onClick={(e: any) => e.stopPropagation()}
        >
          {record.entriesCount} doc{Number(record.entriesCount) !== 1 ? 's' : ''}.
        </Link>
      )
    }, {
      title: '',
      key: 'action',
      align: 'right',
      render: (text, record) => (
        <span onClick={e => e.stopPropagation()}>
          <Button
            style={{ paddingLeft: 8, paddingRight: 8, marginRight: 8 }}
            onClick={(e: any) => {
              this.props.history.push(`/schemas/settings/${record.id}`)
            }}
          >
            <Icon
              type="setting"
              theme="filled"
            />
          </Button>
          <Popconfirm
            title="Are you sure?"
            icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
            onConfirm={() => record.remove()}
          >
            <Button style={{ paddingLeft: 8, paddingRight: 8 }}>
              <Icon
                type="delete"
                theme="filled"
              />
            </Button>
          </Popconfirm>
        </span>
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
    if (this.state.visible === false) {
      this.setState({ visible: true, settingsId: null });
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
    if (this.state.settingsId !== settingsId) {
      this.setState({ settingsId });
    }
    return this.onRouteCreate();
  }

  onRouteDefault = () => {
    if (this.state.visible === true) {
      this.setState({ visible: false });
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
            className="prime-table with-table-pagination"
            onTabChange={this.onTabChange}
            activeTabKey={this.state.tab}
            bordered={false}
          >
            <Table
              rowClassName={() => 'prime-row-click'}
              dataSource={this.data.filter(n => {
                switch (this.state.tab) {
                  case 'slices':
                    return n.isSlice;
                  case 'templates':
                    return n.isTemplate;
                  default:
                    return !n.isSlice && !n.isTemplate;
                }
              })}
              columns={this.columns.filter(n => {
                if (this.state.tab !== 'slices' && this.state.tab !== 'templates') {
                  return true;
                }
                return n.key !== 'type' && n.key !== 'documents';
              })}
              pagination={false}
              rowKey="id"
              onRow={(record) => ({
                onClick: () => this.props.history.push(`/schemas/edit/${record.id}`),
              })}
            />
          </Card>
        </Content>

        <Drawer
          title={`${this.state.settingsId ? 'Edit' : 'Create'} Content Type`}
          width={360}
          placement="right"
          maskClosable={true}
          onClose={this.onCloseDrawer}
          visible={this.state.visible}
          className="prime__drawer"
        >
          <EditContentType
            ref={this.formRef}
            contentTypeId={this.state.settingsId}
            item={this.state.settingsId ? this.data.find(n => n.id === this.state.settingsId) : {
              isSlice: this.state.tab === 'slices',
              isTemplate: this.state.tab === 'templates',
            }}
            contentTypes={this.data}
            onCancel={this.onCloseDrawer}
            onSubmit={(contentType) => {
              this.onCloseDrawer();
              if (contentType) {
                this.props.history.push(`/schemas/edit/${contentType.id}`);
              }
            }}
          />
        </Drawer>
      </Layout>
    );
  }
}
