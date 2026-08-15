declare module '@animated-burgers/burger-rotate' {
  import type { ComponentType, HTMLAttributes } from 'react';

  type BurgerProps = HTMLAttributes<HTMLElement> & {
    Component?: string | ComponentType;
    isOpen?: boolean;
  };

  const Burger: ComponentType<BurgerProps>;
  export default Burger;
}
