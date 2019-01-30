import { Button, Icon, message, Modal, Popconfirm, Table } from 'antd';
import { distanceInWordsToNow, format } from 'date-fns';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Instance } from 'mobx-state-tree';
import React from 'react';
import { ContentReleases } from '../../stores/contentReleases';
import { ContentRelease } from '../../stores/models/ContentRelease';
import { REMOVE_CONTENT_RELEASE } from '../../stores/mutations';
import { client } from '../../utils/client';
import { ReleasesDrawer } from './ReleasesDrawer';

@observer
export class Releases extends React.Component<any> {
  @observable public isOpen = false;
  @observable public item: any;

  public componentDidMount() {
    ContentReleases.loadAll();
  }

  public onClickDelete = async (contentRelease: Instance<typeof ContentRelease>) => {
    const res: any = await client.mutate({
      mutation: REMOVE_CONTENT_RELEASE,
      variables: {
        id: contentRelease.id,
      },
    });

    if (res.data && res.data.removeContentRelease) {
      ContentReleases.remove(contentRelease);
    } else {
      message.error('Could not remove release');
    }
  };

  public onClickCreate = () => {
    this.isOpen = true;
  };

  public onClickPublish = async (contentRelease: Instance<typeof ContentRelease>) => {
    await contentRelease.publish();
    this.forceUpdate();
  };

  get columns() {
    return [
      {
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
      },
      {
        key: 'description',
        title: 'Description',
        dataIndex: 'description',
      },
      {
        key: 'scheduledAt',
        title: 'Scheduled',
        render(text: any, record: any) {
          if (!record.scheduledAt) {
            return '---';
          }

          return format(record.scheduledAt, 'YYYY-MM-DD HH:mm');
        },
      },
      {
        key: 'documents',
        title: '',
        render(text: any, record: any) {
          if (!record.publishedAt) {
            return (
              <span>
                {Number(record.documents)} doc{record.documents === 1 ? '' : 's'}.
              </span>
            );
          } else {
            return `${distanceInWordsToNow(record.publishedAt)} ago`;
          }
        },
      },
      {
        key: 'actions',
        align: 'right',
        render: (text: any, record: any) => (
          <>
            <Button
              disabled={record.publishedAt}
              onClick={(e: any) => {
                e.stopPropagation();
                Modal.confirm({
                  title: `Do you want to publish ${record.name}?`,
                  content: `This release contains ${record.documents} documents`,
                  onOk: () => this.onClickPublish(record),
                });
              }}
              style={{ marginRight: 8 }}
            >
              Publish
            </Button>
            <Button
              style={{ paddingLeft: 8, paddingRight: 8, marginRight: 8 }}
              disabled={record.publishedAt}
              onClick={(e: any) => {
                this.isOpen = true;
                this.item = record;
                e.stopPropagation();
              }}
            >
              <Icon type="edit" theme="filled" />
            </Button>
            <Popconfirm
              title="Are you sure?"
              icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
              onConfirm={(e: any) => {
                e.stopPropagation();
                this.onClickDelete(record);
              }}
              onCancel={(e: any) => e.stopPropagation()}
            >
              <Button
                style={{ paddingLeft: 8, paddingRight: 8 }}
                onClick={(e: any) => e.stopPropagation()}
              >
                <Icon type="delete" theme="filled" />
              </Button>
            </Popconfirm>
          </>
        ),
      },
    ];
  }

  public render() {
    return (
      <>
        <Table
          rowKey="id"
          rowClassName={record => (!record.publishedAt ? 'prime-row-click' : '')}
          columns={this.columns as any}
          footer={() => (
            <Button
              onClick={() => {
                this.isOpen = true;
              }}
            >
              Create
            </Button>
          )}
          dataSource={ContentReleases.list}
          pagination={false}
          onRow={record => ({
            onClick: () => {
              if (!record.publishedAt) {
                this.props.history.push(`/documents/by/release:${record.id}`);
              }
            },
          })}
        />
        <ReleasesDrawer
          isOpen={this.isOpen}
          onClose={() => {
            this.isOpen = false;
            this.item = null;
          }}
          item={this.item}
        />
      </>
    );
  }
}
