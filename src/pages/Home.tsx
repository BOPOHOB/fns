import { observer } from 'mobx-react';
import { Button, Space, Typography, Avatar, Flex } from 'antd';
import { useSession } from '../model/session.ts';

const { Text } = Typography;

const Home = observer(function Home() {
  const session = useSession();

  return (
    <Flex vertical gap={16} style={{ padding: 24, maxWidth: 480 }}>
      <Text strong style={{ fontSize: 20 }}>
        Feel & Swim
      </Text>

      {session.authError ? (
        <Space orientation="vertical" size={8}>
          <Text type="danger">{session.authError}</Text>
          <Button type="link" onClick={() => session.clearAuthError()} style={{ padding: 0 }}>
            закрыть
          </Button>
        </Space>
      ) : null}

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
        <Button type="primary" onClick={() => void session.login()}>
          Войти через Яндекс
        </Button>
      )}
    </Flex>
  );
});

export { Home };
