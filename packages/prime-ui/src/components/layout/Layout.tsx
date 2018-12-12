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
        collapsed={!isOpen}
        collapsible
      >
        <Header style={{ alignItems: 'center', display: 'flex' }}>
          <div style={{ color: 'white', fontSize: 24, marginLeft: -24, fontFamily: 'system' }}>prime</div>
        </Header>
        <Menu
          theme="dark"
          mode="inline"
          style={{ borderRight: 0 }}
          defaultSelectedKeys={[selected]}
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
        </Menu>
        <div style={{ flex: 1 }} />
        <Link style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: 16 }} to="/logout">
          <Icon type="logout" style={{ marginRight: 16 }} />
          <span>Logout</span>
        </Link>
      </Sider>
      <AntLayout>
        <Content style={{ flex: 1 }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
});
