import NextAuth from "next-auth"
import Providers from "next-auth/providers"

const options = {
    providers: [
        Providers.Google({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
        }),
        Providers.Discord({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
        }),
    ],
    database: process.env.DATABASE_URL,
}

const Auth = (req, res) => NextAuth(req, res, options)

export default Auth