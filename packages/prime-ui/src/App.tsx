import { observer } from 'mobx-react';
import React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DocumentsDetail } from './routes/documents/DocumentsDetail';
import { DocumentsList } from './routes/documents/DocumentsList';
import { Login } from './routes/login/Login';
import { Logout } from './routes/logout/Logout';
import { Onboarding } from './routes/onboarding/Onboarding';
import { Playground } from './routes/playground/Playground';
import { Schemas } from './routes/schemas/Schemas';
import { Settings } from './routes/settings/Settings';
import { Auth } from './stores/auth';
import { ContentTypes } from './stores/contentTypes';

const Private = observer(({ children }) => {
  if (Auth.isLoggedIn) {
    return children;
  }
  if (Auth.isSetup) {
    return <Redirect to="/setup" />;
  }
  return <Redirect to="/login" />;
});

export class App extends React.Component {
  public state = { loading: true };

  public async componentDidMount() {
    await Auth.checkLogin();
    if (Auth.isLoggedIn) {
      // await ContentTypes.loadAll();
    }
    this.setState({ loading: false });
  }

  public render() {
    if (this.state.loading) {
      return null;
    }

    return (
      <BrowserRouter>
        <Route
          render={({ location }) => {
            let key = location.pathname;
            let preKey = 'private';
            const parts = key.split('/');
            const section = parts[1];

            switch (section) {
              case 'schemas':
                key = 'schemas';
                break;
              case 'setup':
              case 'login':
              case 'logout':
                preKey = section;
                break;
            }

            return (
              <>
                <Switch key={preKey} location={location}>
                  <Route path="/setup" exact component={Onboarding} />
                  <Route path="/login" exact component={Login} />
                  <Route path="/logout" exact component={Logout} />
                  <Private>
                    <Layout>
                      <Switch key={key} location={location}>
                        <Route path="/" exact render={() => <Redirect to="/documents" />} />
                        <Route path="/schemas" component={Schemas} />
                        <Route path="/documents" exact component={DocumentsList} />
                        <Route
                          path="/documents/doc/:entryId/:options?"
                          exact
                          component={DocumentsDetail}
                        />
                        <Route path="/documents/by/:options?" exact component={DocumentsList} />
                        <Route
                          path="/documents/create/:options"
                          exact
                          component={DocumentsDetail}
                        />
                        <Route path="/settings" component={Settings} />
                      </Switch>
                      <div hidden={section !== 'playground'}>
                        <Playground />
                      </div>
                    </Layout>
                  </Private>
                </Switch>
              </>
            );
          }}
        />
      </BrowserRouter>
    );
  }
}
