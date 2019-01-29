require('dotenv').config(); // tslint:disable-line no-var-requires

import { server } from './server';
const port = Number(process.env.PORT) || 4000;

export default server({ port });
