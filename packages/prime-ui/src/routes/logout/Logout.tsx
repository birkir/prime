import React from 'react';
import { Redirect } from 'react-router';
import { Auth } from '../../stores/auth';

export class Logout extends React.Component {
  public componentDidMount() {
    Auth.logout();
  }

  public render() {
    return <Redirect to="/login" />;
  }
}
