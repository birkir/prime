import React, { createContext, useContext } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Layout, Tabs, Button, Input } from 'antd';
import { client } from '../../utils/client';
import { FieldString } from './components/FieldString';

const { Sider, Content } = Layout;
const { TabPane } = Tabs;

const GET_SCHEMA = gql`
  query getSchema($entryId: ID) {
    getContentTypeSchema(entryId: $entryId) {
      title
      fields {
        id
        name
        type
        options
        fields {
          id
          name
          type
          options
        }
      }
    }
    ContentEntry(entryId: $entryId) {
      versionId
      data
    }
  }
`;

const ContentContext = createContext({});

function renderField(field: any) {
  return (
    <ContentContext.Consumer key={field.name}>
      {(entry: any) => {
        const value = entry.data[field.name];

        if (field.type === 'string') {
          return <FieldString field={field} value={value} />
        }

        return (
          <div>
            <strong>{field.name}</strong>
            <br />
            <Input type="text" value={value} />
          </div>
        );
      }}
    </ContentContext.Consumer>
  );
}

const renderGroup = (group: any) => (
  <TabPane
    key={group.title}
    tab={group.title}
  >
    {group.fields.map(renderField)}
  </TabPane>
);

export const ContentEntryDetail = ({ match }: any) => {
  const onSave = () => null;
  const entryId = match.params.id;

  return (
    <Query
      query={GET_SCHEMA}
      client={client}
      variables={{ entryId }}
    >
      {({ loading, error, data, refetch }) => {
        if (error) {
          return `Error! ${error.message}`;
        }

        if (loading) {
          return null;
        }

        const groups = data.getContentTypeSchema;

        return (
          <ContentContext.Provider value={data.ContentEntry}>
            <Layout style={{ minHeight: '100%' }}>
              <Content style={{ padding: 16, backgroundColor: 'white' }}>
                <Button onClick={onSave}>Save</Button>
                <Tabs size="large">
                  {groups.map(renderGroup)}
                </Tabs>
              </Content>
            </Layout>
          </ContentContext.Provider>
        );
      }}
    </Query>
  );
};
