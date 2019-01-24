import { Badge, Table } from 'antd';
import { format } from 'date-fns';
import gql from 'graphql-tag';
import { get } from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { client } from '../../utils/client';

export const WebhookCalls = ({ match }: any) => (
  <>
    <h3>Activity Log</h3>
    <Query
      client={client}
      variables={{ id: match.params.webhookId }}
      fetchPolicy="network-only"
      query={gql`
        query allWebhookCalls($id: ID!) {
          allWebhookCalls(id: $id) {
            id
            success
            status
            request
            response
            executedAt
          }
        }
      `}
    >
      {({ data, error, loading }) => {
        const items = get(data, 'allWebhookCalls', []);

        return (
          <Table
            dataSource={items}
            pagination={false}
            rowKey="name"
            columns={[
              {
                key: 'executedAt',
                title: 'Executed At',
                render(text, record: any) {
                  return format(record.executedAt, 'YYYY-MM-DD HH:mm:ss');
                },
              },
              {
                key: 'status',
                title: 'Status',
                dataIndex: 'status',
                render(text, record: any) {
                  if (record.status === -1) {
                    return <Badge status="error" text="ECONNREFUSED" />;
                  }
                  const status = record.success ? 'success' : 'warning';
                  return <Badge status={status} text={`HTTP ${record.status}`} />;
                },
              },
            ]}
          />
        );
      }}
    </Query>
  </>
);
