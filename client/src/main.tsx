import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './globals.css'
import { BrowserRouter } from 'react-router-dom'
import { Navbar } from './components/index.ts'
import { QueryProvider } from './lib/react-query/QueryProvider.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <BrowserRouter>
        <Navbar />
        <App />
      </BrowserRouter>
    </QueryProvider>
  </React.StrictMode>,
)
