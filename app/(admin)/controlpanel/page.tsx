export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">Welcome back, Admin.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "Total Revenue", value: "$45,231.89", change: "+20.1%", color: "text-green-400" },
                    { title: "Active Users", value: "+2350", change: "+180.1%", color: "text-blue-400" },
                    { title: "Sales", value: "+12,234", change: "+19%", color: "text-orange-400" },
                    { title: "Active Now", value: "+573", change: "+201", color: "text-pink-400" },
                ].map((stat, i) => (
                    <div key={i} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 p-6 shadow-sm dark:shadow-none transition-colors duration-300">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</h3>
                        <div className="mt-2 flex items-baseline space-x-2">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                            <span className={`text-xs font-medium ${stat.color}`}>{stat.change}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 p-6 shadow-sm dark:shadow-none transition-colors duration-300">
                    <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Recent Orders</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Order #{1000 + i}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Product Name</p>
                                </div>
                                <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                                    Paid
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 p-6 shadow-sm dark:shadow-none transition-colors duration-300">
                    <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Recent Users</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">User Name</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">user@example.com</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
