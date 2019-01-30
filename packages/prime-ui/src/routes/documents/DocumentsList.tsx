import {
  Avatar,
  Badge,
  Button,
  Card,
  Dropdown,
  Icon,
  Layout,
  Menu,
  message,
  Modal,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import { distanceInWordsToNow } from 'date-fns';
import gql from 'graphql-tag';
import { get } from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { Toolbar } from '../../components/toolbar/Toolbar';
import { ContentReleases } from '../../stores/contentReleases';
import { ContentTypes } from '../../stores/contentTypes';
import { Settings } from '../../stores/settings';
import { client } from '../../utils/client';
import { stringToColor } from '../../utils/stringToColor';

interface IOptions {
  type?: string;
  locale?: string;
  release?: string;

  [key: string]: string | undefined;
}

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
    ContentType(id: $contentTypeId) {
      id
      name
      title
    }
    allContentTypes(order: "title") {
      id
      name
      title
      isSlice
      isTemplate
    }
    allUsers {
      id
      email
    }
    allContentEntries(
      limit: $limit
      skip: $skip
      language: $language
      contentTypeId: $contentTypeId
      contentReleaseId: $contentReleaseId
      sort: $sort
      order: $order
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
            name
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
  const options: IOptions = String(match.params.options)
    .split(';')
    .reduce((acc: { [key: string]: string }, item: string) => {
      const [key, value] = item.split(':');
      acc[key] = value;
      return acc;
    }, {});

  const opts = (proposed = {}) => {
    return Object.entries({ ...options, ...proposed })
      .filter(([key, value]) => value && value !== '')
      .map(kv => kv.join(':'))
      .join(';');
  };

  const locale = Settings.locales.find(l => l.id === options.locale) || Settings.masterLocale;

  React.useEffect(() => {
    ContentReleases.loadAll();
    ContentTypes.loadAll();
  }, [match.location]);

  const onLocaleClick = (e: any) => {
    history.push(`/documents/by/${opts({ locale: e.key })}`);
  };

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
  let contentTypeId: any = null;
  const contentReleaseId = options.release || '';

  if (options.type) {
    const contentType = ContentTypes.list.find(
      c => c.name.toLocaleLowerCase() === String(options.type).toLocaleLowerCase()
    );
    if (contentType) {
      contentTypeId = contentType.id;
    }
  }

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
        order: 'DESC',
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
          if (field === 'user.id') {
            return 'userId';
          }
          return field;
        };

        const onTableChange = async (paging: any, filters: any, sorter: any) => {
          contentTypeId = filters['contentType.title'] && filters['contentType.title'][0];
          userId = filters['user.id'] && filters['user.id'][0];

          const variables = {
            contentTypeId,
            contentReleaseId,
            userId,
            limit: paging.pageSize,
            skip: (paging.current - 1) * paging.pageSize,
            sort: formatSorterField(sorter.field),
            language: locale.id,
            order: sorter.order === 'ascend' ? 'ASC' : 'DESC',
          };
          refetch(variables);
        };

        const columns = [
          {
            title: '',
            dataIndex: 'entryId',
            sorter: false,
            width: '52px',
            render(text: string, record: any) {
              let backgroundColor = record.publishedVersionId ? '#79cea3' : '#faad14';
              let icon = record.publishedVersionId ? 'caret-right' : 'exclamation';
              let dot = !record.publishedVersionId || record.isPublished ? false : true;

              if (contentReleaseId) {
                dot = false;
                icon = 'clock-circle';
                backgroundColor = '#4A90E2';
              }

              if (options.locale && record.language !== options.locale) {
                dot = false;
                icon = 'global';
                backgroundColor = '#D3D7D6';
              }

              return (
                <Badge count={dot ? '!' : 0} style={{ backgroundColor: '#faad14' }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 4,
                      backgroundColor,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 21,
                      color: 'white',
                    }}
                  >
                    <Icon type={icon} />
                  </div>
                </Badge>
              );
            },
          },
          {
            title: 'Title',
            dataIndex: 'data.title',
            render(text: string, record: any) {
              if (options.locale && record.language !== options.locale) {
                return (
                  <div style={{ display: 'flex' }}>
                    <i style={{ display: 'inline-flex', flex: 1 }}>{record.display}</i>
                    <Tag color="orange">Needs translation</Tag>
                  </div>
                );
              }
              return record.display;
            },
          },
          {
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
          },
          {
            title: 'Updated',
            width: '175px',
            dataIndex: 'updatedAt',
            sorter: true,
            defaultSortOrder: 'descend' as any,
            render(text: string) {
              return distanceInWordsToNow(new Date(text)) + ' ago';
            },
          },
          {
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
            render(text: string, record: any) {
              if (!record.user) {
                return <Avatar icon="user" />;
              }
              const { firstname, lastname, email } = record.user;
              return (
                <Tooltip title={`${firstname} ${lastname} (${email})`}>
                  <Avatar style={{ backgroundColor: stringToColor(email) }}>
                    {firstname.substring(0, 1)}
                    {lastname.substring(0, 1)}
                  </Avatar>
                </Tooltip>
              );
            },
          },
        ];

        const onMenuClick = (e: any) => {
          history.push(`/documents/create/${opts({ type: e.key.toLocaleLowerCase() })}`);
        };

        const menu = (
          <Menu onClick={onMenuClick}>
            {get(data, 'allContentTypes', [])
              .filter((n: any) => !n.isSlice && !n.isTemplate)
              .map(({ name, title }: any) => (
                <Menu.Item key={name}>{title}</Menu.Item>
              ))}
          </Menu>
        );

        const items = get(data, 'allContentEntries.edges', []).map(({ node }: any) => node);

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
                <h2 style={{ margin: 0 }}>
                  {contentRelease ? `Release "${contentRelease.name}"` : 'Documents'}
                </h2>
              </div>
              {contentRelease && (
                <Button
                  type="default"
                  style={{ marginRight: 16 }}
                  onClick={publishRelease}
                  disabled={Boolean(contentRelease.publishedAt)}
                >
                  Publish
                </Button>
              )}
              <Dropdown overlay={locales} trigger={['click']}>
                <Button type="default" style={{ marginRight: 16 }}>
                  <span
                    className={`flagstrap-icon flagstrap-${locale.flag}`}
                    style={{ marginRight: 8 }}
                  />
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
            <Layout.Content style={{ padding: 32, height: 'calc(100vh - 64px)' }}>
              <Card bodyStyle={{ padding: 0 }} bordered={false} className="with-table-pagination">
                <Table
                  columns={columns}
                  rowKey="entryId"
                  dataSource={items}
                  pagination={pagination}
                  rowClassName={() => 'prime-row-click'}
                  onChange={onTableChange}
                  onRow={record => ({
                    onClick: () => {
                      history.push(
                        `/documents/doc/${record.entryId}/${opts({
                          type: record.contentType.name.toLocaleLowerCase(),
                        })}`
                      );
                    },
                  })}
                />
              </Card>
              <div style={{ height: 180 }} />
            </Layout.Content>
          </Layout>
        );
      }}
    </Query>
  );
};
