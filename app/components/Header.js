import { useSession, signIn, signOut } from "next-auth/client"
import Link from "next/link"

const Header = () => {
    const [session, loading] = useSession()

    const handleSignin = (e) => {
        e.preventDefault()
        signIn()
    }

    const handleSignout = (e) => {
        e.preventDefault()
        signOut()
    }

    return (
        <header>
            <div>
                {!session && <>
                    <span>You are not signed in</span><br/>
                    <a href={`/api/auth/signin`} onClick={handleSignin}>Sign in</a>
                </>}

                {session && <>
                    <span>
                        <small>Signed in as</small><br/>
                        {session.user.image && <img src={session.user.image} alt=""/>}<br/>
                        <strong>{session.user.email} || {session.user.name}</strong>
                    </span><br/>
                    <a href={`/api/auth/signout`} onClick={handleSignout}>Sign out</a>
                </>}
            </div>
            <nav>
                <ul>
                    <li><Link href="/">Home</Link></li>
                    <li><Link href="/blog">Blog</Link></li>
                    <li><Link href="/maps">Map</Link></li>
                </ul>
            </nav>
        </header>
    )
}

export default Header