import * as express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { GraphQLSchema, GraphQLObjectType, GraphQLInputObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLEnumType, GraphQLID } from 'graphql';
import { IFindOptions, Sequelize, ICountOptions } from 'sequelize-typescript';
import { createContext } from 'dataloader-sequelize';

import { sequelize } from '../sequelize';
import { ContentType } from '../models/ContentType';
import { ContentEntry } from '../models/ContentEntry';
import { ContentTypeField } from '../models/ContentTypeField';
import { PageInfo } from '../types/PageInfo';
import { processWhereQuery } from '../utils/processWhereQuery';
import { ETString } from '../types/entry/ETString';
import { ETDocument } from '../types/entry/ETDocument';
import { ETNumber } from '../types/entry/ETNumber';
import { ETImage } from '../types/entry/ETImage';

export const externalGraphql = async () => {

  const app = express();

  const genid = Math.floor(Math.random() * 1000);

  console.log('starting', genid);

  async function generateSchema() {
    const inputs = {} as any;
    const fields = {} as any;
    const contentTypes = await ContentType.findAll();
    await Promise.all(
      contentTypes.map(async (type) => {
        const contentTypeFields = await type.$get('fields') as ContentTypeField[];
        const gqlType = new GraphQLObjectType({
          name: type.name,
          fields: () => ({
            id: { type: GraphQLID },
            ...contentTypeFields.reduce((acc, field: ContentTypeField) => {
              if (field.type === 'string') {
                acc[field.name] = ETString.output();
              }

              if (field.type === 'number') {
                acc[field.name] = ETNumber.output();
              }

              if (field.type === 'document') {
                acc[field.name] = ETDocument.output(field, fields, contentTypes);
              }

              if (field.type === 'image') {
                acc[field.name] = ETImage.output();
              }

              return acc;
            }, {}),
          }),
        });

        // Model

        fields[type.name] = {
          type: gqlType,
          args: {
            id: { type: GraphQLID },
          },
          async resolve(root, args, context, info) {
            const entry = await ContentEntry.find({
              where: {
                contentTypeId: type.id,
                id: args.id,
              },
            });

            context.sequelizeDataLoader.prime(entry);

            if (entry) {
              return {
                id: entry.id,
                ...entry.data
              };
            }

            return null;
          },
        };

        // Sort By Type
        const sortByType = new GraphQLEnumType({
          name: `SortBy_${type.name}`,
          values: contentTypeFields.reduce((acc, field: ContentTypeField) => {
            acc[`${field.name}_ASC`] = { value: [sequelize.json(`data.${field.name}`), 'ASC'] };
            acc[`${field.name}_DESC`] = { value: [sequelize.json(`data.${field.name}`), 'DESC'] };
            return acc;
          }, {}),
        });

        const whereOpTypesFields = contentTypeFields.reduce((acc, field: ContentTypeField) => {
          if (field.type === 'string') {
            acc[field.name] = ETString.where();
          }

          if (field.type === 'number') {
            acc[field.name] = ETNumber.where();
          }

          return acc;
        }, {});

        const whereType = new GraphQLInputObjectType({
          name: `Where_${type.name}`,
          fields: () => ({
            ...whereOpTypesFields,
            OR: { type: new GraphQLList(whereType) },
            AND: { type: new GraphQLList(whereType) },
          }),
        });

        // query.allModel

        const ConnectionEdgeType = new GraphQLObjectType({
          name: `${type.name}ConnectionEdge`,
          fields: {
            node: { type: gqlType },
            cursor: { type: GraphQLString },
          },
        });

        const ConnectionType = new GraphQLObjectType({
          name: `${type.name}Connection`,
          fields: {
            pageInfo: { type: PageInfo },
            edges: { type: new GraphQLList(ConnectionEdgeType) },
            totalCount: { type: GraphQLInt },
          },
        });

        fields[`all${type.name}`] = {
          type: ConnectionType,
          args: {
            sortBy: { type: sortByType },
            where: { type: whereType },
            first: { type: GraphQLInt },
            skip: { type: GraphQLInt },
          },
          async resolve(root, args, context, info) {
            const findAllOptions: ICountOptions<ContentEntry> = {};
            const findAllPaging: IFindOptions<ContentEntry> = {
              offset: 0,
              limit: 50,
            };

            if (args.sortBy) {
              const [fieldName, sortOrder] = args.sortBy;
              findAllPaging.order = [
                [fieldName, sortOrder],
              ];
            }

            if (args.first) {
              if (args.skip) {
                findAllPaging.offset = args.skip;
              }
              findAllPaging.limit = args.first;
            }

            if (args.where) {
              findAllOptions.where = processWhereQuery(args.where);
            }

            findAllOptions.where = {
              [Sequelize.Op.and]: [{
                contentTypeId: type.id,
              }, findAllOptions.where],
            };

            const entries = await ContentEntry.findAll({
              ...findAllOptions,
              ...findAllPaging,
            } as any);
            context.sequelizeDataLoader.prime(entries);

            const totalCount = await ContentEntry.count(findAllOptions);
            const hasPreviousPage = Number(findAllPaging.offset) > 0 && totalCount > 0;
            const hasNextPage = (Number(findAllPaging.offset) + entries.length) < totalCount;

            return {
              totalCount,
              pageInfo: {
                hasPreviousPage,
                hasNextPage,
              },
              edges: entries.map(entry => ({
                cursor: entry.id,
                node: {
                  id: entry.id,
                  ...entry.data,
                }
              })),
            };
          }
        };

        // mutation.createModel

        inputs[`create${type.name}`] = {
          type: gqlType,
          args: {
            input: {
              type: new GraphQLInputObjectType({
                name: `Create${type.name}`,
                fields: contentTypeFields.reduce((acc, field: ContentTypeField) => {
                  if (field.type === 'string') {
                    acc[field.name] = ETString.input();
                  }
                  if (field.type === 'document') {
                    acc[field.name] = ETDocument.input();
                  }
                  return acc;
                }, {}),
              }),
            },
          },
          async resolve(root, args, context, info) {
            const entry = await ContentEntry.create({
              contentTypeId: type.id,
              data: args.input,
            });

            if (entry) {
              return {
                id: entry.id,
                ...entry.data
              };
            }

            return null;
          },
        };

        inputs[`update${type.name}`] = {
          type: gqlType,
          args: {
            id: { type: GraphQLID },
            input: {
              type: new GraphQLInputObjectType({
                name: `Update${type.name}`,
                fields: contentTypeFields.reduce((acc, field: ContentTypeField) => {
                  if (field.type === 'string') {
                    acc[field.name] = ETString.input();
                  }
                  return acc;
                }, {}),
              }),
            },
          },
          async resolve(root, args, context, info) {
            const entry = await ContentEntry.find({
              where: {
                contentTypeId: type.id,
                id: args.id,
              },
            });

            if (entry) {
              entry.update({
                data: args.input,
              });

              return {
                id: entry.id,
                ...entry.data
              };
            }

            return null;
          },
        };

        inputs[`delete${type.name}`] = {
          type: GraphQLInt,
          args: {
            id: { type: GraphQLID },
          },
          async resolve(root, args, context, info) {
            const entry = await ContentEntry.find({
              where: {
                contentTypeId: type.id,
                id: args.id,
              },
            });

            if (entry) {
              entry.destroy();
              return 1;
            }

            return 0;
          },
        };

      }),
    );

    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields,
      }),
      mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: inputs,
      }),
    });

    return schema;
  }

  const server = new ApolloServer({
    introspection: true,
    schema: await generateSchema(),
    context: async ({ req, connection }) => {
      console.log('context', genid);
      const sequelizeDataLoader = createContext(sequelize);
      return { sequelizeDataLoader };
    },
  });

  server.applyMiddleware({ app });

  return app;
}
