import { Session, SessionProvider } from './model/session'
import { useModel } from './utils/useModel'

function App() {
  const session = useModel(() => new Session());

  if (session === null) {
    return null;
  }

  return (
    <SessionProvider value={session}></SessionProvider>
  )
}

export default App
