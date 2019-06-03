import { PrimeFieldProps } from '@primecms/field';
import { Form } from 'antd';
import { ValidationRule } from 'antd/lib/form';
import BraftEditor from 'braft-editor';
import { debounce } from 'lodash';
import { draftToMarkdown, markdownToDraft } from 'markdown-draft-js';
import React from 'react';

const defaultControls = [
  'headings',
  'bold',
  'italic',
  'code',
  'blockquote',
  'list-ul',
  'list-ol',
  'link',
  'emoji',
];

const allControls = [
  'headings',
  'separator',
  'bold',
  'italic',
  'code',
  'blockquote',
  'separator',
  'list-ul',
  'list-ol',
  'separator',
  'link',
  'emoji',
];

const markdownConfig = {
  preserveNewlines: true,
  remarkablePreset: 'full',
};

export class InputComponent extends React.PureComponent<PrimeFieldProps> {
  public state = {
    value: BraftEditor.createEditorState(markdownToDraft(this.props.initialValue, markdownConfig)),
  };

  public setMarkdownValue = debounce(() => {
    try {
      const { form, path } = this.props;
      form.setFieldsValue({
        [path]: draftToMarkdown(JSON.parse(this.state.value.toRAW()), markdownConfig).replace(
          /\n\n/g,
          '\n \n'
        ),
      });
    } catch (err) {
      console.error('Error converting rich text to markdown'); // tslint:disable-line no-console
    }
  }, 330);

  public componentWillReceiveProps(nextProps: PrimeFieldProps) {
    if (nextProps.initialValue !== this.props.initialValue) {
      this.setState({
        value: BraftEditor.createEditorState(
          markdownToDraft(nextProps.initialValue, markdownConfig)
        ),
      });
    }
  }

  public onChange = (value: any) => {
    this.setState({ value }, this.setMarkdownValue);
  };

  public renderDraft = (rules: ValidationRule[]) => {
    const { form, field, path, initialValue = '' } = this.props;
    const { getFieldDecorator } = form;
    const features = field.options.md || defaultControls;

    const controls = allControls
      .filter(item => {
        if (item === 'separator') {
          return true;
        }

        return features.indexOf(item) >= 0;
      })
      .filter((item, index, arr) => {
        if (
          item === 'separator' &&
          (index === 0 || arr[index - 1] === item || index - 1 === arr.length)
        ) {
          return false;
        }

        return true;
      });

    // Add undo/redo
    controls.push('separator', 'undo', 'redo');

    return (
      <Form.Item label={field.title}>
        <BraftEditor
          controls={controls as any}
          value={this.state.value}
          onChange={this.onChange}
          language="en"
        />
        {getFieldDecorator(path, { initialValue, rules })(<input type="hidden" />)}
      </Form.Item>
    );
  };

  // tslint:disable-next-line cyclomatic-complexity
  public render() {
    const { field } = this.props;
    const rules = field.options.rules || {};

    const fieldRules: ValidationRule[] = [];

    if (rules.required) {
      fieldRules.push({
        required: true,
        message: `${field.title} is required`,
      });
    }

    return this.renderDraft(fieldRules);
  }
}
