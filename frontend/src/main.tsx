import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
if(import.meta.env.DEV&&window.location.hostname==='127.0.0.1'){
 const url=new URL(window.location.href);url.hostname='localhost';window.location.replace(url)
}else ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>)
