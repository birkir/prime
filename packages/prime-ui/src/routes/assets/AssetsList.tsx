import { Avatar, Card, Icon, Layout, Table, Tooltip, Upload } from 'antd';
import { distanceInWordsToNow } from 'date-fns';
import gql from 'graphql-tag';
import { get } from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { Toolbar } from '../../components/toolbar/Toolbar';
import { Assets } from '../../stores/assets';
import { ContentReleases } from '../../stores/contentReleases';
import { client } from '../../utils/client';
import { fileSizeFormat } from '../../utils/file-size-format';
import { stringToColor } from '../../utils/stringToColor';
import './AssetsList.css';

interface CustomRequestParam {
  action: string;
  data: any;
  file: File;
  filename: string;
  headers: any;
  onError: (err: Error, ret: any) => void;
  onProgress: (e: Event) => void;
  onSuccess: (ret: any, xhr: any) => void;
  withCredentials: boolean;
}

interface IOptions {
  [key: string]: string | undefined;
}

const GET_ASSET_ENTRIES = gql`
  query allAssets($first: Int = 10, $skip: Int, $order: AssetConnectionOrder!) {
    allAssets(first: $first, skip: $skip, order: $order) {
      totalCount
      edges {
        node {
          id
          fileName
          fileSize
          mimeType
          url
          updatedAt
          userId
        }
        cursor
      }
    }
  }
`;

const PER_PAGE = 30;

export const AssetsList = ({ match, history }: any) => {
  React.useEffect(() => {
    ContentReleases.loadAll();
  }, [match.location]);

  let userId: any;
  let skip = 0;

  const customRequest = (param: CustomRequestParam) => {
    return Assets.create({ upload: param.file })
      .catch(err => param.onError(err, null))
      .then(response => param.onSuccess(response, null));
  };

  return (
    <Query
      query={GET_ASSET_ENTRIES}
      client={client}
      fetchPolicy="network-only"
      variables={{
        first: PER_PAGE,
        skip,
        order: 'updatedAt_DESC',
      }}
    >
      {({ loading, error, data, refetch }) => {
        if (error) {
          return `Error! ${error.message}`;
        }

        const pagination = {
          total: get(data, 'allAssets.totalCount'),
          pageSize: PER_PAGE,
        };

        const onTableChange = async (paging: any, filters: any, sorter: any) => {
          userId = filters['user.id'] && filters['user.id'][0];

          const formatSorterField = (field: string = 'updatedAt') => {
            return `${field}_${sorter.order === 'ascend' ? 'ASC' : 'DESC'}`;
          };

          skip = paging.pageSize * (paging.current - 1);

          const variables = {
            first: paging.pageSize,
            skip,
            order: formatSorterField(sorter.field),
          };
          refetch(variables);
        };

        const columns = [
          {
            title: '',
            dataIndex: 'url',
            sorter: false,
            width: '50px',
            render(url: string) {
              return <img style={{ width: 50, height: 50 }} src={url} />;
            },
          },
          {
            title: 'Name',
            width: '175px',
            dataIndex: 'fileName',
            filterMultiple: false,
          },
          {
            title: 'Type',
            width: '175px',
            dataIndex: 'mimeType',
            filterMultiple: false,
          },
          {
            title: 'Size',
            width: '50px',
            dataIndex: 'fileSize',
            filterMultiple: false,
            render(fileSize: number) {
              return fileSizeFormat(fileSize);
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

        const items = get(data, 'allAssets.edges', []).map(({ node }: any) => node);

        return (
          <Layout>
            <Toolbar>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0 }}>Assets</h2>
              </div>
              <Upload
                name="file"
                listType="picture-card"
                multiple={true}
                customRequest={customRequest}
              >
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Icon type="upload" style={{ marginRight: 4 }} />
                  <div className="ant-upload-text">Upload assets</div>
                </div>
              </Upload>
            </Toolbar>
            <Layout.Content style={{ padding: 32, height: 'calc(100vh - 64px)' }}>
              <Card bodyStyle={{ padding: 0 }} bordered={false} className="with-table-pagination">
                <Table
                  columns={columns}
                  rowKey="id"
                  dataSource={items}
                  pagination={pagination}
                  rowClassName={() => 'prime-row-click'}
                  onChange={onTableChange}
                  onRow={record => ({
                    onClick: () => {
                      history.push(`/assets/doc/${record.id}`);
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
