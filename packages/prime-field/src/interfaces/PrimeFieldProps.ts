import { FormComponentProps } from 'antd/lib/form';
import { Document } from './Document';
import { SchemaField } from './SchemaField';

export interface PrimeFieldProps {
  initialValue?: string;
  field: SchemaField;
  form: FormComponentProps['form'];
  stores: {
    Auth: any;
    Settings: any;
    ContentEntries: any;
    ContentTypes: any;
    Users: any;
  };
  children?: any;
  document?: Document;
  path: string;
  renderField(args: PrimeFieldProps): React.ReactNode;
}
