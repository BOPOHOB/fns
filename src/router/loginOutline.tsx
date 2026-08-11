import { Link, Outlet } from "react-router";

import cn from "./loginOutline.module.less";
import { useSession } from "../model/session";
import { Avatar, Button, Space } from "antd";
import Text from "antd/es/typography/Text";
import { observer } from "mobx-react";

import logo from './logo.jpg';

const LoginOutline = observer(() => {
  const session = useSession();
  return (
    <>
      <header className={cn.head}>
        <nav>
          <Link to="/"><img src={logo} alt="logo" /></Link>
          {
            session.isTrainer && (
              <>
                <Link to="/swimmers/add">Добавить пловца</Link>
                <Link to="/teams">Группы</Link>
                <Link to="/series">Серия</Link>
              </>
            )
          }
        </nav>

        {session.isAuthLoading ? (
          <Text type="secondary">Проверка сессии…</Text>
        ) : session.user ? (
          <Space>
            {session.user.avatarUrl ? (
              <Avatar src={session.user.avatarUrl} alt="" />
            ) : (
              <Avatar>{session.user.displayName.slice(0, 1)}</Avatar>
            )}
            <Text>{session.user.displayName}</Text>
            <Button onClick={() => void session.logout()}>Выйти</Button>
          </Space>
        ) : (
          <Button loading={session.isAuthLoading} type="primary" onClick={() => void session.login()}>
            Войти через Яндекс
          </Button>
        )}
      </header>

      {session.authError ? (
          <Space orientation="vertical" size={8}>
            <Text type="danger">{session.authError}</Text>
            <Button type="link" onClick={() => session.clearAuthError()} style={{ padding: 0 }}>
              закрыть
            </Button>
          </Space>
        ) : <Outlet />
      }
    </>
  );
});

export { LoginOutline };
