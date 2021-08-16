import '../styles/globals.css'
import { Providers } from "../contexts/main.js";

// https://nextjs.org/docs/advanced-features/custom-app

export function reportWebVitals(metric){
  console.log(metric);
}

function MyApp({ Component, pageProps }) {
  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  )
}

export default MyApp
