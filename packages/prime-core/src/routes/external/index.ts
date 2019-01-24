import { ApolloServer } from 'apollo-server-express';
import { createContext } from 'dataloader-sequelize';
import express from 'express';
import { GraphQLBoolean, GraphQLID, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { get, omit } from 'lodash';
import { ContentEntry } from '../../models/ContentEntry';
import { ContentType } from '../../models/ContentType';
import { ContentTypeField } from '../../models/ContentTypeField';
import { Settings } from '../../models/Settings';
import { sequelize } from '../../sequelize';
import { contentEntryMetaType } from '../../types/contentEntryMetaType';
import { EntryTransformer } from '../../utils/entryTransformer';
import { Sentry } from '../../utils/Sentry';
import { create } from './create';
import { find } from './find';
import { findAll } from './findAll';
import { remove } from './remove';
import { update } from './update';
import { resolveFieldType } from './utils/resolveFieldType';

// import { User } from '../../models/User';
// import { acl } from '../../acl';

interface IContext {
  settings: any;
  sequelizeDataLoader: any;
  public: boolean;
  published: null | boolean;
  contentReleaseId: null | string;
  versionId: null | string;
  entryId: null | string;
}

export const entryTransformer = new EntryTransformer();

// tslint:disable-next-line no-require-imports no-var-requires
export const debug = require('debug')('prime:graphql');

// tslint:disable-next-line max-func-body-length
export const externalGraphql = async () => {
  const app = express();

  entryTransformer.resetTransformCache();

  const queries = {
    __slices: {},
  };
  const inputs = {};
  const models = {
    ContentEntry,
    ContentType,
  };

  const settings = await Settings.get();

  const contentTypes = await ContentType.findAll();

  debug(contentTypes.length, 'content types');

  await Promise.all(
    contentTypes.map(async contentType => {
      const contentTypeIds = get(contentType, 'settings.contentTypeIds', []);
      contentTypeIds.push(contentType.id);

      const fields = await ContentTypeField.findAll({
        where: {
          contentTypeId: contentTypeIds,
        },
      });

      contentType.fields = [
        ...fields.filter(field => field.contentTypeId === contentType.id),
        ...fields.filter(field => field.contentTypeId !== contentType.id),
      ];

      entryTransformer.cache.set(contentType.id, contentType.fields);
    })
  );

  // slices are prio
  contentTypes.sort((a: any, b: any) => b.isSlice - a.isSlice);

  await Promise.all(
    contentTypes.map(async contentType => {
      const outputFields = () =>
        contentType.fields.reduce((acc, field: ContentTypeField) => {
          const fieldType = resolveFieldType(field);
          if (fieldType) {
            acc[field.name] = fieldType.getGraphQLOutput({
              field,
              queries,
              models,
              contentType,
              contentTypes,
              resolveFieldType,
            });
          }
          if (!acc[field.name]) {
            delete acc[field.name];
          }

          return acc;
        }, {});

      // tslint:disable-next-line variable-name
      const GraphQLContentType = new GraphQLObjectType({
        name: contentType.name,
        fields: () => ({
          id: { type: GraphQLID },
          ...outputFields(),
          _meta: { type: contentEntryMetaType },
        }),
      });

      if (contentType.isSlice) {
        debug('content type %s is a slice', contentType.id);
        queries.__slices[contentType.name] = {
          outputType: new GraphQLObjectType({
            name: `${contentType.name}Slice`,
            fields: outputFields,
          }),
          inputType: null, // @todo we maybe want to store this type for further reuse
        };
        return null;
      }

      if (contentType.isTemplate) {
        debug('content type %s is a template', contentType.id);

        return null;
      }

      debug('created content type:', `${contentType.name}(${contentType.fields.map(field => field.name).join(', ')})`);

      queries[contentType.name] = find({ GraphQLContentType, contentType, contentTypes, queries });
      queries[`all${contentType.name}`] = findAll({ GraphQLContentType, contentType, contentTypes, queries });

      if (get(contentType, 'settings.mutations', true) === true) {
        inputs[`create${contentType.name}`] = create({ GraphQLContentType, contentType, contentTypes, queries });
        inputs[`update${contentType.name}`] = update({ GraphQLContentType, contentType, contentTypes, queries });
        inputs[`remove${contentType.name}`] = remove({ GraphQLContentType, contentType, contentTypes, queries });
      }
    })
  );

  const queriesAndMutations: any = {};
  const realQueries = omit(queries, '__slices') as any;

  if (Object.keys(realQueries).length === 0) {
    realQueries[`isEmpty`] = {
      type: GraphQLBoolean,
      resolve() {
        return true;
      },
    };
  } else if (Object.keys(inputs).length > 0) {
    queriesAndMutations.mutation = new GraphQLObjectType({
      name: 'Mutation',
      fields: inputs,
    });
  }

  queriesAndMutations.query = new GraphQLObjectType({
    name: 'Query',
    fields: realQueries,
  });

  const schema = new GraphQLSchema(queriesAndMutations);

  const server = new ApolloServer({
    introspection: true,
    tracing: true,
    schema,
    context: async ({ req }) => {
      try {
        const cookie = String(req.headers.cookie);
        const cookies = new Map(cookie.split(';').map(n => n.trim().split('=')) as any);

        if (req.headers['x-prime-version-id'] && req.headers['x-prime-version-id'].length === 36) {
          cookies.set('prime.versionId', req.headers['x-prime-version-id']);
        }

        const context: IContext = {
          settings,
          sequelizeDataLoader: createContext(sequelize),
          public: settings.accessType === 'public',
          published: true,
          contentReleaseId: null,
          versionId: null,
          entryId: null,
        };

        debug('context.public %o', context.public);

        if (cookies.has('prime.versionId')) {
          const versionId = cookies.get('prime.versionId') as string;
          debug('context.versionId %o', versionId);
          if (versionId.length === 36) {
            const entry = await ContentEntry.findOne({ where: { versionId } });
            if (entry) {
              context.entryId = entry.id;
              if (entry.contentReleaseId) {
                context.contentReleaseId = entry.contentReleaseId;
              } else if (!entry.isPublished) {
                context.published = null;
              }
            } else {
              context.contentReleaseId = versionId;
              context.published = null;
            }

            context.versionId = versionId;

            debug('context.published %o', context.published);
            debug('context.contentReleaseId %o', context.contentReleaseId);
          }
        }

        if (
          req.user &&
          String(req.headers.referer).match(/\/graphql(\/?\?.*)?$/) &&
          !req.headers['x-prime-published']
        ) {
          context.published = null;
          debug('context.published %o %s', context.published, '(overwrite)');
        }

        return context;
      } catch (err) {
        console.error(err); // tslint:disable-line no-console
        return {};
      }
    },
    formatError(error) {
      if (Sentry) {
        Sentry.captureException(error);
      }

      return error;
    },
  });

  server.applyMiddleware({
    app,
    cors: {
      origin: true,
    },
  });

  return { app, server };
};
