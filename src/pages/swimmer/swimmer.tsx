import { Typography } from "antd";
import { useSwimmer } from "../../router/swimmerOutline";

const Swimmer = () => {
  const swimmer = useSwimmer();

  return (
    <Typography.Title level={1}>{swimmer.name}</Typography.Title>
  );
};

export { Swimmer };
