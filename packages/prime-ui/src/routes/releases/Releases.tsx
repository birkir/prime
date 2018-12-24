import * as React from 'react';
import { observer } from 'mobx-react';
import { Table, Button, Card, Layout } from 'antd';
import { ContentReleases } from '../../stores/contentReleases';
import { Toolbar } from '../../components/toolbar/Toolbar';
import { format, distanceInWordsToNow } from 'date-fns';
import { Link } from 'react-router-dom';

@observer
export class Releases extends React.Component {

  componentDidMount() {
    ContentReleases.loadAll();
  }

  get columns() {
    return [{
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
      }, {
        key: 'scheduledAt',
        title: 'Scheduled At',
        render(text: any, record: any) {
          if (!record.scheduledAt) {
            return '---';
          }

          return format(record.scheduledAt, 'YYYY-MM-DD HH:mm');
        }
    }, {
      key: 'documents',
      title: 'Documents',
      render(text: any, record: any) {
        return <Link to={`/documents/release/${record.id}`}>Documents</Link>
      }
    }, {
      key: 'publishedAt',
      title: 'Published',
      render(text: any, record: any) {
        if (record.publishedAt) {
          return `${distanceInWordsToNow(record.publishedAt)} ago`;
        }
      }
    }];
  }

  render() {
    return (
      <Layout>
        <Toolbar>
          <div style={{ flex: 1, display: 'flex' }}>
            <h3>Releases</h3>
          </div>
          <Button type="primary">Create</Button>
        </Toolbar>
        <Layout>
          <Layout.Content style={{ height: 'calc(100vh - 64px)', padding: 32 }}>
            <Card
              bodyStyle={{ padding: 0 }}
              bordered={false}
            >
              <Table
                rowKey="id"
                columns={this.columns}
                dataSource={ContentReleases.list}
                pagination={false}
              />
            </Card>
          </Layout.Content>
        </Layout>
      </Layout>
    );
  }
}
