import React from 'react';
import { config } from '../../utils/config';



export const Playground = () => (
  <iframe
    src={`${config.coreUrl}/graphql`}
    frameBorder="0"
    style={{
      width: '100%',
      height: 'calc(100vh - 5px)',
    }}
  />
);
