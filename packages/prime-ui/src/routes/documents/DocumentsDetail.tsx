import React, { createContext, useContext } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Layout, Tabs, Button, Input, Icon } from 'antd';
import { client } from '../../utils/client';
import { FieldString } from './components/FieldString';
import { Toolbar } from '../../components/toolbar/Toolbar';
import { Link } from 'react-router-dom';

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

export const DocumentsDetail = ({ match }: any) => {
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
              <Toolbar>
                <div style={{ flex: 1 }}>
                  <Link to="/documents" style={{ color: '#aaa' }}>
                    <Icon type="left" />
                    Back
                  </Link>
                </div>
                <Button onClick={onSave} type="primary">Save</Button>
              </Toolbar>
              <Content style={{ padding: 32 }}>
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
