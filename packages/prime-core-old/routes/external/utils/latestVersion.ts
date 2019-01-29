import { sequelize } from '../../../sequelize';
import { withField } from './withFields';

const versionModel = '"ContentEntryVersion"';
const model = '"ContentEntry"';
const field = '"versionId"';
const idField = '"entryId"';

export const latestVersion = ({
  language,
  published,
  contentReleaseId,
  preview = false,
  masterLocale = null,
}: any): any => {
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

  let withLanguage = `${versionModel}."language" = ${sequelize.escape(language)}`;
  if (masterLocale) {
    withLanguage = `(${versionModel}."language" = ${sequelize.escape(
      language
    )} OR ${versionModel}."language" = ${sequelize.escape(masterLocale)})`;
    order = `CASE WHEN ${versionModel}."language" = ${sequelize.escape(
      language
    )} THEN 1 ELSE 2 END ASC, ${order}`;
  }

  return sequelize.literal(
    `${model}.${field} = (
      SELECT ${versionModel}.${field}
      FROM ${model} AS ${versionModel}
      WHERE ${withLanguage}
      ${withField('ContentEntryVersion.isPublished', published)}
      ${withRelease}
      AND ${versionModel}.${idField} = ${model}.${idField}
      AND ${versionModel}."deletedAt" IS NULL
      ORDER BY ${order}
      LIMIT 1
    )`
  );
};
