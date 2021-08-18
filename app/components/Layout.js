import Head from "next/head";
import { useRouter } from "next/router";

export default function Layout({ children }) {
    const router = useRouter();
    const { locale } = router;

    return ( 
        <>
            <Head>
                <title>Vibezz</title>
                <meta name="theme-color" content="#a05cf6"/>
                <meta hrefLang={locale}></meta>
            </Head>
            <div className="w-screen h-screen bg-white overflow-hidden">
                {children}
            </div>
        </>
    )
}
