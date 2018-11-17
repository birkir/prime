import { sequelize } from "../../../sequelize";
import { withField } from "./withFields";

const Model = '"ContentEntry"';
const field = '"entryId"';

export const includeLanguages = ({ published }) =>
  sequelize.literal(
    `(SELECT array_agg(DISTINCT "language") FROM ${Model} WHERE ${field} = ${Model}.${field}${withField('isPublished', published)})`
  );
