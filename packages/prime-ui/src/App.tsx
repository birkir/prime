import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import { SchemaList } from './routes/schemas/SchemaList';
import { SchemaDetail } from './routes/schemas/SchemaDetail';
import { Layout } from './components/layout/Layout';
import { DocumentsList } from './routes/documents/DocumentsList';
import { DocumentsDetail } from './routes/documents/DocumentsDetail';
import { Test } from './routes/Test';

export const App = () => (
  <BrowserRouter>
    <Layout>
      <Route path="/schemas" exact component={SchemaList} />
      <Route path="/schemas/:id" component={SchemaDetail} />
      <Route path="/documents" exact component={DocumentsList} />
      <Route path="/documents/schema/:id" component={DocumentsList} />
      <Route path="/documents/doc/:id" component={DocumentsDetail} />
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
