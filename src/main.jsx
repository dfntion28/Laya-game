import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { resumeRoom } from './net/online.js'

// Rejoin an online game after a reload. It sets the online mode before its first await,
// so the first render already knows this device is in a room.
resumeRoom().catch(() => {})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
