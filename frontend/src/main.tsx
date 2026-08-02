import { createRoot } from 'react-dom/client'
import { App } from './App'
import { AppProvider } from './AppContext'
import './styles.scss'

createRoot(document.getElementById('app')!).render(
  <AppProvider>
    <App />
  </AppProvider>,
)
