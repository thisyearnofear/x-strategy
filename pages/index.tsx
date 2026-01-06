import Head from 'next/head'
import React, { useEffect } from 'react'
import App from '../lib/main'

export default function Home() {
  useEffect(() => {
    // Initialize the Three.js application
    const app = new App()
    return () => {
      // Cleanup logic if App supported it
    }
  }, [])

  return (
    <>
      <Head>
        <title>Spotify Visualiser | X-Strategy</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <canvas id="webgl" />
    </>
  )
}