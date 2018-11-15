import { sequelize } from '../../../sequelize';

export const latestVersion = ({ language, published }) => sequelize.literal(
  `"ContentEntry"."versionId" = (SELECT "ContentEntryVersion"."versionId" FROM "ContentEntry" AS "ContentEntryVersion" WHERE "ContentEntryVersion"."language" = ${sequelize.escape(language)}${published === null || published === undefined ? '' : `AND "ContentEntryVersion"."isPublished" = ${published ? 'true' : 'false'}`} AND "ContentEntryVersion"."entryId" = "ContentEntry"."entryId" ORDER BY "ContentEntryVersion"."createdAt" DESC LIMIT 1)`
) as any;
