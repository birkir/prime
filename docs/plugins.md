# Plugins

# Custom Fields

Custom field has to have couple of things

1. Provide GraphQL types
2. Provide UI for field settings
3. Provide Editorial field input UI in document

For a good and simple template, see https://github.com/birkir/prime/tree/master/packages/prime-field-number

## Tutorial

1. Lets create a new field called demo-field in a folder `./lib/demo-field`

You will need a class that extends the base prime field `./index.js`

```js
// index.js

import { PrimeField } from '@primecms/field';
import { GraphQLString } from 'graphql';

export default DemoField extends PrimeField {

  static name = 'demo';
  static title = 'Demo';
  static description = 'Demo field';
  static options = {};

  async outputType() {
    return { type: GraphQLString };
  }

  async inputType() {
    return { type: GraphQLString };
  }

  async whereType() {
    return { type: GraphQLString };
  }

  async processInput(data) {
    return data;
  }

  async processOutput(data) {
    return data;
  }
}
```

2. Next you will need an UI component for your field. `./ui/index.js`.

```js
// ui/index.js

import { registerField } from '@primecms/field';
import { Form, Input } from 'antd';

function InputComponent({ form, field, path, initialValue = false }) {
  return (
    <Form.Item label={field.title}>
      {form.getFieldDecorator(path, { initialValue })(<Input />)}
    </Form.Item>
  );
}

export default registerField('demo', {
  InputComponent,
});
```

3. To register your field, you have to add a `.primerc` in your project root and provide the path to your field source files like in the following sample (works also for npm packages)

```json
{
  "fields": [
    "@primecms/field-string",
    "@primecms/field-number",
    "@primecms/field-group",
    "./lib/demo-field"
  ]
}
```
