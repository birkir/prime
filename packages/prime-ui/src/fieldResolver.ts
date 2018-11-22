import { get } from 'lodash';
// export const fieldResolver = {};

// if (process.env.NODE_ENV !== 'production') {
//   try {
//     const fsg = require('./fieldResolver.generated');
//     console.log(fsg);
//   } catch (err) {
//     console.log('Fail', err);
//   }
// } else {
//   Object.entries((window as any).prime).forEach(([key, value]: any) => {
//     (fieldResolver as any)[key] = value;
//   });
// }

export const fieldResolver = async () => new Promise(resolve => {
  try {
    const fsg = require('./fieldResolver.generated');
    console.log(fsg);
  } catch (err) {}

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
