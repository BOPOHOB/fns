import { CalendarOutlined, CrownOutlined, PlusOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { Menu as AntdMenu, type MenuProps } from "antd";
import { useCallback, useMemo, type FC } from "react";
import { observer } from "mobx-react";
import { useResults } from "../model/results";
import { useLocation, useNavigate } from "react-router";
import { formatRuDate } from "../utils/formatRuDate";
import dayjs from "dayjs";

const useItems = (): NonNullable<MenuProps["items"]> => {
  const results = useResults();
  const days = results.days;
  return useMemo(
    () => [
      { key: "/", icon: <CrownOutlined />, label: "Таблица рекордов" },
      { key: "/add", icon: <PlusOutlined />, label: "Добавить пловца" },
      { key: "/teams", icon: <UsergroupAddOutlined />, label: "Группы" },
      {
        key: "/workout",
        label: "Тренировки",
        icon: <CalendarOutlined />,
        children: days.slice(0, 10).map((date) => ({
          key: `/${date}`,
          label: formatRuDate(dayjs(date)),
        })),
      },
    ],
    [days],
  );
};

type ForFind = Array<{ key: string; children?: ForFind }>;
const findKey = (items: ForFind, pathname: string): string[] => {
  for (const { key, children } of items) {
    if (children) {
      const child = findKey(children, pathname);
      if (child.length !== 0) {
        return child;
      }
    }
    if (key === pathname) {
      return [key];
    }
  }
  return [];
};

const OPEN_DEFAULT = ["/workout"];
const PARENT_KEYS = new Set(["/workout"]);

const MenuImplementation: FC<{ mode?: MenuProps["mode"] }> = observer(({ mode }) => {
  const items = useItems();
  const navigate = useNavigate();
  const onClick = useCallback<NonNullable<MenuProps["onClick"]>>(
    ({ key }) => {
      // Родитель сабменю только открывает список, не роут
      if (PARENT_KEYS.has(key)) return;
      navigate(key);
    },
    [navigate],
  );
  const { pathname } = useLocation();
  const selected = useMemo(() => findKey(items as ForFind, pathname), [items, pathname]);
  const horizontal = mode === "horizontal";

  return (
    <AntdMenu
      defaultOpenKeys={horizontal ? undefined : OPEN_DEFAULT}
      onClick={onClick}
      selectedKeys={selected}
      mode={mode}
      items={items}
    />
  );
});

export { MenuImplementation as Menu };
