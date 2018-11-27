import { sequelize } from '../../../sequelize';
import { withField } from './withFields';

const versionModel = '"ContentEntryVersion"';
const model = '"ContentEntry"';
const field = '"versionId"';
const idField = '"entryId"';

 // tslint:disable-next-line no-any
export const latestVersion = ({ language, published, contentReleaseId }): any => {
  let order = `${versionModel}."createdAt" DESC`;
  let withRelease = '';
  if (contentReleaseId) {
    order = `${versionModel}."contentReleaseId" DESC, ${order}`;
    withRelease = `
      AND (
        ${versionModel}."contentReleaseId" = ${sequelize.escape(contentReleaseId)}
        OR
        ${versionModel}."contentReleaseId" IS NULL
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
