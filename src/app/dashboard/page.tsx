"use client";

import { useEffect, useState } from "react";
import { Users, Mail, Clock } from "lucide-react";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        total: 0,
        sent: 0,
        pending: 0,
        failed: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/leads");
                if (res.ok) {
                    const leads = await res.json();
                    setStats({
                        total: leads.length,
                        sent: leads.filter((l: any) => l.status === "Email Sent").length,
                        pending: leads.filter((l: any) => l.status === "Pending").length,
                        failed: leads.filter((l: any) => l.status === "Failed").length,
                    });
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    if (loading) return <div>Loading statistics...</div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Leads</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-full">
                        <Mail className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Emails Sent</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.sent}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Pending Leads</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.pending}</h3>
                    </div>
                </div>

            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mt-8">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h3>
                <div className="flex gap-4">
                    <button
                        onClick={async () => {
                            const res = await fetch("/api/cron/scrape");
                            const data = await res.json();
                            alert(data.message || data.error);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                        Run Scraper Now
                    </button>

                    <button
                        onClick={async () => {
                            const res = await fetch("/api/cron/send-emails");
                            const data = await res.json();
                            alert(data.message || data.error);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                    >
                        Run Mailer Now
                    </button>
                </div>
                <p className="text-sm text-gray-500 mt-4 max-w-2xl">
                    * Note: Automation runs via Vercel Cron. Using "Run Now" buttons will immediately invoke the background queues.
                    Beware of Vercel platform timeouts on Hobby plans.
                </p>
            </div>

        </div>
    );
}
