import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import { TokenImagesProvider } from './context/TokenImagesContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <TokenImagesProvider>
          <App />
        </TokenImagesProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
