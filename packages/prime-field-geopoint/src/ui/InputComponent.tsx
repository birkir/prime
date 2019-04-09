import { PrimeFieldProps } from '@primecms/field';
import { Form } from 'antd';
import { ValidationRule } from 'antd/lib/form';
import { icon } from 'leaflet';
import React from 'react';
import { Map, TileLayer } from 'react-leaflet';

export class InputComponent extends React.PureComponent<PrimeFieldProps> {
  public state = {
    marker: {
      lat: this.initialValue.latitude,
      lng: this.initialValue.longitude,
    },
    zoom: this.initialValue.zoom,
  };

  get initialValue(): { latitude: number; longitude: number; zoom: number } {
    const { initialValue = {} } = this.props as any;
    return {
      latitude: initialValue.latitude || 0,
      longitude: initialValue.longitude || 0,
      zoom: initialValue.zoom || 0,
    };
  }

  public markerIcon = icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
  });

  public render() {
    const { form, field, path } = this.props;
    const { getFieldDecorator } = form;

    const rules = field.options.rules || {};
    const fieldRules: ValidationRule[] = [];

    if (rules.required) {
      fieldRules.push({
        required: true,
        message: `${field.title} is required`,
      });
    }

    const value = form.getFieldValue(path) || this.initialValue;

    return (
      <Form.Item label={field.title}>
        {getFieldDecorator(path, { initialValue: this.initialValue })(<input type="hidden" />)}

        <div style={{ marginBottom: 4 }}>
          (lat: {value.latitude.toFixed(5)}, lon: {value.longitude.toFixed(5)}, zoom: {value.zoom})
        </div>

        <div style={{ position: 'relative' }}>
          <div
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginLeft: -25 / 2,
              marginTop: -41 / 2,
              zIndex: 1000,
            }}
          >
            <img
              src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png"
              alt="Marker"
            />
          </div>
          <Map
            closePopupOnClick={false}
            center={{ lat: value.latitude, lng: value.longitude }}
            onViewportChange={(viewport: { center: [number, number]; zoom: number }) => {
              const marker = {
                latitude: viewport.center[0],
                longitude: viewport.center[1],
                zoom: viewport.zoom,
              };
              form.setFieldsValue({
                [path]: marker,
              });
            }}
            zoom={value.zoom}
            style={{ height: 300 }}
          >
            <TileLayer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />
          </Map>
        </div>
      </Form.Item>
    );
  }
}
