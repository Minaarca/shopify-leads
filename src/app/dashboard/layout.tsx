"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Settings, LogOut } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const pathname = usePathname();

    if (status === "loading") {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!session) {
        return null; // Handled by middleware
    }

    const navigation = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "Leads", href: "/dashboard/leads", icon: Users },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200">
                <div className="flex h-16 items-center px-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-800">Shopify Leads</h1>
                </div>
                <nav className="mt-6 flex flex-col gap-1 px-4">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive
                                        ? "bg-blue-50 text-blue-700 font-medium"
                                        : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex w-full items-center gap-3 px-3 py-2 text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8">
                    <h2 className="text-lg font-medium text-gray-800">
                        {navigation.find((n) => n.href === pathname)?.name || "Dashboard"}
                    </h2>
                </header>
                <main className="flex-1 overflow-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
