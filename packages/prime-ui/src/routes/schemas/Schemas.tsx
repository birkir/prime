import * as React from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { SchemaDetail } from './SchemaDetail';
import { SchemaList } from './SchemaList';

export const Schemas = ({ match, location }: any) => (
  <Switch key="schemas" location={location}>
    <Route path={`${match.url}/edit/:id`} exact component={SchemaDetail} />
    <Route component={SchemaList} />
  </Switch>
)
