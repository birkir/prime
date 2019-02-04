import { Divider, List, Modal } from 'antd';
import { get } from 'lodash';
import { Observer } from 'mobx-react';
import React from 'react';
import { Auth } from '../../stores/auth';
import { ChangeEmail } from './ChangeEmail';
import { ChangePassword } from './ChangePassword';
import { UpdateProfile } from './UpdateProfile';

export const Account = () => {
  const user = Auth.user!;

  const [changePassword, setChangePassword] = React.useState(false);
  const [changeEmail, setChangeEmail] = React.useState(false);

  const changeEmailRef = React.useRef(null);
  const changePasswordRef = React.useRef(null);

  const onChangeEmail = () => setChangeEmail(false);

  const onChangePassword = () => setChangePassword(false);

  const accountList = [
    {
      title: 'Password',
      // description: `Last changed ${distanceInWordsToNow(user.lastPasswordChange)} ago`,
      actions: [<a onClick={() => setChangePassword(true)}>Change password</a>],
    },
    {
      title: 'Email Address',
      description: get(user, 'emails.0.address'),
      actions: [<a onClick={() => setChangeEmail(true)}>Change email</a>],
    },
  ];

  return (
    <>
      <h3>Account Information</h3>
      <UpdateProfile user={user} />
      <Divider style={{ marginBottom: 0, marginTop: 32 }} />
      <Observer
        render={() => {
          return (
            <List
              itemLayout="horizontal"
              dataSource={accountList}
              renderItem={({ avatar, actions, title, description }: any) => (
                <List.Item actions={actions}>
                  <List.Item.Meta avatar={avatar} title={title} description={description} />
                </List.Item>
              )}
            />
          );
        }}
      />
      <Modal
        visible={changeEmail}
        title="Change Email Address"
        onOk={(e: any) => (changeEmailRef.current as any).props.onSubmit(e)}
        okText="Change"
        onCancel={() => setChangeEmail(false)}
      >
        <ChangeEmail
          forwardRef={changeEmailRef}
          close={() => setChangeEmail(false)}
          visible={changeEmail}
        />
      </Modal>
      <Modal
        visible={changePassword}
        title="Change Password"
        onOk={(e: any) => (changePasswordRef.current as any).props.onSubmit(e)}
        okText="Change"
        onCancel={() => setChangePassword(false)}
      >
        <ChangePassword
          forwardRef={changePasswordRef}
          close={() => setChangePassword(false)}
          visible={changePassword}
        />
      </Modal>
    </>
  );
};
