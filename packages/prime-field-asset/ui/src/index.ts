import { registerField } from '@primecms/field';
import { InputComponent } from './InputComponent';
import { SchemaSettingsComponent } from './SchemaSettingsComponent';

// tslint:disable-next-line no-default-export export-name
export default registerField('asset', {
  InputComponent,
  SchemaSettingsComponent
});
