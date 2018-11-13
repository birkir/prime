import React from 'react';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { Table } from 'antd';

import { ContentTypes } from '../../stores/contentTypes';
import { toJS } from 'mobx';

@observer
export class ContentTypeList extends React.Component {

  componentDidMount() {
    ContentTypes.fetchContentTypes();
  }

  get columns() {
    return [{
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render(_text: string, record: any) {
        return (<Link to={`/contentType/${record.id}`}>{record.name}</Link>);
      }
    }]
  }

  render() {
    console.log(ContentTypes.list);
    return (
      <div style={{ padding: '25px 50px', backgroundColor: 'white' }}>
        <h1>Content Types</h1>
        <Table dataSource={toJS(ContentTypes.list)} columns={this.columns} />
      </div>
    );
  }
}
