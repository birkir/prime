import { sequelize } from '../../../sequelize';
import { withField } from './withFields';

const model = '"ContentEntry"';
const field = '"entryId"';

export const includeLanguages = ({ published }) =>
  sequelize.literal(
    `(SELECT array_agg(DISTINCT "language") FROM ${model} "d" WHERE "d".${field} = ${model}.${field}${withField(
      'isPublished',
      published
    )} AND "d"."deletedAt" IS NULL)`
  );
