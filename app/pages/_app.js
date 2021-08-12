import '../styles/globals.css'
import Head from "next/head"

// https://nextjs.org/docs/advanced-features/custom-app

export function reportWebVitals(metric){
  console.log(metric);
}

function MyApp({ Component, pageProps }) {
  const { session } = pageProps
  return (
    <>
      <Head>
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
