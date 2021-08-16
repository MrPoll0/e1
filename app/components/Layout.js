import Head from "next/head";
import { useRouter } from "next/router";

export default function Layout({ children }) {
    const router = useRouter();
    const { locale } = router;

    return ( 
        <>
            <Head>
                <title>Vibezz</title>
                <link rel="canonical" href="https://vibezz.live"></link>
                <meta name="theme-color" content="#a05cf6"/>
                <meta hreflang={locale}></meta>
            </Head>
            <div className="w-screen h-screen bg-white overflow-hidden">
                {children}
            </div>
        </>
    )
}
