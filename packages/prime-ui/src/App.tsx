import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import { SchemaList } from './routes/schemas/SchemaList';
import { SchemaDetail } from './routes/schemas/SchemaDetail';
import { Layout } from './components/layout/Layout';
import { DocumentsList } from './routes/documents/DocumentsList';
import { DocumentsDetail } from './routes/documents/DocumentsDetail';
import { Home } from './routes/Home';

export const App = () => (
  <BrowserRouter>
    <Layout>
      <Route path="/schemas" exact component={SchemaList} />
      <Route path="/schemas/:id" component={SchemaDetail} />
      <Route path="/documents" exact component={DocumentsList} />
      <Route path="/documents/schema/:id" component={DocumentsList} />
      <Route path="/documents/doc/:entryId" component={DocumentsDetail} />
      <Route path="/documents/create/:contentTypeId" component={DocumentsDetail} />
      <Route path="/" exact component={Home} />
    </Layout>
  </BrowserRouter>
);
