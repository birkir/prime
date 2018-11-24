import { ICountOptions, IFindOptions, Sequelize } from 'sequelize-typescript';
import { GraphQLObjectType, GraphQLInputObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLEnumType } from 'graphql';

import { sequelize } from '../../sequelize';
import { ContentEntry } from '../../models/ContentEntry';
import { PageInfo } from '../../types/PageInfo';
import { processWhereQuery } from '../../utils/processWhereQuery';
import { ContentTypeField } from '../../models/ContentTypeField';
import { resolveFieldType } from './utils/resolveFieldType';
import { includeLanguages } from './utils/includeLanguages';
import { latestVersion } from './utils/latestVersion';
import { ensurePermitted } from './utils/ensurePermitted';
import { UserInputError } from 'apollo-server-core';
import { debug } from './index';
import { decodeCursor, encodeCursor } from './utils/cursor';
import { transformEntry } from './utils/transformEntry';

function sortByProcessor(acc, field: ContentTypeField) {
  acc[`${field.name}_ASC`] = { value: [sequelize.json(`data.${field.name}`), 'ASC'] };
  acc[`${field.name}_DESC`] = { value: [sequelize.json(`data.${field.name}`), 'DESC'] };
  return acc;
};

export const findAll = ({ GraphQLContentType, contentType, contentTypes, queries }) => {

  const sortByValues = contentType.fields.reduce(sortByProcessor, {});

  const SortByType = new GraphQLEnumType({
    name: `${contentType.name}SortBy`,
    values: sortByValues,
  });

  const whereOpTypesFields = contentType.fields.reduce((acc, field: ContentTypeField) => {
    const FieldType = resolveFieldType(field);
    if (FieldType && FieldType.GraphQLWhere) {
      acc[field.name] = FieldType.GraphQLWhere();
    }
    if (!acc[field.name]) {
      delete acc[field.name];
    }

    return acc;
  }, {});

  const WhereType = new GraphQLInputObjectType({
    name: `${contentType.name}Where`,
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
      edges: { type: new GraphQLList(ConnectionEdgeType) },
      pageInfo: { type: PageInfo },
      totalCount: { type: GraphQLInt },
    },
  });

  const args: any = {
    language: { type: GraphQLString },
    first: { type: GraphQLInt },
    skip: { type: GraphQLInt },
    before: { type: GraphQLString },
    after: { type: GraphQLString },
  };

  if (Object.keys(sortByValues).length > 0) {
    args.sortBy = { type: SortByType };
  }

  if (Object.keys(whereOpTypesFields).length > 0) {
    args.where = { type: WhereType };
  }

  return {
    type: ConnectionType,
    args,
    async resolve(root, args, context, info) {

      const defaultLimit = 50;
      const contentReleaseId = context.contentReleaseId;
      const published = context.published;

      await ensurePermitted(context, contentType, 'read');

      const findAllOptions: ICountOptions<ContentEntry> = {};
      const language = args.language || 'en';
      const findAllPaging: IFindOptions<ContentEntry> = {
        attributes: {
          include: [
            [includeLanguages({ published }), 'languages'],
          ],
        },
        having: {
          versionId: latestVersion({ language, published, contentReleaseId }),
        },
        group: [
          'versionId'
        ],
      };

      if (args.sortBy) {
        const [fieldName, sortOrder] = args.sortBy;
        findAllPaging.order = [
          [fieldName, sortOrder],
        ];
      }

      if (args.where) {
        findAllOptions.where = processWhereQuery(args.where);
      }

      findAllOptions.where = {
        [Sequelize.Op.and]: [{
          contentTypeId: contentType.id,
        }, findAllOptions.where],
      };

      if (args.before || args.after) {
        if (args.before && args.after) {
          throw new UserInputError('Cannot be both before and after cursor');
        }

        const cursor = decodeCursor(args.before || args.after);
        debug('decoded cursor: %s', cursor);
        if (!cursor) {
          throw new UserInputError('Invalid cursor');
        }

        const rawQuery = sequelize.getQueryInterface().QueryGenerator.selectQuery('ContentEntry', {
          ...findAllPaging,
          ...findAllOptions,
          attributes: [
            'entryId',
            sequelize.literal(`$INDEX$`),
          ],
        }, ContentEntry);

        const sort = rawQuery.match(/\) ORDER BY (.*?);/);
        const sql = `
          SELECT "index" FROM (
            ${rawQuery.replace('$INDEX$', `row_number() OVER (ORDER BY ${sort[1]}) AS index`).replace(/;$/, '')}
          ) AS "table"
          WHERE "table"."entryId" = ${sequelize.escape(cursor)}
        `;
        const result = await sequelize.query(sql);
        if (result[0] && result[0][0]) {
          const index = Number(result[0][0].index);
          debug('cursor index: %o', index);
          if (args.after) {
            findAllPaging.offset = index;
          } else {
            findAllPaging.offset = Math.max(0, index - (args.first || defaultLimit))
          }
        } else {
          debug(result);
          throw new UserInputError('Cursor out of date');
        }
      }

      if (args.first) {
        if (args.skip) {
          findAllPaging.offset = args.skip;
        }
        findAllPaging.limit = args.first;
      }

      findAllPaging.offset = findAllPaging.offset || 0;
      findAllPaging.limit = findAllPaging.limit || defaultLimit;

      const entries = await ContentEntry.findAll({
        ...findAllOptions,
        ...findAllPaging,
      } as any);

      context.sequelizeDataLoader.prime(entries);

      const totalCount = await ContentEntry.count({
        ...findAllOptions,
        where: {
          ...findAllOptions.where,
          isPublished: published,
          language: language,
        },
        distinct: true,
        col: 'entryId',
      });
      const hasPreviousPage = Number(findAllPaging.offset) > 0 && totalCount > 0;
      const hasNextPage = (Number(findAllPaging.offset) + entries.length) < totalCount;

      return {
        totalCount,
        pageInfo: {
          hasPreviousPage,
          hasNextPage,
          startCursor: entries.length > 0 && encodeCursor(entries[0].entryId),
          endCursor: entries.length > 0 && encodeCursor(entries[entries.length - 1].entryId),
        },
        edges: entries.map(entry => ({
          cursor: encodeCursor(entry.entryId),
          node: transformEntry(entry),
        })),
      };
    }
  };
}
