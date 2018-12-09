import React, { useState } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Table, Card, Layout, Button, Menu, Dropdown, Icon } from 'antd';
import { get } from 'lodash';
import { distanceInWordsToNow } from 'date-fns';
import { client } from '../../utils/client';
import { Link } from 'react-router-dom';
import { Toolbar } from '../../components/toolbar/Toolbar';
import { TitleBar } from '../../components/titlebar/TitleBar';

const { Content } = Layout;

const GET_CONTENT_ENTRIES = gql`
  query contentEntries(
    $limit: Int
    $skip: Int
    $language: String
    $contentTypeId: ID
    $sort: SortField
    $order: SortOrder
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
      language:$language
      contentTypeId:$contentTypeId
      sort:$sort
      order:$order
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
          display
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

export const DocumentsList = ({ match, history }: any) => {
  const [isLoading, setLoading] = useState(false);
  const [contentTypeId, setContentTypeId] = useState(match.params.id);
  let timer: any;

  const search = new URLSearchParams(history.location.search)
  const langs = [{ id: 'en', flag: 'us', name: 'English' }, { id: 'is', flag: 'is', name: 'Icelandic' }];
  const language = langs.find(l => l.id === search.get('lang')) || langs[0];

  const onLanguageClick = (e: any) => {
    history.push(`/documents?lang=${e.key}`);
  }

  const languages = (
    <Menu onClick={onLanguageClick}>
      {langs.map(({ id, flag, name }) => (
        <Menu.Item key={id}>
          <span className={`flag-icon flag-icon-${flag}`} style={{ marginRight: 8 }} />
          {name}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Query
      query={GET_CONTENT_ENTRIES}
      client={client}
      fetchPolicy="network-only"
      variables={{
        limit: PER_PAGE,
        skip: 0,
        contentTypeId,
        language: language.id,
        sort: 'createdAt',
        order: 'DESC'
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
          const filteredId = filters['contentType.title'];
          setContentTypeId(filteredId && filteredId[0]);
          refetch({
            contentTypeId,
            limit: pagination.pageSize,
            skip: (pagination.current - 1) * pagination.pageSize,
            sort: sorter.field,
            language: language.id,
            order: sorter.order === 'ascend' ? 'ASC' : 'DESC',
          });
        };

        const columns = [{
          title: 'ID',
          dataIndex: 'entryId',
          sorter: true,
          render(_text: string, record: any) {
            return (
              <>
                <Link to={`/documents/doc/${record.entryId}?lang=${language.id}`}>
                  {record.entryId}
                </Link>
                {!record.isPublished && <Icon style={{ marginLeft: 16 }} type="info-circle" />}
              </>
            );
          }
        }, {
          title: 'Title',
          width: '50%',
          dataIndex: 'data.title',
          render(_text: string, record: any) {
            return record.display;
          }
        }, {
          title: 'Type',
          dataIndex: 'contentType.title',
          filters: get(data, 'allContentTypes', [])
            .filter((n: any) => !n.isSlice)
            .map(({ id, title }: any) => ({
              text: title,
              value: id,
            })),
          filteredValue: [contentTypeId] as any[],
          filterMultiple: false,
        }, {
          title: 'Updated',
          dataIndex: 'updatedAt',
          sorter: true,
          defaultSortOrder: 'descend' as any,
          render(text: string) {
            return distanceInWordsToNow(new Date(text)) + ' ago';
          }
        }];

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
                <Dropdown overlay={languages} trigger={['click']}>
                  <Button type="default" style={{ marginRight: 16 }}>
                    <span className={`flag-icon flag-icon-${language.flag}`} style={{ marginRight: 8 }} />
                    {language.name}
                    <Icon type="down" />
                  </Button>
                </Dropdown>
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
