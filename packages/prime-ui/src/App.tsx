import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import { ContentTypeList } from './routes/schemas/ContentTypeList';
import { ContentTypeDetail } from './routes/schemas/ContentTypeDetail';
import { Layout } from './components/layout/Layout';
import { DocumentsList } from './routes/documents/DocumentsList';
import { ContentEntryDetail } from './routes/documents/ContentEntryDetail';
import { Test } from './routes/Test';

export const App = () => (
  <BrowserRouter>
    <Layout>
      <Route path="/schemas" exact component={ContentTypeList} />
      <Route path="/schemas/:id" component={ContentTypeDetail} />
      <Route path="/documents" exact component={DocumentsList} />
      <Route path="/documents/schema/:id" component={DocumentsList} />
      <Route path="/documents/doc/:id" component={ContentEntryDetail} />
      <Route path="/test" component={Test} />
    </Layout>
  </BrowserRouter>
);


// Homepage                           /documents/$entryId$
// Blogs                              /documents/bySchema/$contentTypeId$
// Pages                              /documents/bySchema/$contentTypeId$
// - About                            /documents/$entryId$
// - Contact Us                       /documents/$entryId$

// Schema                             /schema
// Users                              /users
// Settings                           /settings
