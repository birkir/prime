import { get } from 'lodash';

export const fieldResolver = async () => new Promise(resolve => {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const genFields = require('./fieldResolver.generated')
      return resolve(genFields.default);
    } catch (err) {}
  }

  const load = () => {
    const fields = get(window, 'prime', {});
    resolve(fields);
  }

  if (!document.getElementById('__PrimeFields')) {
    const script = document.createElement('script');
    script.src = '/fields.js';
    script.id = '__PrimeFields';
    script.onload = load;
    document.body.appendChild(script);
  } else {
    load();
  }
});
