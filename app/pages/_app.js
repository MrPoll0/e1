// import '../styles/globals.css'
import "tailwindcss/tailwind.css"
import { Provider } from "next-auth/client"
import Head from "next/head"

function MyApp({ Component, pageProps }) {
  const { session } = pageProps
  return (
    <Provider session={session}>
      <Head>
        <link
        href="https://api.mapbox.com/mapbox-gl-js/v2.0.1/mapbox-gl.css" 
        rel="stylesheet"
        />
      </Head>
      <Component {...pageProps} />
    </Provider>
  )
}

export default MyApp
