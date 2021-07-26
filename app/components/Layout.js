import Footer from "./Footer";
import Header from "./Header";
import Head from "next/head";

export default function Layout({ children }) {
    return ( 
        <>
            <Head>
                <title>E1</title>
                <meta name="theme-color" content="#F87171"/>
            </Head>
            <div className="w-screen h-screen bg-white overflow-hidden">
                <Header />
                {children}
                <Footer />
            </div>
        </>
    )
}


// RECUERDA CAMBIAR CLASS A CLASSNAME 
