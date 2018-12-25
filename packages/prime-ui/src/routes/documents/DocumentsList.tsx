import React, { useState } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Avatar, Table, Card, Layout, Button, Menu, Dropdown, Icon, Tooltip, Badge, Modal, message } from 'antd';
import { get } from 'lodash';
import { distanceInWordsToNow } from 'date-fns';
import { client } from '../../utils/client';
import { Link } from 'react-router-dom';
import { Toolbar } from '../../components/toolbar/Toolbar';
import { Settings } from '../../stores/settings';
import { clone } from 'mobx-state-tree';
import { stringToColor } from '../../utils/stringToColor';
import { ContentReleases } from '../../stores/contentReleases';

const { Content } = Layout;

const GET_CONTENT_ENTRIES = gql`
  query contentEntries(
    $limit: Int
    $skip: Int
    $language: String
    $contentTypeId: ID
    $contentReleaseId: ID
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
      isTemplate
    }
    allUsers {
      id
      email
    }
    allContentEntries(
      limit:$limit
      skip:$skip
      language:$language
      contentTypeId:$contentTypeId
      contentReleaseId:$contentReleaseId
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
          publishedVersionId
          updatedAt
          data
          display
          contentType {
            id
            title
          }
          user {
            id
            email
            firstname
            lastname
          }
        }
      }
    }
  }
`;

const PER_PAGE = 10;

export const DocumentsList = ({ match, history }: any) => {

  const search = new URLSearchParams(history.location.search);
  const locale = Settings.locales.find(({ id }) => id === search.get('locale')) || Settings.masterLocale;

  React.useEffect(() => { ContentReleases.loadAll() }, [match.location]);

  const onLocaleClick = (e: any) => {
    history.push(`${match.url}?locale=${e.key}`);
  }

  const locales = (
    <Menu onClick={onLocaleClick}>
      {Settings.locales.map(({ id, flag, name }) => (
        <Menu.Item key={id}>
          <span className={`flagstrap-icon flagstrap-${flag}`} style={{ marginRight: 8 }} />
          {name}
        </Menu.Item>
      ))}
    </Menu>
  );

  let userId: any;
  let contentTypeId = match.params.contentTypeId;
  let contentReleaseId = match.params.contentReleaseId;

  return (
    <Query
      query={GET_CONTENT_ENTRIES}
      client={client}
      fetchPolicy="network-only"
      variables={{
        contentTypeId,
        contentReleaseId,
        userId,
        skip: 0,
        limit: PER_PAGE,
        language: locale.id,
        sort: 'updatedAt',
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

        const formatSorterField = (field: string) => {
          if (field === 'user.id') return 'userId';
          return field;
        }

        const onTableChange = async (pagination: any, filters: any, sorter: any) => {
          contentTypeId = filters['contentType.title'] && filters['contentType.title'][0];
          userId = filters['user.id'] && filters['user.id'][0];

          const variables = {
            contentTypeId,
            contentReleaseId,
            userId,
            limit: pagination.pageSize,
            skip: (pagination.current - 1) * pagination.pageSize,
            sort: formatSorterField(sorter.field),
            language: locale.id,
            order: sorter.order === 'ascend' ? 'ASC' : 'DESC',
          };
          refetch(variables);
        };

        const columns = [{
          title: '',
          dataIndex: 'entryId',
          sorter: false,
          width: '52px',
          render(_text: string, record: any) {

            let backgroundColor = record.publishedVersionId ? '#79cea3' : '#faad14';
            let icon = record.publishedVersionId ? 'caret-right' : 'exclamation';
            let dot = !record.publishedVersionId || record.isPublished ? false : true;

            if (contentReleaseId) {
              dot = false;
              icon = 'clock-circle';
              backgroundColor = '#4A90E2';
            }

            return (
              <Badge count={dot ? '!' : 0} style={{ backgroundColor: '#faad14' }}>
                <div style={{ width: 32, height: 32, borderRadius: 4, backgroundColor, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, color: 'white' }}>
                  <Icon type={icon} />
                </div>
              </Badge>
            );
          }
        }, {
          title: 'Title',
          dataIndex: 'data.title',
          render(_text: string, record: any) {
            return record.display;
          }
        }, {
          title: 'Type',
          width: '175px',
          dataIndex: 'contentType.title',
          filters: get(data, 'allContentTypes', [])
            .filter((n: any) => !n.isSlice && !n.isTemplate)
            .map(({ id, title }: any) => ({
              text: title,
              value: id,
            })),
          filteredValue: [contentTypeId] as any[],
          filterMultiple: false,
        }, {
          title: 'Updated',
          width: '175px',
          dataIndex: 'updatedAt',
          sorter: true,
          defaultSortOrder: 'descend' as any,
          render(text: string) {
            return distanceInWordsToNow(new Date(text)) + ' ago';
          }
        }, {
          title: 'Author',
          dataIndex: 'user.id',
          width: '120px',
          sorter: true,
          filters: get(data, 'allUsers', []).map(({ id, email }: any) => ({
            text: email,
            value: id,
          })),
          filteredValue: [userId] as any[],
          filterMultiple: false,
          align: 'center' as any,
          render(_text: string, record: any) {
            if (!record.user) {
              return <Avatar icon="user" />;
            }
            const { firstname, lastname, email } = record.user;
            return (
              <Tooltip title={`${firstname} ${lastname} (${email})`}>
                <Avatar style={{ backgroundColor: stringToColor(email) }}>
                  {firstname.substring(0, 1)}{lastname.substring(0, 1)}
                </Avatar>
              </Tooltip>
            )
          }
        }];

        const search = new URLSearchParams(location.search);
        if (contentReleaseId) {
          search.set('release', contentReleaseId);
        } else if (contentTypeId) {
          search.set('schema', '1');
        }
        search.set('locale', locale.id);

        const onMenuClick = (e: any) => {
          history.push(`/documents/create/${e.key}?${search}`);
        };

        const menu = (
          <Menu onClick={onMenuClick}>
            {get(data, 'allContentTypes', []).filter((n: any) => !n.isSlice && !n.isTemplate).map(({ id, title }: any) => (
              <Menu.Item key={id}>{title}</Menu.Item>
            ))}
          </Menu>
        );

        const items = get(data, 'allContentEntries.edges', [])
          .map(({ node }: any) => node);

        const contentRelease = ContentReleases.items.has(contentReleaseId)
          ? ContentReleases.items.get(contentReleaseId)
          : null;

        const publishRelease = () => {
          Modal.confirm({
            title: `Do you want to publish ${contentRelease!.name}?`,
            content: `This release contains ${pagination.total} documents`,
            onOk: async () => {
              await contentRelease!.publish();
              message.success('Release has been published');
              history.push('/documents');
            },
          });
        };

        return (
          <Layout>
            <Toolbar>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0 }}>{contentRelease ? `Release "${contentRelease.name}"` : 'Documents'}</h2>
              </div>
              {contentRelease && (
                <Button type="default" style={{ marginRight: 16 }} onClick={publishRelease} disabled={Boolean(contentRelease.publishedAt)}>Publish</Button>
              )}
              <Dropdown overlay={locales} trigger={['click']}>
                <Button type="default" style={{ marginRight: 16 }}>
                  <span className={`flagstrap-icon flagstrap-${locale.flag}`} style={{ marginRight: 8 }} />
                  {locale.name}
                  <Icon type="down" />
                </Button>
              </Dropdown>
              <Dropdown overlay={menu} trigger={['click']}>
                <Button type="primary">
                  Create
                  <Icon type="down" />
                </Button>
              </Dropdown>
            </Toolbar>
            <Content style={{ padding: 32, height: 'calc(100vh - 64px)' }}>
              <Card
                bodyStyle={{ padding: 0 }}
                bordered={false}
                className="with-table-pagination"
              >
                <Table
                  columns={columns}
                  rowKey="entryId"
                  dataSource={items}
                  pagination={pagination}
                  rowClassName={() => 'prime-row-click'}
                  onChange={onTableChange}
                  onRow={(record) => ({
                    onClick: () => {
                      history.push(`/documents/doc/${record.entryId}?${search}`);
                    },
                  })}
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
