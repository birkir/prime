import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import { ContentTypeList } from './routes/content-types/ContentTypeList';
import { ContentTypeDetail } from './routes/content-types/ContentTypeDetail';
import { Layout } from './components/layout/Layout';
import { ContentEntryList } from './routes/content-entries/ContentEntryList';
import { ContentEntryDetail } from './routes/content-entries/ContentEntryDetail';

export const App = () => (
  <BrowserRouter>
    <Layout>
      <Route path="/contentTypes" component={ContentTypeList} />
      <Route path="/contentType/:id" component={ContentTypeDetail} />
      <Route path="/contentEntries/:id?" component={ContentEntryList} />
      <Route path="/contentEntry/:id" component={ContentEntryDetail} />
    </Layout>
  </BrowserRouter>
);
