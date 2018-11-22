import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.less';
import { App } from './App';

// Make this stuff available for field extensions in the UI
(window as any).React = React;
(window as any).ReactDOM = ReactDOM;

function renderApp(AppRoot: any) {
  ReactDOM.render(<AppRoot />, document.getElementById('root'));
}

renderApp(App);

if ((module as any).hot) {
  (module as any).hot.accept('./App', () => {
    renderApp(require('./App').App);
  });
}
