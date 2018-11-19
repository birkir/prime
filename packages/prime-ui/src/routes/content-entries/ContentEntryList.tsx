import React, { useState } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Table, Card } from 'antd';
import { get, debounce } from 'lodash';
import { client } from '../../utils/client';
import { Link } from 'react-router-dom';

const GET_CONTENT_ENTRIES = gql`
  query contentEntries(
    $limit: Int
    $skip: Int
    $contentTypeId: ID
  ) {
    ContentType(id:$contentTypeId) {
      id
      name
      title
    }
    allContentEntries(
      limit:$limit
      skip:$skip
      contentTypeId:$contentTypeId
    ) {
      totalCount
      edges {
        node {
          entryId
          versionId
          contentReleaseId
          language
          isPublished
          updatedAt
          contentType {
            id
            title
          }
        }
      }
    }
  }
`;

const columns = [{
  title: 'ID',
  dataIndex: 'entryId',
  render(_text: string, record: any) {
    return (<Link to={`/contentEntry/${record.entryId}`}>{record.entryId}</Link>);
  }
}, {
  title: 'Type',
  dataIndex: 'contentType.title',
}, {
  title: 'Updated',
  dataIndex: 'updatedAt',
}];

export const ContentEntryList = ({ match }: any) => {
  const [isLoading, setLoading] = useState(false);
  const contentTypeId = match.params.id;
  let timer: any;

  return (
    <Query
      query={GET_CONTENT_ENTRIES}
      client={client}
      variables={{
        limit: 5,
        skip: 0,
        contentTypeId,
      }}
    >
      {({ loading, error, data, refetch }) => {
        if (error) {
          return `Error! ${error.message}`;
        }

        const pagination = {
          total: get(data, 'allContentEntries.totalCount'),
          pageSize: 5,
        };

        clearTimeout(timer);
        timer = setTimeout(() => (loading !== isLoading) && setLoading(loading), 330);

        const onTableChange = (pagination: any, filters: any, sorter: any) => {
          refetch({
            contentTypeId,
            limit: pagination.pageSize,
            skip: (pagination.current - 1) * pagination.pageSize,
          });
        };

        const title = get(data, 'ContentType.title');
        const items = get(data, 'allContentEntries.edges', []).map(({ node }: any) => node);

        return (
          <div style={{ padding: 32 }}>
            {title && (<h2>Content Type: {title}</h2>)}
            <Card>
              <Table
                columns={columns}
                rowKey="entryId"
                dataSource={items}
                pagination={pagination}
                loading={isLoading ? {
                  wrapperClassName: 'table-fast-spin',
                } : false}
                onChange={onTableChange}
              />
            </Card>
          </div>
        );
      }}
    </Query>
  );
};
