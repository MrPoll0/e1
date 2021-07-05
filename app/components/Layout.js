import Header from "./Header"
import Footer from "./Footer"
import Head from "next/head"

export default function Layout({ children }) {
    return ( 
        <>
        <Head>
            <title>E1</title>
        </Head>
        <Header />
        <br />
        <main>
            {children}
        </main>
        <br />
        <Footer />
        </>
    )
}