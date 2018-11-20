import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Breadcrumb, Icon, Divider } from 'antd';
import 'antd/dist/antd.css';
import './Layout.css';
import { Route } from 'react-router-dom';

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
          <Header style={{ backgroundColor: '#08223c' }} />
          <Menu
            theme="dark"
            mode="inline"
            style={{ borderRight: 0 }}
            defaultSelectedKeys={[selected]}
          >
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
