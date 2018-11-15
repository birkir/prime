import { sequelize } from "../../../sequelize";

const Model = 'ContentEntry';
const field = 'entryId';

export const includeLanguages = (published) =>
  sequelize.literal(
    `(SELECT array_agg(DISTINCT "language") FROM "${Model}" WHERE "${field}" = "${Model}"."${field}"${published === null || published === undefined ? '' : `AND "isPublished" = ${published ? 'true' : 'false'}`})`
  );
