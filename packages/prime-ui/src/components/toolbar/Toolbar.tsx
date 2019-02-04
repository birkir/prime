import { Layout } from 'antd';
import React from 'react';
import s from './Toolbar.module.css';

interface IProps {
  children: React.ReactNode;
}

export const Toolbar = ({ children }: IProps) => (
  <Layout.Header className={s.toolbar}>{children}</Layout.Header>
);
