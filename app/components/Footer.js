import { version } from "../package.json"

export default function Footer() {
    return (
        <footer>
            <div className="fixed bottom-0 w-screen text-center text-gray-500 text-xs mb-1">
                <p>&copy; MrPoll0 2021</p>
                <p>Version: {version}</p>
            </div>
        </footer>
    )
}