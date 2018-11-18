import { sequelize } from '../../../sequelize';
import { withField } from './withFields';

const VersionModel = '"ContentEntryVersion"';
const Model = '"ContentEntry"';
const field = '"versionId"';
const idField = '"entryId"';

export const latestVersion = ({ language, published, contentReleaseId }) => {
  let order = `${VersionModel}."createdAt" DESC`;
  let withRelease = '';
  if (contentReleaseId) {
    order = `${VersionModel}."contentReleaseId" DESC, ${order}`;
    withRelease = `
      AND (
        ${VersionModel}."contentReleaseId" = ${sequelize.escape(contentReleaseId)}
        OR
        ${VersionModel}."contentReleaseId" IS NULL
      )
    `;
  }

  return sequelize.literal(
    `${Model}.${field} = (
      SELECT ${VersionModel}.${field}
      FROM ${Model} AS ${VersionModel}
      WHERE ${VersionModel}."language" = ${sequelize.escape(language)}
      ${withField('ContentEntryVersion.isPublished', published)}
      ${withRelease}
      AND ${VersionModel}.${idField} = ${Model}.${idField}
      ORDER BY ${order}
      LIMIT 1
    )`
  ) as any;
};
