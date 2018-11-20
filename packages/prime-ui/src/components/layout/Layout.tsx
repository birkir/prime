import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Breadcrumb, Icon, Divider } from 'antd';
import 'antd/dist/antd.css';
import './Layout.css';
import { withRouter, Route } from 'react-router-dom';

const { SubMenu } = Menu;
const { Header, Content, Sider } = AntLayout;

export const Layout = ({ children }: any) => (
  <Route component={({ history, location }: any) => {
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
          <div className="logo" />
          <Menu
            theme="dark"
            mode="inline"
            style={{ borderRight: 0 }}
            defaultSelectedKeys={[selected]}
          >
            <Menu.Item>Homepage</Menu.Item>
            <Menu.Item>BlogPage</Menu.Item>
            <Menu.Item>Blog</Menu.Item>
            <SubMenu title="Pages">
              <Menu.Item>About Us</Menu.Item>
              <Menu.Item>Contact Us</Menu.Item>
            </SubMenu>
            <Menu.Item
              key="documents"
              onClick={() => history.push('/documents')}
            >
              <Icon type="file" />
              <span>Documents</span>
            </Menu.Item>
            <Menu.Item
              key="schemas"
              onClick={() => history.push('/schemas')}
            >
              <Icon type="database" />
              <span>Schemas</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <AntLayout>
          <Content style={{ flex: 1 }}>
            {children}
          </Content>
        </AntLayout>
      </AntLayout>
    );
  }} />
);
