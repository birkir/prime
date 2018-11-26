import React from 'react';
import { Card, Dropdown, Menu, Button } from 'antd';
import { get } from 'lodash';

export class InputComponent extends React.Component<any> {

  state = {
    contentTypes: [],
    slices: [],
  }

  values: any = [];

  componentDidMount() {
    this.load();
  }

  async load() {
    const { field, form, stores } = this.props;
    const ids = get(field.options, 'contentTypeIds', []);
    this.values = form.getFieldValue(field.name) || [];

    this.setState({
      contentTypes: stores.ContentTypes.list.filter((n: any) => ids.indexOf(n.id) >= 0),
      slices: this.values.map((n: any) => stores.ContentTypes.items.get(n.__inputname)),
    });
  }

  remove = (index: number) => {
    const slices: any = this.state.slices.slice(0);
    slices[index] = null;
    this.setState({ slices });
  }

  onMenuClick = async (e: any) => {
    const item = this.props.stores.ContentTypes.items.get(e.key)
    const slices: any = this.state.slices.slice(0);
    slices.push(item);
    this.setState({
      slices,
    });
  }

  renderField = (field: any, index: number) => {
    return this.props.renderField({
      ...this.props,
      field,
      initialValue: get(this.values, `${index}.${field.name}`, ''),
      path: `${this.props.path}.${index}.${field.name}`,
    });
  }

  render() {
    const { field, form } = this.props;
    const menu = (
      <Menu onClick={this.onMenuClick}>
        {this.state.contentTypes.map((item: any) => (
          <Menu.Item key={item.id}>{item.title}</Menu.Item>
        ))}
      </Menu>
    );

    return (
      <>
        <div>{field.title} :</div>
        {this.state.slices.map((slice: any, index) => {
          if (!slice || !slice.id) return null;
          return (
            <Card
              key={`${slice.id}_${index}`}
              title={slice.title}
              style={{ marginBottom: 16 }}
              extra={
                <Button onClick={() => this.remove(index)}>Remove</Button>
              }
            >
              {slice.schema.fields.map((f: any) => this.renderField(f, index))}
              {form.getFieldDecorator(`${field.name}.${index}.__inputname`, {
                initialValue: slice.id,
              })(
                <input type="hidden" />
              )}
            </Card>
          );
        })}
        <Dropdown overlay={menu} trigger={['click']}>
          <Button>Add Slice</Button>
        </Dropdown>
      </>
    );
  }
}
