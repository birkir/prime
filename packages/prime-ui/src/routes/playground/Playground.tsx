import React, { useEffect } from 'react';
import { Settings } from '../../stores/settings';

export const Playground = () => {
  return (
    <iframe
      id="playground"
      src={`${Settings.coreUrl}/graphql`}
      frameBorder="0"
      style={{
        width: '100%',
        height: 'calc(100vh - 5px)',
      }}
    />
  );
};
