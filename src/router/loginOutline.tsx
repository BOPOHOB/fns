import { Link, Outlet, useLocation } from "react-router";

import cn from "./loginOutline.module.less";
import { useSession } from "../model/session";
import { Avatar, Button, Drawer, Space } from "antd";
import Text from "antd/es/typography/Text";
import { observer } from "mobx-react";

import logo from './logo.jpg';
import { LoginOutlined, LogoutOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Menu } from "./menu";
import BurgerRotate from '@animated-burgers/burger-rotate';
import '@animated-burgers/burger-rotate/dist/styles.css';

function resolveCjsDefault<T>(mod: T | { default: T | { default: T } }): T {
  let current: unknown = mod;
  while (current && typeof current === 'object' && 'default' in current) {
    current = (current as { default: unknown }).default;
  }
  return current as T;
}

const Burger = resolveCjsDefault(BurgerRotate);

const LoginOutline = observer(() => {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [pathname])

  return (
    <>
      <header className={cn.head}>
        <Burger
          Component="button"
          aria-label="Меню"
          className={cn.burger}
          isOpen={open}
          onClick={() => setOpen((v) => !v)}
        />
        <nav>
          <Link to="/"><img src={logo} alt="logo" /></Link>
          <div className={cn.menu}>
            <Menu mode="horizontal" />
          </div>
        </nav>

        <div className={cn.headerRight}>
          {session.isAuthLoading ? (
            <Text type="secondary">Проверка сессии…</Text>
          ) : session.user ? (
            <Space>
              {session.user.avatarUrl ? (
                <Avatar src={session.user.avatarUrl} alt="" />
              ) : (
                <Avatar>{session.user.displayName.slice(0, 1)}</Avatar>
              )}
              <Text className={cn.displayName}>{session.user.displayName}</Text>
              <Button onClick={() => void session.logout()} icon={<LogoutOutlined />} />
            </Space>
          ) : (
            <Button loading={session.isAuthLoading} icon={<LoginOutlined />} type="primary" onClick={() => void session.login()} />
          )}
        </div>
      </header>

      {session.authError ? (
          <Space orientation="vertical" size={8}>
            <Text type="danger">{session.authError}</Text>
            <Button type="link" onClick={() => session.clearAuthError()} style={{ padding: 0 }}>
              закрыть
            </Button>
          </Space>
        ) : (
          <main>
            <Outlet />
            <Drawer
              placement="left"
              closable={false}
              onClose={() => setOpen(false)}
              open={open}
              getContainer={false}
            >
              <Menu mode="inline" />
            </Drawer>
          </main>
        )
      }
    </>
  );
});

export { LoginOutline };
