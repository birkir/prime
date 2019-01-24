import { Modal, Table } from 'antd';
import { format } from 'date-fns';
import { Observer } from 'mobx-react';
import React from 'react';
import { ContentReleases } from '../../stores/contentReleases';

export const ContentReleasePicker = (props: any) => {
  React.useEffect(
    () => {
      if (props.visible) {
        ContentReleases.loadAll();
      }
    },
    [props.visible]
  );

  return (
    <Modal
      visible={props.visible}
      onCancel={props.onCancel}
      title="Select Release"
      bodyStyle={{
        padding: 0,
        overflow: 'hidden',
        borderRadius: '0 0 4px 4px',
      }}
      className="modal-table-picker"
      footer={false}
      // okText="Create"
    >
      <Observer
        render={() => (
          <Table
            showHeader={false}
            pagination={false}
            locale={{
              emptyText: 'No releases available',
            }}
            columns={[
              {
                key: 'title',
                title: 'Title',
                render(record) {
                  return (
                    <>
                      <strong>{record.name}</strong>
                      <div>{record.description}</div>
                    </>
                  );
                },
              },
              {
                key: 'scheduledAt',
                title: 'Scheduled at',
                render(record) {
                  if (!record.scheduledAt) {
                    return '---';
                  }

                  return format(record.scheduledAt, 'YYYY-MM-DD HH:mm');
                },
              },
            ]}
            rowKey="id"
            rowClassName={() => 'prime-row-click'}
            dataSource={ContentReleases.list}
            onRow={record => ({
              onClick: () => {
                if (typeof props.onSelect === 'function') {
                  props.onSelect(record);
                }
                if (typeof props.onCancel === 'function') {
                  props.onCancel();
                }
              },
            })}
          />
        )}
      />
    </Modal>
  );
};
