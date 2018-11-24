import React, { useState } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Table, Card, Layout, Button, Menu, Dropdown, Icon } from 'antd';
import { get } from 'lodash';
import { client } from '../../utils/client';
import { Link } from 'react-router-dom';
import { Toolbar } from '../../components/toolbar/Toolbar';
import { TitleBar } from '../../components/titlebar/TitleBar';

const { Header, Content } = Layout;

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
    allContentTypes(order: "title") {
      id
      title
      isSlice
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
          data
          contentType {
            id
            title
          }
        }
      }
    }
  }
`;

const PER_PAGE = 10;

const columns = [{
  title: 'ID',
  dataIndex: 'entryId',
  render(_text: string, record: any) {
    return (
      <>
        <Link to={`/documents/doc/${record.entryId}`}>{record.entryId}</Link>
        {!record.isPublished && <Icon style={{ marginLeft: 16 }} type="info-circle" />}
      </>
    );
  }
}, {
  title: 'Title',
  dataIndex: 'data.title',
  render(_text: string, record: any) {
    return record.data.title || record.data.name || Object.values(record.data).shift();
  }
}, {
  title: 'Type',
  dataIndex: 'contentType.title',
}, {
  title: 'Updated',
  dataIndex: 'updatedAt',
}];

export const DocumentsList = ({ match, history }: any) => {
  const [isLoading, setLoading] = useState(false);
  const contentTypeId = match.params.id;
  let timer: any;

  return (
    <Query
      query={GET_CONTENT_ENTRIES}
      client={client}
      fetchPolicy="network-only"
      variables={{
        limit: PER_PAGE,
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
          pageSize: PER_PAGE,
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

        const onMenuClick = (e: any) => {
          history.push(`/documents/create/${e.key}`);
        };

        const menu = (
          <Menu onClick={onMenuClick}>
            {get(data, 'allContentTypes', []).filter((n: any) => !n.isSlice).map(({ id, title }: any) => (
              <Menu.Item key={id}>{title}</Menu.Item>
            ))}
          </Menu>
        );

        const items = get(data, 'allContentEntries.edges', [])
          .map(({ node }: any) => node);

        return (
          <Layout>
            <Toolbar>
              <p></p>
            </Toolbar>
            <Content style={{ padding: 32, height: 'calc(100vh - 64px)' }}>
              <TitleBar title="Documents">
                <Dropdown overlay={menu} trigger={['click']}>
                  <Button type="primary">
                    Create
                    <Icon type="down" />
                  </Button>
                </Dropdown>
              </TitleBar>
              <Card
                bodyStyle={{ padding: 0 }}
                hoverable
                className="with-table-pagination"
              >
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
              <div style={{ height: 180 }} />
            </Content>
          </Layout>
        );
      }}
    </Query>
  );
};
