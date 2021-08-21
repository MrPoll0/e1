export default function RedAlert({ title, message }){
    return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <p><strong className="font-bold">{title}</strong></p>
            <p className="block sm:inline">{message}</p>
        </div>
    );
}