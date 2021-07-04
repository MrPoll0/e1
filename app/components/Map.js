import { Component } from "react"
import ReactMapGL from "react-map-gl"

class Map extends Component {
    state = {
        viewport: {
            width: "100vw",
            height: "100vh",
            latitude: 41.5868,
            longitud: -93.625,
            zoom: 13
        }
    };

    render() {
        return (
            <ReactMapGL
                mapStyle="mapbox://styles/mapbox/streets-v9"
                mapboxApiAccessToken="pk.eyJ1IjoibXJwb2xsMCIsImEiOiJja2N1d3FjYWsyY2szMnlzNjZzcTR2eW5pIn0.0wZQwHzbImdzB8MjFQ4pTQ"
                onViewportChange={(viewport) => this.setState({ viewport })}
                {...this.state.viewport}
            />
        );
    }
}

export default Map;