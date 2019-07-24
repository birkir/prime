import { User } from '@accounts/typeorm';
import { GraphQLModule } from '@graphql-modules/core';
import { gql } from 'apollo-server-core';
import { execute } from 'graphql';
import 'reflect-metadata';
import Container from 'typedi';
import { Connection, getRepository, useContainer } from 'typeorm';
import { createExternal } from '../../src/modules/external';
import { createInternal } from '../../src/modules/internal';
import { connect } from '../../src/utils/connect';
import { createSchemaQuery } from '../utils/createSchemaQuery';

useContainer(Container);

describe('InternalModule', () => {
  let connection: Connection;
  let external: GraphQLModule;
  let internal: GraphQLModule;
  let user;
  const context: any = { req: { headers: {} } };

  const query = async (document, which = external, ctx = context) => {
    const contextValue = await which.context(ctx);
    contextValue.user = user;
    return execute({
      schema: which.schema,
      contextValue,
      document,
    });
  };

  beforeAll(async () => {
    connection = await connect(process.env.TEST_DATABASE_URL);

    await connection.dropDatabase();
    await connection.synchronize();

    internal = await createInternal(connection);
    external = await createExternal(connection);

    const onboard = await query(
      gql`
        mutation {
          onboard(email: "demodemo@gmail.com", password: "demodemo")
        }
      `,
      internal
    );
    expect(onboard!.data!.onboard).toBe(true);
    user = await getRepository(User).findOne();
  });

  afterAll(() => connection.close());

  describe('GraphQL Module', () => {
    it('should have schema', () => {
      expect(external.schema).toBeTruthy();
    });
    it('should have resolvers', () => {
      expect(external.resolvers).toBeTruthy();
    });
  });

  describe('health', () => {
    it('should have fields', async () => {
      const result = await query(
        gql`
          query {
            allFields {
              type
              title
              description
              defaultOptions
              ui
            }
          }
        `,
        internal
      );
      const fields = result.data!.allFields!.map(({ ui, ...rest }) => rest);
      expect(fields).toMatchSnapshot();
    });
  });

  describe('No Schemas', () => {
    it('should work to query PrimeDocument', async () => {
      const result = await query(gql`
        query {
          Prime_Document {
            ... on Prime_Document_NotFound {
              message
            }
          }
        }
      `);
      expect(result).toEqual({ data: { Prime_Document: null } });
    });
  });

  describe('One Schema', () => {
    beforeAll(async () => {
      const fields = [{ name: 'name' }, { name: 'bio' }, { name: 'age', type: 'number' }];
      await query(
        gql`
          mutation {
            createSchema(
              input: ${createSchemaQuery('Author', fields)}
            ) {
              id
              title
              name
            }
          }
        `,
        internal
      );
      external = await createExternal(connection);
    });

    it('should have Author schema', async () => {
      const res = await query(
        gql`
          query {
            __schema {
              types {
                name
              }
            }
          }
        `
      );
      expect(res!.data!.__schema!.types.find(n => n.name === 'Author')).toEqual({ name: 'Author' });
    });

    it('should be able to create author', async () => {
      const res = await query(
        gql`
          mutation {
            createAuthor(input: { name: "John Doe", bio: "Anonymous person" }) {
              id
              _meta {
                id
              }
            }
          }
        `
      );

      const {
        id,
        _meta: { id: uuid },
      } = res!.data!.createAuthor as any;

      expect(id).toBeTruthy();

      const res2 = await query(
        gql`
          query {
            Document(id: "${id}") {
              id
              name
              bio
            }
          }
        `
      );
      expect(res2!.data).toEqual({});

      const publish = await query(
        gql`
          mutation {
            publishDocument(id: "${uuid}") {
              id
            }
          }
      `,
        internal
      );
      expect(publish).toBeTruthy();

      const res3 = await query(
        gql`
          query {
            Author(id: "${id}") {
              id
              name
              bio
            }
          }
        `
      );
      expect(res3!.data!.Author).toEqual({ id, name: 'John Doe', bio: 'Anonymous person' });

      const res4 = await query(
        gql`
          query {
            allAuthor(sort: { name: ASC }, where: { name: { neq: "" } }) {
              edges {
                node {
                  id
                  name
                  bio
                }
              }
            }
          }
        `
      );
      expect(res4!.data!.allAuthor!.edges).toHaveLength(1);

      const res5 = await query(
        gql`
          query {
            Document(id:"${id}") {
              id
            }
          }
        `,
        internal
      );
      expect(res5!.data!).toBeTruthy();

      const unpublish = await query(
        gql`
          mutation {
            unpublishDocument(id: "${uuid}") {
              id
            }
          }
      `,
        internal
      );
      expect(unpublish).toBeTruthy();
    });

    it('should show list of documents', async () => {
      const res = await query(
        gql`
          query {
            allDocuments {
              edges {
                node {
                  id
                  documentId
                  schemaId
                  releaseId
                  locale
                  primary
                  data
                  createdAt
                  updatedAt
                  publishedAt
                }
              }
            }
          }
        `,
        internal
      );
      expect(res!.data!.allDocuments).toBeTruthy();
    });

    it('should show list of users', async () => {
      const res = await query(
        gql`
          query {
            allUsers {
              edges {
                node {
                  id
                  profile
                  emails {
                    address
                    verified
                  }
                  username
                }
              }
            }
          }
        `,
        internal
      );
      expect(res!.data!.allUsers).toBeTruthy();
    });

    it('should show list of schemas', async () => {
      const res = await query(
        gql`
          query allSchemas {
            allSchemas {
              edges {
                node {
                  id
                  name
                  title
                  groups
                  settings
                  variant
                  documentCount
                  fields {
                    title
                    fields {
                      id
                      name
                      title
                      description
                      type
                      options
                      primary
                      schemaId
                      fields {
                        id
                        name
                        title
                        description
                        type
                        options
                        primary
                        schemaId
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        internal
      );
      expect(res!.data!.allSchemas).toBeTruthy();
    });

    it('should show prime version', async () => {
      const res = await query(
        gql`
          query {
            allFields {
              type
              title
              description
              defaultOptions
              ui
            }
            getSettings {
              accessType
              previews {
                name
                hostname
                pathname
              }
              locales {
                id
                name
                flag
                master
              }
              env
            }
          }
        `,
        internal
      );
      expect(res!.data!).toBeTruthy();
    });

    it('should have releases', async () => {
      await query(
        gql`
          mutation {
            createRelease(input: { name: "foo" }) {
              id
              name
              description
              scheduledAt
              publishedAt
              publishedBy
              updatedAt
              createdAt
            }
          }
        `,
        internal
      );
      const res = await query(
        gql`
          query {
            allReleases {
              edges {
                node {
                  id
                  name
                  description
                  scheduledAt
                  publishedAt
                  publishedBy
                  updatedAt
                  createdAt
                }
              }
            }
          }
        `,
        internal
      );
      expect(res!.data!.allReleases!.edges).toHaveLength(1);
    });
  });

  describe('Document queries', () => {
    const createPublishedAuthor = async (name, bio, age) => {
      const res = await query(
        gql`
          mutation {
            createAuthor(input: { name: "${name}", bio: "${bio}", age: ${age} }) {
              id
              _meta {
                id
              }
            }
          }
        `
      );

      const {
        _meta: { id: uuid },
      } = res!.data!.createAuthor as any;

      await query(
        gql`
          mutation {
            publishDocument(id: "${uuid}") {
              id
            }
          }
        `,
        internal
      );

      return res;
    };

    beforeAll(async () => {
      await createPublishedAuthor('Ted Turner', 'Organizer. Incurable problem solver.', 27);
      await createPublishedAuthor('Philip Young', 'Friendly thinker. Certified bacon expert.', 44);
      await createPublishedAuthor('Chris Peterson', 'Proud coffee expert. Webaholic.', 87);
      await createPublishedAuthor('Joseph Turner', 'Twitter junkie. Certified troublemaker.', 53);
      await createPublishedAuthor(
        'Benjamin Stewart',
        'Lifelong problem solver. Pop culture enthusiast.',
        36
      );
    });

    it('should show all authors', async () => {
      const res = await query(
        gql`
          query {
            allAuthor {
              edges {
                node {
                  name
                  bio
                  age
                }
              }
            }
          }
        `
      );
      expect(res!.data!.allAuthor!.edges).toHaveLength(5);
    });
    it('should show correct order with one sortBy key', async () => {
      const res1 = await query(
        gql`
          query {
            allAuthor(sort: { name: ASC }) {
              edges {
                node {
                  name
                  bio
                  age
                }
              }
            }
          }
        `
      );

      expect(res1!.data!.allAuthor!.edges![0].node.name).toBe('Benjamin Stewart');
      expect(res1!.data!.allAuthor!.edges![4].node.name).toBe('Ted Turner');

      const res2 = await query(
        gql`
          query {
            allAuthor(sort: { age: DESC }) {
              edges {
                node {
                  name
                  bio
                  age
                }
              }
            }
          }
        `
      );

      expect(res2!.data!.allAuthor!.edges![0].node.name).toBe('Chris Peterson');
      expect(res2!.data!.allAuthor!.edges![4].node.name).toBe('Ted Turner');
    });

    it('should show correct posts with one filter', async () => {
      const res1 = await query(
        gql`
          query {
            allAuthor(where: { name: { eq: "Joseph Turner" } }) {
              edges {
                node {
                  name
                  bio
                  age
                }
              }
            }
          }
        `
      );

      expect(res1!.data!.allAuthor!.edges).toHaveLength(1);
      expect(res1!.data!.allAuthor!.edges![0].node.name).toBe('Joseph Turner');

      const res2 = await query(
        gql`
          query {
            allAuthor(where: { name: { contains: "Turner" } }) {
              edges {
                node {
                  name
                  bio
                  age
                }
              }
            }
          }
        `
      );

      expect(res2!.data!.allAuthor!.edges).toHaveLength(2);

      const res3 = await query(
        gql`
          query {
            allAuthor(where: { name: { in: ["Philip Young", "Chris Peterson"] } }) {
              edges {
                node {
                  name
                  bio
                  age
                }
              }
            }
          }
        `
      );

      expect(res3!.data!.allAuthor!.edges).toHaveLength(2);
    });

    it('should show correct posts with two filters', async () => {
      const res1 = await query(
        gql`
          query {
            allAuthor(where: { name: { contains: "Turner" }, age: { eq: 27 } }) {
              edges {
                node {
                  name
                  bio
                  age
                }
              }
            }
          }
        `
      );

      expect(res1!.data!.allAuthor!.edges).toHaveLength(1);
      expect(res1!.data!.allAuthor!.edges![0].node.name).toBe('Ted Turner');

      const res2 = await query(
        gql`
          query {
            allAuthor(
              where: {
                OR: {
                  AND: { name: { contains: "Turner" }, name: { contains: "Ted" } }
                  age: { eq: 87 }
                }
              }
            ) {
              edges {
                node {
                  name
                  bio
                  age
                }
              }
            }
          }
        `
      );

      expect(res2!.data!.allAuthor!.edges).toHaveLength(2);
    });
  });
});
