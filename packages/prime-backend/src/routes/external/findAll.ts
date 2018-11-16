import { ICountOptions, IFindOptions, Sequelize } from 'sequelize-typescript';
import { GraphQLObjectType, GraphQLInputObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLEnumType } from 'graphql';

import { sequelize } from '../../sequelize';
import { ContentEntry } from '../../models/ContentEntry';
import { PageInfo } from '../../types/PageInfo';
import { processWhereQuery } from '../../utils/processWhereQuery';
import { ContentTypeField } from '../../models/ContentTypeField';
import { resolveFieldType } from './types/resolveFieldType';
import { includeLanguages } from './utils/includeLanguages';
import { latestVersion } from './utils/latestVersion';
import { ensurePermitted } from './utils/ensurePermitted';

function sortByProcessor(acc, field: ContentTypeField) {
  acc[`${field.name}_ASC`] = { value: [sequelize.json(`data.${field.name}`), 'ASC'] };
  acc[`${field.name}_DESC`] = { value: [sequelize.json(`data.${field.name}`), 'DESC'] };
  return acc;
};

export const findAll = (GraphQLContentType, contentType) => {

  const SortByType = new GraphQLEnumType({
    name: `SortBy_${contentType.name}`,
    values: contentType.fields.reduce(sortByProcessor, {}),
  });

  const whereOpTypesFields = contentType.fields.reduce((acc, field: ContentTypeField) => {
    const FieldType = resolveFieldType(field);
    if (FieldType && FieldType.where) {
      acc[field.name] = FieldType.where();
    }

    return acc;
  }, {});

  const WhereType = new GraphQLInputObjectType({
    name: `Where_${contentType.name}`,
    fields: () => ({
      ...whereOpTypesFields,
      OR: { type: new GraphQLList(WhereType) },
      AND: { type: new GraphQLList(WhereType) },
    }),
  });

  const ConnectionEdgeType = new GraphQLObjectType({
    name: `${contentType.name}ConnectionEdge`,
    fields: {
      node: { type: GraphQLContentType },
      cursor: { type: GraphQLString },
    },
  });

  const ConnectionType = new GraphQLObjectType({
    name: `${contentType.name}Connection`,
    fields: {
      pageInfo: { type: PageInfo },
      edges: { type: new GraphQLList(ConnectionEdgeType) },
      totalCount: { type: GraphQLInt },
    },
  });

  return {
    type: ConnectionType,
    args: {
      language: { type: GraphQLString },
      sortBy: { type: SortByType },
      where: { type: WhereType },
      first: { type: GraphQLInt },
      skip: { type: GraphQLInt },
    },
    async resolve(root, args, context, info) {

      await ensurePermitted(context, contentType, 'read');

      const findAllOptions: ICountOptions<ContentEntry> = {};
      const published = true;
      const language = args.language || 'en';
      const findAllPaging: IFindOptions<ContentEntry> = {
        attributes: {
          include: [
            [includeLanguages(published), 'languages'],
          ],
        },
        having: {
          versionId: latestVersion({ language, published }),
        },
        group: [
          'versionId'
        ],
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
          contentTypeId: contentType.id,
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
          cursor: entry.entryId,
          node: {
            _meta: {
              language: entry.language,
              languages: [].concat((entry as any).languages),
              createdAt: entry.createdAt.toISOString(),
              updatedAt: entry.updatedAt.toISOString(),
            },
            id: entry.entryId,
            ...entry.data,
          }
        })),
      };
    }
  };
}
