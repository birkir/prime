import { IPrimeFieldProps } from '@primecms/field';
import { Button, Input } from 'antd';
import { get } from 'lodash';
import * as React from 'react';

interface IState {
  cropSizes: boolean[];
}

interface IOptionsCrop {
  name?: string;
  width?: string | number;
  height?: string | number;
}

interface IOptions {
  crops?: IOptionsCrop[];
}

type IProps = IPrimeFieldProps & {
  options: IOptions;
};

export class SchemaSettingsComponent extends React.Component<IProps, IState> {

  public state: IState = {
    cropSizes: []
  };

  private initialCropSizes = [];

  public static BEFORE_SUBMIT(options: IOptions) {
    if (options.crops) {
      options.crops = options.crops.filter((n) => {
        if (n.name === '' && n.width === '' && n.height === '') {
          return false;
        }

        return true;
      });
    }
  }

  public componentDidMount() {
    const opts = this.props.field.options || {};
    this.initialCropSizes = get(opts, 'crops', []);
    this.setState({ cropSizes: this.initialCropSizes.map(() => true) });
  }

  public onRemoveCropSize = (e: React.MouseEvent<HTMLElement>) => {
    const index = Number(e.currentTarget.dataset.index);
    const cropSizes = this.state.cropSizes.slice(0);
    cropSizes[index] = false;
    this.setState({ cropSizes });
  }

  public renderCropSize = (cropSize: unknown, index: number) => {

    if (!cropSize) {
      return null;
    }

    const { getFieldDecorator } = this.props.form;

    return (
      <div
        key={`cropSize${index}`}
        style={{ flexDirection: 'row', display: 'flex', width: '100%', marginBottom: 8 }}
      >
        {getFieldDecorator(`options.crops.${index}.name`, {
          initialValue: get(this.initialCropSizes, `${index}.name`, '')
        })(
          <Input
            type="text"
            placeholder="Name"
            style={{ flex: 1, marginRight: 8 }}
          />
        )}
        <Input.Group compact style={{ width: 'auto', marginRight: 8 }}>
          {getFieldDecorator(`options.crops.${index}.width`, {
            initialValue: get(this.initialCropSizes, `${index}.width`, '')
          })(
            <Input
              type="text"
              placeholder="Width"
              style={{ width: 60, padding: '0 8px', textAlign: 'center' }}
            />
          )}
          <Input
            style={{
              width: 16, textAlign: 'center', padding: 0, borderLeft: 0, pointerEvents: 'none', backgroundColor: '#fff'
            }}
            placeholder="x"
            disabled
          />
          {getFieldDecorator(`options.crops.${index}.height`, {
            initialValue: get(this.initialCropSizes, `${index}.height`, '')
          })(
            <Input
              type="number"
              placeholder="Height"
              style={{ width: 60, padding: '0 8px', borderLeft: 0 }}
            />
          )}
        </Input.Group>
        <Button
          shape="circle"
          icon="delete"
          data-index={index}
          onClick={this.onRemoveCropSize}
        />
      </div>
    );
  }

  public onAddCropSize = () => {
    const newCropSizes = this.state.cropSizes.slice(0);

    newCropSizes.push(true);

    this.setState({
      cropSizes: newCropSizes
    });
  }

  public render() {
    const { form, options = {} } = this.props;

    return (
      <>
        <h3>Crop Sizes</h3>
        {this.state.cropSizes.map(this.renderCropSize)}
        <Button onClick={this.onAddCropSize}>Add</Button>
      </>
    );
  }
}
