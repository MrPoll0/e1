import packageInfo from "../package.json"
import LanguageSelector from "./LanguageSelector"

export default function Footer() {
    return (
        <footer className="w-screen text-center text-gray-500 text-xs mb-2 mt-10 z-0">
            <div className="space-x-5">
                <LanguageSelector/>
                <a target="_blank" href="/privacy-policy.html" className="text-base underline">Privacy Policy</a>
            </div>
            <p>&copy; MrPoll0 2021</p>
            <p><a target="_blank" href="/credits.html" className="underline">Credits</a></p>
            <p>Version: {packageInfo.version}</p>
        </footer>
    )
}