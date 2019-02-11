import { PrimeFieldProps } from '@primecms/field';
import { Form } from 'antd';
import { ValidationRule } from 'antd/lib/form';
import { icon } from 'leaflet';
import React from 'react';
import { ReactLeafletSearch } from 'react-leaflet-search';

import { Map, Marker, Popup, TileLayer, withLeaflet } from 'react-leaflet';

const MapSearch = withLeaflet(ReactLeafletSearch);

export class InputComponent extends React.PureComponent<PrimeFieldProps> {
  public state = {
    center: {
      lat: 51.505,
      lng: -0.09,
    },
    marker: {
      lat: 51.505,
      lng: -0.09,
    },
    zoom: 13,
    draggable: true,
  };

  public refmarker = React.createRef<Marker>();

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

  public toggleDraggable = () => {
    this.setState({ draggable: !this.state.draggable });
  };

  public updatePosition = () => {
    const marker = this.refmarker.current;
    if (marker != null) {
      this.setState({
        marker: marker.leafletElement.getLatLng(),
      });
    }
  };

  public render() {
    const { field } = this.props;
    // const { form, field, path, initialValue = false } = this.props;
    // const { getFieldDecorator } = form;
    const rules = field.options.rules || {};
    const fieldRules: ValidationRule[] = [];

    if (rules.required) {
      fieldRules.push({
        required: true,
        message: `${field.title} is required`,
      });
    }

    const position = [this.state.center.lat, this.state.center.lng];
    const markerPosition = [this.state.marker.lat, this.state.marker.lng];

    return (
      <Form.Item label={field.title}>
        {/* {getFieldDecorator(path, { initialValue, rules: fieldRules })(
          <Input size="large" type="number" />
        )} */}

        <Map center={position} zoom={this.state.zoom} style={{ height: 300 }}>
          <TileLayer
            // attribution="&copy; <a href=\"http:// osm.org/copyright\">OpenStreetMap</a> contributors"
            url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
          />

          <MapSearch provider="OpenStreetMap" />

          <Marker
            draggable={this.state.draggable}
            onDragend={this.updatePosition}
            position={markerPosition}
            icon={this.markerIcon}
            ref={this.refmarker}
          >
            <Popup minWidth={90}>
              <span onClick={this.toggleDraggable}>
                {this.state.draggable ? 'DRAG MARKER' : 'MARKER FIXED'}
              </span>
            </Popup>
          </Marker>
        </Map>
      </Form.Item>
    );
  }
}
