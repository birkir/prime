import { registerField } from '@primecms/field';
import 'braft-editor/dist/index.css'; // tslint:disable-line no-import-side-effect no-submodule-imports
import { InputComponent } from './InputComponent';
import { SchemaSettingsComponent } from './SchemaSettingsComponent';

// tslint:disable-next-line no-default-export export-name
export default registerField('string', {
  InputComponent,
  SchemaSettingsComponent
});
