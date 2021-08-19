import packageInfo from "../package.json"

export default function Footer() {
    return (
        <footer className="absolute bottom-0 w-screen text-center text-gray-500 text-xs mb-1 z-0">
            <p>&copy; MrPoll0 2021</p>
            <p>Version: {packageInfo.version}</p>
        </footer>
    )
}


// NOT IN USE