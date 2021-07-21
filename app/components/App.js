import Layout from "./Layout"
import Video from "./Video";

export default function App() {
    return (
        <Layout>
            <Video/>
        </Layout>
    )
}



/*
{session && <figure className="md:flex bg-gray-100 rounded-x1 p-8 md:p-0">
                <img className="w-32 h-32 md:w-48 md:h-auto md:rounded-none rounded-full mx-auto" src={session.user.image} width="384" height="512" alt=""/>
                <div className="pt-6 md:p-8 text-center md:text-left space-y-4">
                    <blockquote>
                        <p className="text-1g font-semibold">
                            "Me gustan las patatas"
                        </p>
                    </blockquote>
                    <figcaption className="font-medium">
                        <div className="text-cyan-600">
                            {session.user.name}
                        </div>
                        <div className="text-gray-500">
                            Software Engineer, LaCasaDeTuPutaMadre
                        </div>
                    </figcaption>
                </div>
            </figure>}
            */