import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Router } from "./router/router.tsx";
import './style/main.less';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router />
  </StrictMode>,
)
