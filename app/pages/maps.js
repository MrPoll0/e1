import Layout from "../components/Layout"
import dynamic from "next/dynamic"

const DynamicComponentWithNoSSR = dynamic(() => import("../components/Map"), {
    ssr: false
})

const Maps = () => (
    <Layout>
        <DynamicComponentWithNoSSR/>
    </Layout>
)

export default Maps