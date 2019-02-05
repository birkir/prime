import { PrimeField } from '../PrimeField';
import { createMockSchema } from './createMockSchema';
import { createMockSchemaField } from './createMockSchemaField';

export const runFieldPropertiesTest = (PrimeFieldTest: typeof PrimeField) => {
  const schema = createMockSchema({ name: 'ExampleSchema' });
  const primeField = createMockSchemaField({ name: 'sample', type: PrimeFieldTest.type, schema });
  const repositories = {} as any; // not ready yeeet
  const test = new PrimeFieldTest(primeField, repositories);

  describe(`${PrimeFieldTest.toString()} should have required properties`, () => {
    it('should have options object', () => {
      expect(test.options).toBeTruthy();
    });

    it('should have processInput function', () => {
      expect(typeof test.processInput).toBe('function');
    });

    it('should have processOutput function', () => {
      expect(typeof test.processOutput).toBe('function');
    });

    it('should have inputType function', () => {
      expect(typeof test.inputType).toBe('function');
    });

    it('should have outputType function', () => {
      expect(typeof test.inputType).toBe('function');
    });

    it('should have whereType function', () => {
      expect(typeof test.inputType).toBe('function');
    });
  });
};
