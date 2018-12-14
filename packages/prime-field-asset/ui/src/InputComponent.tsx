import { IPrimeFieldProps } from '@primecms/field';
import { Button, Dropdown, Form, Icon, Menu, Modal, Upload } from 'antd';
import { ClickParam } from 'antd/lib/menu'; // tslint:disable-line no-submodule-imports
import { UploadChangeParam } from 'antd/lib/upload'; // tslint:disable-line no-submodule-imports
import { UploadFile } from 'antd/lib/upload/interface'; // tslint:disable-line no-submodule-imports
import { get } from 'lodash';
import * as React from 'react';
import Cropper from 'react-easy-crop'; // tslint:disable-line

const CROP_SIZE = 800;

type PrimeUploadFile = UploadFile & { imageUrl: string };

const getInitialFile = (value?: { url: string } | string) => {

  if (typeof value === 'string') {
    return null;
  }

  if (!value || !value.url) {
    return null;
  }

  return {
    uid: '-1',
    status: 'done',
    url: value.url,
    imageUrl: value.url.replace(/\.[a-z]{3,4}$/, '.png'),
    thumbUrl: value.url.replace('/image/upload/', '/image/upload/w_100,h_100,c_fill/').replace(/\.[a-z]{3,4}$/, '.png'),
    width: null,
    height: null
  };
};

export class InputComponent extends React.PureComponent<IPrimeFieldProps> {

  public state = {
    previewVisible: false,
    crop: { name: null, width: 0, height: 0 },
    cropVisible: false,
    cropOffset: { x: 0, y: 0 },
    cropZoom: 1,
    uploadPayload: {
      signature: '',
      timestamp: 0
    },
    file: getInitialFile(get(this.props, 'initialValue'))
  };

  public url = (() => {
    try {
      return new URL(String(this.props.config.PRIME_CLOUDINARY_URL).replace(/^cloudinary/, 'http'));
    } catch (err) {
      console.warn('No "PRIME_CLOUDINARY_URL" set');
    }

    return new URL('http://localhost');
  })();

  private cropPixels = { x: 0, y: 0, width: 0, height: 0 };

  public componentDidMount() {
    this.getImageSize();
  }

  public onBeforeUpload = async () => {
    const { username, password } = this.url;

    const timestamp = Math.round(Date.now() / 1000);
    const params = {
      upload_preset: 'prime-asset',
      image_metadata: true,
      timestamp
    };

    const toSign = Object.entries(params)
      .filter(([key, value]) => value && String(value).length > 0)
      .map(([key, value]: [string, any]) => `${key}=${[].concat(value || []).join(',')}`) // tslint:disable-line no-any
      .sort()
      .join('&');

    const msgBuffer = new TextEncoder().encode(toSign + password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer); // tslint:disable-line await-promise
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => (`00${b.toString(16)}`).slice(-2)).join('');

    this.setState({
      uploadPayload: {
        signature: hashHex,
        api_key: username,
        ...params
      }
    });
  }

  public onChange = (e: UploadChangeParam) => {
    const { form, path } = this.props;
    const files = e.fileList.slice(0);
    let file;

    if (files.length > 0) {
      file = files[0] as PrimeUploadFile;
      if (file.status === 'done' && file.response) {
        file.url = file.response.url;
        file.imageUrl = file.response.url.replace(/\.[a-z]{3,4}$/, '.png');
        file.thumbUrl = file.response.url.replace('/image/upload/', '/image/upload/w_100,h_100,c_fill/').replace(/\.[a-z]{3,4}$/, '.png');
      }
    }

    form.setFieldsValue({
      [`${path}.url`]: (file && file.url) ? file.url : ''
    });

    this.setState({ file }, this.getImageSize);
  }

  public getImageSize = () => {
    if (!this.state.file) {
      return;
    }

    const image = new Image();
    image.src = this.state.file.imageUrl;
    image.onload = () => {
      this.setState({
        file: {
          ...this.state.file,
          width: image.naturalWidth,
          height: image.naturalHeight
        }
      });
    };
  }

  public onClosePreview = () => {
    this.setState({ previewVisible: false });
  }

  public onPreview = () => {
    this.setState({ previewVisible: true });
  }

  public onMenuClick = (e: ClickParam) => {
    const { field, path, form } = this.props;

    const crop = get(field.options, 'crops', [])
    .find((c: { name: string }) => c.name === e.key);

    const file = this.state.file;

    if (crop && file) {
      const index = get(this.props, 'initialValue.crops', [])
        .findIndex((c: { name: string }) => c.name === e.key);

      const cropValue = form.getFieldValue(`${path}.crops.${index}.zoom`);
      let cropZoom = 1;
      const cropOffset = { x: 0, y: 0 };

      if (cropValue && cropValue !== '') {
        const [zoom, x, y] = cropValue.split(',');
        if (zoom && x) {
          cropZoom = Number(zoom);
          cropOffset.x = Number(x);
          cropOffset.y = Number(y);
        }
      }

      this.setState({
        crop: {
          name: crop.name,
          width: Number(crop.width),
          height: Number(crop.height)
        },
        cropZoom,
        cropOffset,
        cropVisible: true
      });
    }
  }

  public onZoomChange = (cropZoom: number) => {
    this.setState({ cropZoom });
  }

  public onCropChange = (cropOffset: { x: number; y: number }) => {
    this.setState({ cropOffset });
  }

  public onCropComplete = (croppedArea: null, cropPixels: { x: number; y: number; width: number; height: number }) => {
    this.cropPixels = cropPixels;
  }

  public onCropConfirm = () => {
    const { path } = this.props;
    const { setFieldsValue } = this.props.form;
    this.setState({ cropVisible: false });

    const crop = get(this.props.field.options, 'crops', [])
      .findIndex((c: { name: string }) => c.name === this.state.crop.name);

    if (crop >= 0) {
      setFieldsValue({
        [`${path}.crops.${crop}.x`]: Math.round(Number(this.cropPixels.x)),
        [`${path}.crops.${crop}.y`]: Math.round(Number(this.cropPixels.y)),
        [`${path}.crops.${crop}.width`]: Math.round(Number(this.cropPixels.width)),
        [`${path}.crops.${crop}.height`]: Math.round(Number(this.cropPixels.height)),
        [`${path}.crops.${crop}.zoom`]: [this.state.cropZoom, this.state.cropOffset.x, this.state.cropOffset.y].join(',')
      });
    }
  }

  public onCropCancel = () => {
    this.setState({ cropVisible: false });
  }

  // tslint:disable-next-line max-func-body-length
  public render() {
    const { form, field, path, initialValue } = this.props;
    const { previewVisible, cropVisible, cropOffset, cropZoom, uploadPayload, file } = this.state;
    const { getFieldDecorator } = form;
    const initialCrops = get(initialValue, 'crops', []);
    const crops = get(field.options, 'crops', [])
      .map((crop: { name: string }) => ({
        ...crop,
        crop: initialCrops.find((c: { name: string; x: number }) => c.name === crop.name && c.x)
      }));

    const menu = (
      <Menu
        onClick={this.onMenuClick}
        // onClick
      >
        {crops.map((crop: { name: string; width: number; height: number }) => (
          <Menu.Item key={crop.name}>{crop.name} ({crop.width}x{crop.height})</Menu.Item>
        ))}
      </Menu>
    );

    return (
      <>
        <Form.Item label={field.title}>
          <div style={{ width: 112, height: 112 }}>
            <Upload
              name="file"
              action={`https://api.cloudinary.com/v1_1/${this.url.hostname}/upload`}
              data={uploadPayload}
              listType="picture-card"
              multiple={false}
              beforeUpload={this.onBeforeUpload}
              onChange={this.onChange}
              onPreview={this.onPreview}
              fileList={((file ? [file] : []) as unknown) as UploadFile[]}
            >
              {!file && (
                <div>
                  <Icon type="plus" />
                  <div className="ant-upload-text">Upload</div>
                </div>
              )}
            </Upload>
          </div>

          {getFieldDecorator(`${path}.url`, { initialValue: get(file, 'url', '') })(
            <input type="hidden" />
          )}

          {crops.map((crop: { name: string }, index: number) => (
            <React.Fragment key={crop.name}>
              {getFieldDecorator(`${path}.crops.${index}.name`, { initialValue: get(crop, 'name', '') })(<input type="hidden" />)}
              {getFieldDecorator(`${path}.crops.${index}.x`, { initialValue: get(crop, 'crop.x', -1) })(<input type="hidden" />)}
              {getFieldDecorator(`${path}.crops.${index}.y`, { initialValue: get(crop, 'crop.y', -1) })(<input type="hidden" />)}
              {getFieldDecorator(`${path}.crops.${index}.width`, { initialValue: get(crop, 'crop.width', -1) })(<input type="hidden" />)}
              {getFieldDecorator(`${path}.crops.${index}.height`, { initialValue: get(crop, 'crop.height', -1) })(<input type="hidden" />)}
              {getFieldDecorator(`${path}.crops.${index}.zoom`, { initialValue: get(crop, 'crop.zoom', '') })(<input type="hidden" />)}
            </React.Fragment>
          ))}

          {crops.length > 0 && (
            <Dropdown overlay={menu}>
              <Button>Edit cropped version</Button>
            </Dropdown>
          )}

          <Modal
            visible={cropVisible}
            title="Crop Image"
            width={800}
            onCancel={this.onCropCancel}
            onOk={this.onCropConfirm}
            maskClosable={false}
          >
            <div style={{
              height: 800,
              overflow: 'hidden',
              position: 'relative',
              margin: -24
            }}>
              <Cropper
                style={{
                  containerStyle: {
                    width: CROP_SIZE,
                    height: CROP_SIZE
                  }
                }}
                image={file && file.imageUrl}
                crop={cropOffset}
                zoom={cropZoom}
                minZoom={1}
                maxZoom={6}
                aspect={this.state.crop.width / this.state.crop.height}
                onCropChange={this.onCropChange}
                onCropComplete={this.onCropComplete}
                onZoomChange={this.onZoomChange}
              />
            </div>
          </Modal>
          <Modal visible={previewVisible} footer={null} onCancel={this.onClosePreview}>
            <img alt="Preview Picture" style={{ width: '100%' }} src={String(file && file.url)} />
          </Modal>
        </Form.Item>
      </>
    );
  }
}
