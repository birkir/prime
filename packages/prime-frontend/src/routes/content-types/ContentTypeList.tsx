import React from 'react';
import { observer } from 'mobx-react';
import { Table, Card, Button, Popconfirm, Icon, Drawer } from 'antd';
import { History } from 'history';
import { ColumnProps } from 'antd/lib/table';
import { Link } from 'react-router-dom';
import { Instance } from 'mobx-state-tree';

import { ContentTypes, ContentType } from '../../stores/contentTypes';
import { CreateForm } from './components/CreateForm';

interface IProps {
  history: History
}

interface IContentType extends Instance<typeof ContentType> {}

@observer
export class ContentTypeList extends React.Component<IProps> {

  formRef: any = React.createRef();

  state = {
    visible: false,
  }

  componentDidMount() {
    ContentTypes.load();
  }

  get columns(): ColumnProps<IContentType>[] {
    return [{
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render(_text: string, record: any) {
        return (<Link to={`/contentType/${record.id}`}>{record.name}</Link>);
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
        <Popconfirm
          title="Are you sure?"
          icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
          onConfirm={record.remove}
        >
          <a href="#">Delete</a>
        </Popconfirm>
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
      <div style={{ padding: 32 }}>
        <h2>Content Types</h2>
        <Card>
          <Table
            dataSource={this.data}
            columns={this.columns}
            loading={ContentTypes.loading}
            pagination={false}
            footer={() => (
              <Button onClick={this.onCreateNewClick}>Create new</Button>
            )}
            rowKey="id"
          />
        </Card>
        <Drawer
          title="Create new Content Type"
          width={720}
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
      </div>
    );
  }
}
