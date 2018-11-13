import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import { ContentTypeList } from './routes/content-types/ContentTypeList';
import { ContentTypeDetail } from './routes/content-types/ContentTypeDetail';
import { Layout } from './components/layout/Layout';

export const App = () => (
  <BrowserRouter>
    <Layout>
      <Route path="/contentTypes" component={ContentTypeList} />
      <Route path="/contentType/:id" component={ContentTypeDetail} />
    </Layout>
  </BrowserRouter>
);
