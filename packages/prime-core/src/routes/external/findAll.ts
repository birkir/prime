import { GraphQLEnumType, GraphQLInputObjectType, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { ICountOptions, IFindOptions, Sequelize } from 'sequelize-typescript';

import { UserInputError } from 'apollo-server-core';
import { ContentEntry } from '../../models/ContentEntry';
import { ContentTypeField } from '../../models/ContentTypeField';
import { sequelize } from '../../sequelize';
import { pageInfoType } from '../../types/pageInfoType';
import { processWhereQuery } from '../../utils/processWhereQuery';
import { debug } from './index';
import { decodeCursor, encodeCursor } from './utils/cursor';
import { ensurePermitted } from './utils/ensurePermitted';
import { includeLanguages } from './utils/includeLanguages';
import { latestVersion } from './utils/latestVersion';
import { resolveFieldType } from './utils/resolveFieldType';
import { transformEntry } from './utils/transformEntry';

function sortByProcessor(acc, field: ContentTypeField) {
  acc[`${field.name}_ASC`] = { value: [sequelize.json(`data.${field.name}`), 'ASC'] };
  acc[`${field.name}_DESC`] = { value: [sequelize.json(`data.${field.name}`), 'DESC'] };

  return acc;
}

// tslint:disable max-func-body-length

export const findAll = ({ GraphQLContentType, contentType, contentTypes, queries }) => {

  const sortByValues = contentType.fields.reduce(sortByProcessor, {});

  const sortByType = new GraphQLEnumType({
    name: `${contentType.name}SortBy`,
    values: sortByValues
  });

  const whereOpTypesFields = contentType.fields.reduce(
    (acc, field: ContentTypeField) => {
      const fieldType = resolveFieldType(field);
      if (fieldType) {
        acc[field.name] = fieldType.getGraphQLWhere();
      }
      if (!acc[field.name]) {
        delete acc[field.name];
      }

      return acc;
    },
    {}
  );

  const whereType = new GraphQLInputObjectType({
    name: `${contentType.name}Where`,
    fields: () => ({
      ...whereOpTypesFields,
      OR: { type: new GraphQLList(whereType) },
      AND: { type: new GraphQLList(whereType) }
    })
  });

  const connectionEdgeType = new GraphQLObjectType({
    name: `${contentType.name}ConnectionEdge`,
    fields: {
      node: { type: GraphQLContentType },
      cursor: { type: GraphQLString }
    }
  });

  const connectionType = new GraphQLObjectType({
    name: `${contentType.name}Connection`,
    fields: {
      edges: { type: new GraphQLList(connectionEdgeType) },
      pageInfo: { type: pageInfoType },
      totalCount: { type: GraphQLInt }
    }
  });

  const typeArgs: any = { // tslint:disable-line no-any
    language: { type: GraphQLString },
    first: { type: GraphQLInt },
    skip: { type: GraphQLInt },
    before: { type: GraphQLString },
    after: { type: GraphQLString }
  };

  if (Object.keys(sortByValues).length > 0) {
    typeArgs.sortBy = { type: sortByType };
  }

  if (Object.keys(whereOpTypesFields).length > 0) {
    typeArgs.where = { type: whereType };
  }

  return {
    type: connectionType,
    args: typeArgs,
    // tslint:disable-next-line cyclomatic-complexity
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
            [includeLanguages({ published }), 'languages']
          ]
        },
        having: {
          versionId: latestVersion({ language, published, contentReleaseId })
        },
        group: [
          'versionId'
        ]
      };

      if (args.sortBy) {
        const [fieldName, sortOrder] = args.sortBy;
        findAllPaging.order = [
          [fieldName, sortOrder]
        ];
      }

      if (args.where) {
        findAllOptions.where = processWhereQuery(args.where);
      }

      findAllOptions.where = {
        [Sequelize.Op.and]: [{
          contentTypeId: contentType.id
        }, findAllOptions.where]
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

        const rawQuery = sequelize.getQueryInterface().QueryGenerator.selectQuery(
          'ContentEntry',
          {
            ...findAllPaging,
            ...findAllOptions,
            attributes: [
              'entryId',
              sequelize.literal(`$INDEX$`)
            ]
          },
          ContentEntry
        );

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
            findAllPaging.offset = Math.max(0, index - (args.first || defaultLimit));
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
        ...findAllPaging
      });

      context.sequelizeDataLoader.prime(entries);

      const totalCount = await ContentEntry.count({
        ...findAllOptions,
        where: {
          ...findAllOptions.where,
          isPublished: published,
          language: language
        },
        distinct: true,
        col: 'entryId'
      });
      const hasPreviousPage = Number(findAllPaging.offset) > 0 && totalCount > 0;
      const hasNextPage = (Number(findAllPaging.offset) + entries.length) < totalCount;

      return {
        totalCount,
        pageInfo: {
          hasPreviousPage,
          hasNextPage,
          startCursor: entries.length > 0 && encodeCursor(entries[0].entryId),
          endCursor: entries.length > 0 && encodeCursor(entries[entries.length - 1].entryId)
        },
        edges: entries.map(entry => ({
          cursor: encodeCursor(entry.entryId),
          node: transformEntry(entry)
        }))
      };
    }
  };
};
