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
  query allDocuments(
    $locale: String
    $schemaId: ID
    $releaseId: ID
    $first: Int = 10
    $skip: Int
    $sort: [DocumentConnectionSort!]
  ) {
    allSchemas {
      edges {
        node {
          id
          name
          title
          variant
        }
      }
    }
    allDocuments(
      first: $first
      skip: $skip
      filter: { locale: $locale, schemaId: $schemaId, releaseId: $releaseId }
      sort: $sort
    ) {
      totalCount
      edges {
        node {
          id
          documentId
          locale
          publishedAt
          updatedAt
          primary
          schemaId
          userId
          published {
            id
          }
        }
        cursor
      }
    }
  }
`;

const PER_PAGE = 50;

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
  let skip = 0;
  const contentReleaseId = options.release || null;

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
        schemaId: contentTypeId,
        releaseId: contentReleaseId,
        userId,
        first: PER_PAGE,
        skip,
        locale: locale.id,
        sort: 'updatedAt_DESC',
      }}
    >
      {({ error, data, refetch }: any): any => {
        if (error) {
          return `Error! ${error.message}`;
        }

        const pagination = {
          total: get(data, 'allDocuments.totalCount'),
          pageSize: PER_PAGE,
        };

        const onTableChange = async (paging: any, filters: any, sorter: any) => {
          contentTypeId = filters.schemaId && filters.schemaId[0];
          userId = filters['user.id'] && filters['user.id'][0];

          const formatSorterField = (field: string = 'updatedAt') => {
            if (field === 'user.id') {
              field = 'userId';
            }
            return `${field}_${sorter.order === 'ascend' ? 'ASC' : 'DESC'}`;
          };

          skip = paging.pageSize * (paging.current - 1);

          const variables = {
            schemaId: contentTypeId,
            releaseId: contentReleaseId,
            userId,
            first: paging.pageSize,
            skip,
            sort: formatSorterField(sorter.field),
            locale: locale.id,
          };
          refetch(variables);
        };

        const columns = [
          {
            title: '',
            dataIndex: 'documentId',
            sorter: false,
            width: '52px',
            render(text: string, record: any) {
              let backgroundColor = record.publishedAt || record.published ? '#79cea3' : '#faad14';
              let icon = record.publishedAt ? 'caret-right' : 'exclamation';
              let dot = !record.published || record.publishedAt !== null ? false : true;

              if (contentReleaseId) {
                dot = false;
                icon = 'clock-circle';
                backgroundColor = '#4A90E2';
              }

              if (options.locale && record.locale !== options.locale) {
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
              const isLocale = options.locale && record.locale !== options.locale;
              const isItalic = isLocale || !record.primary;
              return (
                <div style={{ display: 'flex' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      flex: 1,
                      fontStyle: isItalic ? 'italic' : '',
                      opacity: isItalic ? 0.75 : 1,
                    }}
                  >
                    {record.primary || `(id: ${record.documentId})`}
                  </span>
                  {isLocale && <Tag color="orange">Needs translation</Tag>}
                </div>
              );
            },
          },
          {
            title: 'Type',
            width: '175px',
            dataIndex: 'schemaId',
            filters: ContentTypes.list
              .filter((n: any) => n.variant === 'Default')
              .map(({ id, title }: any) => ({
                text: title,
                value: id,
              })),
            // filteredValue: (contentTypeId ? [contentTypeId] : null) as any,
            filterMultiple: false,
            render(schemaId: string) {
              return ContentTypes.items.get(schemaId)!.name;
            },
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
            filteredValue: userId,
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
            {get(data, 'allSchemas.edges', [])
              .filter((n: any) => n.node.variant === 'Default')
              .map(({ node: { name, title } }: any) => (
                <Menu.Item key={name}>{title}</Menu.Item>
              ))}
          </Menu>
        );

        const items = get(data, 'allDocuments.edges', []).map(({ node }: any) => node);

        const contentRelease = ContentReleases.items.has(contentReleaseId || '')
          ? ContentReleases.items.get(contentReleaseId || '')
          : null;

        const publishRelease = () => {
          Modal.confirm({
            title: `Do you want to publish ${contentRelease!.name}?`,
            content: `This release contains ${contentRelease!.documentsCount} document${
              contentRelease!.documentsCount === 1 ? '' : 's'
            }`,
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
                  href="#"
                  type="default"
                  style={{ marginRight: 16 }}
                  onClick={publishRelease}
                  {...{ disabled: Boolean(contentRelease.publishedAt) }}
                >
                  Publish
                </Button>
              )}
              <Dropdown overlay={locales} trigger={['click']}>
                <Button href="#" type="default" style={{ marginRight: 16 }}>
                  <span
                    className={`flagstrap-icon flagstrap-${locale.flag}`}
                    style={{ marginRight: 8 }}
                  />
                  {locale.name}
                  <Icon type="down" />
                </Button>
              </Dropdown>
              <Dropdown overlay={menu} trigger={['click']}>
                <Button href="#" type="primary">
                  Create
                  <Icon type="down" />
                </Button>
              </Dropdown>
            </Toolbar>
            <Layout.Content style={{ padding: 32, height: 'calc(100vh - 64px)' }}>
              <Card bodyStyle={{ padding: 0 }} bordered={false} className="with-table-pagination">
                <Table
                  columns={columns}
                  rowKey="documentId"
                  dataSource={items}
                  pagination={pagination}
                  rowClassName={() => 'prime-row-click'}
                  onChange={onTableChange}
                  onRow={record => ({
                    onClick: () => {
                      const schema = ContentTypes.items.get(record.schemaId);
                      const url = `/documents/doc/${record.documentId}/${opts({
                        type: schema!.name.toLowerCase(),
                      })}`;
                      window.open(url);
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
