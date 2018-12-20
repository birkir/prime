import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Icon } from 'antd';
import { NavLink, Link, withRouter } from 'react-router-dom';
import './Layout.css';

const { SubMenu } = Menu;
const { Header, Content, Sider } = AntLayout;

export const Layout = withRouter(({ children, history, location }: any) => {
  const [isOpen, setIsOpen] = useState(true);
  const toggleMenu = () => setIsOpen(!isOpen);
  const selected = location.pathname.split('/')[1];

  return (
    <AntLayout style={{ minHeight: '100vh'}}>
      <Sider
        width={280}
        theme="dark"
        trigger={null}
        collapsed={isOpen}
        collapsible
        className="prime__sidebar"
      >
        <Header className="prime__sidebar__header">
          <Link to="/" className="prime__sidebar__logo">prime</Link>
        </Header>
        <Menu
          theme="dark"
          mode="inline"
          className="prime__sidebar__menu"
          defaultSelectedKeys={[selected]}
          key={selected}
        >
          <Menu.Item key="documents">
            <NavLink to="/documents" className="nav-text">
              <Icon type="file" />
              <span>Documents</span>
            </NavLink>
          </Menu.Item>
          <Menu.Item key="schemas">
            <NavLink to="/schemas" className="nav-text">
              <Icon type="database" />
              <span>Schemas</span>
            </NavLink>
          </Menu.Item>
          <Menu.Item key="playground">
            <NavLink to="/playground" className="nav-text">
              <Icon type="code" />
              <span>Playground</span>
            </NavLink>
          </Menu.Item>
          <Menu.Item key="settings">
            <NavLink to="/settings" className="nav-text">
              <Icon type="setting" />
              <span>Settings</span>
            </NavLink>
          </Menu.Item>
          <Menu.Item key="null" className="prime__sidebar__spacer" />
          <Menu.Item key="logout" className="prime__sidebar__logout">
            <NavLink to="/logout" className="nav-text">
              <Icon type="logout" />
              <span>Logout</span>
            </NavLink>
          </Menu.Item>
        </Menu>
        <div className="prime__sidebar__toggle" onClick={toggleMenu}>
          <Icon type="left" />
        </div>
      </Sider>
      <AntLayout>
        <Content style={{ flex: 1 }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
});
