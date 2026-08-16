import { useEffect, useState, type ComponentProps } from "react";
import BurgerRotate from "@animated-burgers/burger-rotate";
import "@animated-burgers/burger-rotate/dist/styles.css";

function resolveCjsDefault<T>(mod: T | { default: T | { default: T } }): T {
  let current: unknown = mod;
  while (current && typeof current === "object" && "default" in current) {
    current = (current as { default: unknown }).default;
  }
  return current as T;
}

const Burger = resolveCjsDefault(BurgerRotate);

type BurgerProps = ComponentProps<typeof Burger>;

/** Avoid CJS/animated-burgers during SSR; mount after hydrate. */
const ClientBurger = (props: BurgerProps) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  if (!ready) {
    return <span className={props.className} style={{ display: "inline-block", width: 24, height: 24 }} />;
  }
  return <Burger {...props} />;
};

export { ClientBurger };
