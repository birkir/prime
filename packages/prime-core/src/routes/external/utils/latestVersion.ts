import { sequelize } from '../../../sequelize';
import { withField } from './withFields';

const versionModel = '"ContentEntryVersion"';
const model = '"ContentEntry"';
const field = '"versionId"';
const idField = '"entryId"';

 // tslint:disable-next-line no-any
export const latestVersion = ({ language, published, contentReleaseId, preview = false }): any => {
  let order = `${versionModel}."createdAt" DESC`;
  let withRelease = `AND ${versionModel}."contentReleaseId" IS NULL`;
  if (contentReleaseId) {
    order = `${versionModel}."contentReleaseId" DESC, ${order}`;
    withRelease = `
      AND (
        ${versionModel}."contentReleaseId" = ${sequelize.escape(contentReleaseId)}
        ${preview ? `OR ${versionModel}."contentReleaseId" IS NULL` : ''}
      )
    `;
  }

  return sequelize.literal(
    `${model}.${field} = (
      SELECT ${versionModel}.${field}
      FROM ${model} AS ${versionModel}
      WHERE ${versionModel}."language" = ${sequelize.escape(language)}
      ${withField('ContentEntryVersion.isPublished', published)}
      ${withRelease}
      AND ${versionModel}.${idField} = ${model}.${idField}
      ORDER BY ${order}
      LIMIT 1
    )`
  );
};
