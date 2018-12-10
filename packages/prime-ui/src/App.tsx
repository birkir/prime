import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import { SchemaList } from './routes/schemas/SchemaList';
import { SchemaDetail } from './routes/schemas/SchemaDetail';
import { Layout } from './components/layout/Layout';
import { DocumentsList } from './routes/documents/DocumentsList';
import { DocumentsDetail } from './routes/documents/DocumentsDetail';
import { Home } from './routes/Home';
import { Login } from './routes/login/Login';
import { observer } from 'mobx-react';
import { Auth } from './stores/auth';
import { Logout } from './routes/logout/Logout';
import { Playground } from './routes/playground/Playground';
import { Onboarding } from './routes/onboarding/Onboarding';

const Private = observer(({ children }) => {
  if (Auth.isLoggedIn) {
    return children;
  }
  if (Auth.isSetup) {
    return <Redirect to="/setup" />
  }
  return <Redirect to="/login" />;
});

export class App extends React.Component {

  state = { loading: true };

  async componentDidMount() {
    await Auth.checkLogin();
    this.setState({ loading: false });
  }

  render() {
    if (this.state.loading) {
      return null;
    }

    return (
      <BrowserRouter>
        <Switch>
          <Route path="/setup" exact component={Onboarding} />
          <Route path="/login" exact component={Login} />
          <Route path="/logout" exact component={Logout} />
          <Private>
            <Layout>
              <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/playground" exact component={Playground} />
                <Route path="/schemas" exact component={SchemaList} />
                <Route path="/schemas/:id" component={SchemaDetail} />
                <Route path="/documents" exact component={DocumentsList} />
                <Route path="/documents/schema/:id" component={DocumentsList} />
                <Route path="/documents/doc/:entryId" component={DocumentsDetail} />
                <Route path="/documents/create/:contentTypeId" component={DocumentsDetail} />
              </Switch>
            </Layout>
          </Private>
        </Switch>
      </BrowserRouter>
    );
  }
}
