import { useRouter } from 'next/router';

export default function LanguageSelector() {
    const router = useRouter();
    const { locale } = router;

    const changeLanguage = (e) => {
        let locale = e.target.value;
        router.push(router.pathname, router.asPath, { locale: locale })
    }

    return ( 
        <select
            onChange={changeLanguage}
            defaultValue={locale}
            className="text-lg tracking-wide"
        >
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="fr">FR</option>
        </select>
    )
} 