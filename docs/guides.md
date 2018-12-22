# Guides

<i>(placeholder)</i>

## Implementing a custom field

Custom field has to have couple of things

  1. Provide GraphQL type for input and output.
  2. Provide UI for field settings
  3. Provide Editorial field input UI in document

For a good and simple template, see https://github.com/birkir/prime/tree/master/packages/prime-field-number

> Tutorial

1. Lets create a new field called demo-field in a folder `./lib/demo-field`

You will need a class that extends the base prime field `./index.js`
```js
import { PrimeField } from '@primecms/field';
import { GraphQLString } from 'graphql';

export default DemoField extends PrimeField {

  id = 'demo';
  title = 'Demo';
  description = 'Demo field';

  defaultOptions = {};
  
  getGraphQLOutput() {
    return { type: GraphQLString };
  }

  getGraphQLInput() {
    return { type: GraphQLString };
  }
  
  getGraphQLWhere() {
    return null;
  }
}
```

2. Next you will need an UI component for your field, we rely heavilly on ant design for user interface implementations.

```js
import { registerField } from '@primecms/field';
import { Form, Input } from 'antd';

export default registerField('demo', {
  InputComponent({ form, field, path, initialValue = false }) {
    return (
      <Form.Item label={field.title}>
        {form.getFieldDecorator(path, { initialValue })(<Input />)}
      </Form.Item>
    );
  }
});

3. To register your field in prime, you can add a `.primerc` and provide the path to your field source files like in the following sample:

```json
{
  "fields": [
    "@primecms/field-string",
    "./lib/demo-field"
  ]
}
```
