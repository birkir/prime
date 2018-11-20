import React from 'react';
import { observer } from 'mobx-react';
import { Table, Card, Button, Popconfirm, Icon, Drawer, Divider, Layout } from 'antd';
import { History } from 'history';
import { ColumnProps } from 'antd/lib/table';
import { Link } from 'react-router-dom';
import { Instance } from 'mobx-state-tree';

import { ContentTypes, ContentType } from '../../stores/contentTypes';
import { CreateForm } from './components/CreateForm';
import { Toolbar } from '../../components/toolbar/Toolbar';

const { Content, Header } = Layout;

interface IProps {
  history: History
}

interface IContentType extends Instance<typeof ContentType> {}

@observer
export class SchemaList extends React.Component<IProps> {

  formRef: any = React.createRef();

  state = {
    visible: false,
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
        return (<Link to={`/schemas/${record.id}`}>{record.name}</Link>);
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
          <Link to={`/documents/schema/${record.id}`}>Documents</Link>
          <Divider type="vertical" />
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
            bodyStyle={{ padding: 0 }}
            className="with-table-pagination"
            hoverable
          >
            <Table
              dataSource={this.data}
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
            onSubmit={(contentTypeId) => {
              this.onCloseDrawer();
              this.props.history.push(`/contentTypes/${contentTypeId}`);
            }}
          />
        </Drawer>
      </Layout>
    );
  }
}
