import React from 'react'
import { AppProvider } from '../src/context/AppContext'
import '../src/index.css'

export default function MyApp({ Component, pageProps }){
  return (
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  )
}
