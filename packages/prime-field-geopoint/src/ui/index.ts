import { registerField } from '@primecms/field';
import { InputComponent } from './InputComponent';
import { SchemaSettingsComponent } from './SchemaSettingsComponent';
import './styles';

const style = document.createElement('link');
style.rel = 'stylesheet';
style.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.4.0/leaflet.css';
document.body.appendChild(style);

export default registerField('geopoint', {
  InputComponent,
  SchemaSettingsComponent,
});
