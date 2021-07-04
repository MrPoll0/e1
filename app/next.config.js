const { getRedirectStatus } = require("next/dist/lib/load-custom-routes");

module.exports = {
    /*async rewrites() {
        return [
            { source: "/api/v1/:path*", destination: "http://mrpoll0.cf:3080/api/v1/:path*" }
        ]
    },*/
    poweredByHeader: false
}