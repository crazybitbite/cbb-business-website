export default function CookiesPage() {
    return (
        <div className="container mx-auto px-4 py-24 max-w-4xl text-gray-300 space-y-6">
            <h1 className="text-4xl font-bold text-white mb-8">Cookie Policy</h1>
            <p>Last updated: November 28, 2025</p>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">1. What Are Cookies</h2>
                <p>Cookies are small text files that are used to store small pieces of information. They are stored on your device when the website is loaded on your browser.</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">2. How We Use Cookies</h2>
                <p>We use cookies to make our website function properly, make it more secure, provide better user experience, and understand how the website performs.</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">3. Types of Cookies We Use</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Essential:</strong> Some cookies are essential for you to be able to experience the full functionality of our site.</li>
                    <li><strong>Analytics:</strong> These cookies store information like the number of visitors to the website, the number of unique visitors, etc.</li>
                </ul>
            </section>
        </div>
    )
}
