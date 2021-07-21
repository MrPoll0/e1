import Footer from "./Footer";
import Head from "next/head";

export default function Layout({ children }) {
    return ( 
        <>
        <Head>
            <title>E1</title>
        </Head>
        <main>
            {children}
        </main>
        <br />
        <Footer />
        </>
    )
}