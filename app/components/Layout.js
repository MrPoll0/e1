import Head from "next/head";
import { useRouter } from "next/router";
import en from "../locales/en";
import es from "../locales/es";
import fr from "../locales/fr";
import pt from "../locales/pt";

export default function Layout({ children }) {
    const router = useRouter();
    const { locale } = router;
    let t;
    switch(locale){
      case "en":
        t = en;
        break;
      case "es":
        t = es;
        break;
      case "fr":
        t = fr;
        break;
      case "pt":
        t = pt;
        break;
    }

    return ( 
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta charSet="utf-8" />

                <title>Vibezz.live · {t.meta_title}</title>
                <meta name="theme-color" content="#a05cf6" />
                <meta name="description" content={t.meta_description} />
                <meta hrefLang={locale} />

                {locale === "en" ? 
                <link rel="canonical" href="https://vibezz.live" />
                :
                <link rel="canonical" href={`https://vibezz.live/${locale}`} />
                }

                <meta name="og:type" property="og:type" content="website" />
                <meta name="og:title" property="og:title" content={t.meta_title} />
                <meta name="og:description" property="og:description" content={t.meta_description} />
                <meta property="og:site_name" content="Vibezz.live" />
                <meta property="og:url" content="https://vibezz.live" />  
                <meta property="og:image" content="https://vibezz.live/icon.png" />  

                <meta name="twitter:card" content="summary" /> 
                <meta name="twitter:title" content={t.meta_title} />
                <meta name="twitter:description" content={t.meta_description} />
                <meta name="twitter:site" content="vibezz.live" />
                <meta name="twitter:image" content="https://vibezz.live/icon.png" /> 

                <link rel="icon" type="image/png" href="/favicon.ico" />
                <link rel="apple-touch-icon" href="/favicon.ico" />
            </Head>
            {children}
        </>
    )
}
