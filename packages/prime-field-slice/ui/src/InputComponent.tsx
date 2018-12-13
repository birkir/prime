import { IPrimeFieldProps } from '@primecms/field';
import { Button, Card, Dropdown, Icon, Menu, Tag } from 'antd';
import { get } from 'lodash';
import * as React from 'react';

type ISlice = null | {
  __inputtype: string;
  id: string;
  title: string;
  schema: any; // tslint:disable-line no-any
};

interface IState {
  contentTypes: any[]; // tslint:disable-line no-any
  slices: ISlice[];
}

// tslint:disable-next-line no-any
function noChildren(field: any, index: number, allFields: any) {
  // tslint:disable-next-line no-any
  return !allFields.find((allFieldsField: any) => {
    if (allFieldsField.id !== field.id && allFieldsField.fields) {
      // tslint:disable-next-line no-any
      return allFieldsField.fields.find((innerField: any) => innerField.id === field.id);
    }

    return false;
  });
}

export class InputComponent extends React.Component<IPrimeFieldProps, IState> {

  public state: IState = {
    contentTypes: [],
    slices: []
  };

  public values: any = []; // tslint:disable-line no-any

  public componentDidMount() {
    this.load()
      .catch((err: Error) => {
        console.error(err); // tslint:disable-line no-console
      });
  }

  public async load() {
    const { field, entry, path, stores } = this.props;
    const ids = get(field.options, 'contentTypeIds', []);
    const initialValue = (this.props.initialValue as any) || []; // tslint:disable-line no-any

    this.setState({
      contentTypes: stores.ContentTypes.list.filter((n: { id: string }) => ids.indexOf(n.id) >= 0),
      slices: initialValue.map((n: { __inputname: string }) => stores.ContentTypes.items.get(n.__inputname))
    });
  }

  public onRemoveClick = (e: React.MouseEvent<HTMLElement>) => {
    const index = Number(e.currentTarget.dataset.index);
    const slices = this.state.slices.slice(0);
    slices[index] = null;
    this.setState({ slices });
  }

  public onMenuClick = async (e: { key: string }) => {
    const item = this.props.stores.ContentTypes.items.get(e.key);
    const slices = this.state.slices.slice(0);
    slices.push(item);
    this.setState({ slices });
  }

  public renderField = (field: any, index: number) => { // tslint:disable-line no-any
    const initialValue = this.props.initialValue || [];

    return this.props.renderField({
      ...this.props,
      field,
      initialValue: get(initialValue, `${index}.${field.name}`, ''),
      path: `${this.props.path}.${index}.${field.name}`
    } as any); // tslint:disable-line no-any
  }

  public render() {
    const { field, form, path } = this.props;
    const menu = (
      <Menu onClick={this.onMenuClick}>
        {this.state.contentTypes.map((item) => (
          <Menu.Item key={item.id}>{item.title}</Menu.Item>
        ))}
      </Menu>
    );

    return (
      <div className="prime-slice">
        <div className="prime-slice-spacer-top" />
        <div className="ant-form-item-label">
          <label title={field.title}>{field.title}</label>
        </div>
        {this.state.slices.map((slice, index) => {
          if (!slice || !slice.id) { return null; }

          return (
            <Card
              key={`${slice.id}_${index}`}
              className="prime-slice-item"
            >
              <div className="prime-slice-item-actions">
                <Icon
                  className="prime-slice-item-button disabled"
                  type="up"
                  data-index={index}
                />
                <Icon
                  className="prime-slice-item-button disabled"
                  type="down"
                  data-index={index}
                />
                <Icon
                  className="prime-slice-item-button"
                  type="minus"
                  data-index={index}
                  onClick={this.onRemoveClick}
                />
              </div>
              {form.getFieldDecorator(`${path}.${index}.__inputname`, {
                initialValue: slice.id
              })(
                <input type="hidden" />
              )}
              {slice.schema.fields.filter(noChildren).map(
                (f: any) => this.renderField(f, index) // tslint:disable-line no-any
              )}
            </Card>
          );
        })}
        <Dropdown overlay={menu} trigger={['click']}>
          <Button size="large" block={true} className="prime-slice-add">
            <Icon type="plus" />
            Add Slice
          </Button>
        </Dropdown>
        <div className="prime-slice-spacer-bottom" />
      </div>
    );
  }
}
