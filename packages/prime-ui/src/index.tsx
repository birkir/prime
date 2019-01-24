/* tslint:disable no-var-requires */
import 'antd/dist/antd.less';
import 'braft-editor/dist/index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import './utils/fields';

(window as any).React = React;
(window as any).ReactDOM = ReactDOM;
(window as any).Antd = require('antd');
(window as any).lodash = require('lodash');
(window as any).moment = require('moment');
(window as any).BraftEditor = require('braft-editor');

function renderApp(AppRoot: any) {
  ReactDOM.render(<AppRoot />, document.getElementById('root'));
}

renderApp(App);

if ((module as any).hot) {
  (module as any).hot.accept('./App', () => {
    renderApp(require('./App').App);
  });
}
