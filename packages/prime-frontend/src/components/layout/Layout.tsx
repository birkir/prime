import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Breadcrumb, Icon } from 'antd';
import './Layout.css';
import { withRouter } from 'react-router-dom';

const { SubMenu } = Menu;
const { Header, Content, Sider } = AntLayout;

export const Layout = withRouter(function Layout({ children, history }: any) {
  const [isOpen, setIsOpen] = useState(true);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <AntLayout style={{ minHeight: '100vh'}}>
      <Sider
        width={240}
        trigger={null}
        collapsed={!isOpen}
        collapsible
        >
        <div className="logo" />
        <Menu
          theme="dark"
          mode="inline"
          style={{ borderRight: 0 }}
          defaultSelectedKeys={['contentTypes']}
        >
          <Menu.Item key="contentTypes" onClick={() => history.push('/contentTypes')}>
            <Icon type="database" />
            <span>Content Types</span>
          </Menu.Item>
        </Menu>
      </Sider>
      <AntLayout>
        <Header style={{ background: '#fff', paddingLeft: 32 }}>
          <Icon
            className="trigger"
            type={!isOpen ? 'menu-unfold' : 'menu-fold'}
            onClick={toggleMenu}
          />
        </Header>
        <Content style={{ flex: 1 }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
})
