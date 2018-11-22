import { primeConfig } from './primeConfig';

// Resolve fields
export const fields = [];

console.log(primeConfig);


(primeConfig.fields || []).map((moduleName: string) => {
  // import('./' + moduleName + '/src')
  //   .then(console.log);
  // try {
  //   return new (require(moduleName).default)();
  // } catch (err) {
  //   console.error(
  //     'ERROR: Could not resolve field module',
  //     '"' + moduleName + '"'
  //   );
  //   console.error(err);
  // }
  return null;
})
.filter((n: any) => !!n);
