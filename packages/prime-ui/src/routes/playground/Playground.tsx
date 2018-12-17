import React from 'react';
import { Settings } from '../../stores/settings';


export const Playground = () => (
  <iframe
    src={`${Settings.coreUrl}/graphql`}
    frameBorder="0"
    style={{
      width: '100%',
      height: 'calc(100vh - 5px)',
    }}
  />
);
