import * as React from 'react';
import { observer } from 'mobx-react';
import { Table, Card, Button, Popconfirm, Icon, Drawer, Divider, Layout } from 'antd';
import { History } from 'history';
import { ColumnProps } from 'antd/lib/table';
import { Link } from 'react-router-dom';
import { Instance } from 'mobx-state-tree';

import { ContentTypes } from '../../stores/contentTypes';
import { CreateForm } from './components/CreateForm';
import { Toolbar } from '../../components/toolbar/Toolbar';
import { ContentType } from '../../stores/models/ContentType';

const { Content } = Layout;

interface IProps {
  history: History
}

const tabs = [{
  key: 'contentTypes',
  tab: 'Content Types',
}, {
  key: 'slices',
  tab: 'Slices',
}];

interface IContentType extends Instance<typeof ContentType> {}

@observer
export class SchemaList extends React.Component<IProps> {

  formRef: any = React.createRef();

  state = {
    visible: false,
    tab: 'contentTypes',
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
        return (<Link to={`/schemas/${record.id}`}>{record.title}</Link>);
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
    this.setState({
      visible: true,
    });
  }

  onCloseDrawer = () => {
    this.formRef.current.resetFields();

    this.setState({
      visible: false,
    });
  }

  onTabChange = (tab: string) => {
    this.setState({
      tab,
    });
  }

  render() {
    return (
      <Layout>
        <Toolbar>
          <p></p>
        </Toolbar>
        <Content style={{ padding: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 16, }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: 0 }}>Schemas</h1>
            </div>
            <Button type="primary" onClick={this.onCreateNewClick}>Create new</Button>
          </div>

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
              loading={ContentTypes.loading}
              pagination={false}
              rowKey="id"
            />
          </Card>
        </Content>
        <Drawer
          title="Create new Content Type"
          width={280}
          placement="right"
          maskClosable={true}
          onClose={this.onCloseDrawer}
          visible={this.state.visible}
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
              this.props.history.push(`/schemas/${contentType.id}`);
            }}
          />
        </Drawer>
      </Layout>
    );
  }
}
