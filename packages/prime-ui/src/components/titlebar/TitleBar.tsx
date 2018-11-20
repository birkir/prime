import React from 'react';
import s from './TitleBar.module.css';

interface IProps {
  children: React.ReactNode;
  title: string;
}

export const TitleBar = ({ children, title }: IProps) => (
  <div className={s.titlebar}>
    <div className={s.titlebar__flex}>
      <h1 className={s.titlebar__title}>{title}</h1>
    </div>
    {children}
  </div>
)
