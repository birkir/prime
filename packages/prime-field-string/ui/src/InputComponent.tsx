import { IPrimeFieldProps } from '@primecms/field';
import { Form, Input } from 'antd';
// import BraftEditor from 'braft-editor'; // tslint:disable-line
import { draftToMarkdown } from 'markdown-draft-js'; // tslint:disable-line
import * as React from 'react';

const controls = ['bold', 'italic', 'underline', 'link'];

export class InputComponent extends React.PureComponent<IPrimeFieldProps> {

  public state = {
    // value: BraftEditor.createEditorState(null)
  };

  public onGetMarkdown() {
    // const markdownString = draftToMarkdown(JSON.parse(this.state.value.toRAW()));
  }

  public onChange = (value: any) => { // tslint:disable-line no-any
    this.setState({
      value
    });
  }

  public renderMarkdown = () => {
    return (
      null
      // <BraftEditor
      //   className="my-editor"
      //   controls={controls}
      //   onChange={this.onChange}
      //   language="en"
      //   placeholder="Some stuff"
      // />
    );
  }

  public renderMultiline = () => {
    const { form, field, path, initialValue = '' } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Form.Item label={field.title}>
        {getFieldDecorator(path, { initialValue })(
          <Input.TextArea
            autosize={{ minRows: 2, maxRows: 8 }}
          />
        )}
      </Form.Item>
    );
  }

  public render() {
    const { form, field, path, initialValue = '' } = this.props;
    const { getFieldDecorator } = form;

    if (field.options.markdown) {
      return this.renderMarkdown();
    }

    if (field.options.multiline) {
      return this.renderMultiline();
    }

    return (
      <Form.Item label={field.title}>
        {getFieldDecorator(path, { initialValue })(
          <Input size="large" />
        )}
      </Form.Item>
    );
  }
}
