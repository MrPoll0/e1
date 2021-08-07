import Head from "next/head";

export default function Layout({ children }) {
    return ( 
        <>
            <Head>
                <title>Vibezz</title>
                <meta name="theme-color" content="#a05cf6"/>
            </Head>
            <div className="w-screen h-screen bg-white overflow-hidden">
                {children}
            </div>
        </>
    )
}


// RECUERDA CAMBIAR CLASS A CLASSNAME 
