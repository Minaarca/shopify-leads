"use client";

import { useEffect, useState } from "react";

export default function LeadsPage() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");

    const fetchLeads = async (status = "All") => {
        setLoading(true);
        try {
            const res = await fetch(`/api/leads?status=${status}`);
            if (res.ok) {
                const data = await res.json();
                setLeads(data);
            }
        } catch (error) {
            console.error("Error fetching leads:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads(filter);
    }, [filter]);

    const handleManualSend = async (leadId: string) => {
        alert("Manual single send logic would go here. For now, rely on Cron 'Run Mailer Now' on dashboard.");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Leads List</h2>
                <div className="flex gap-2 text-sm">
                    {["All", "Pending", "Email Sent", "Failed"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-md transition ${filter === status ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : leads.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No leads found.</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store URL</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {leads.map((lead: any) => (
                                <tr key={lead._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                        <a href={lead.store_url} target="_blank" rel="noopener noreferrer">{lead.store_url}</a>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {lead.email || <span className="text-gray-400 italic">Not found</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${lead.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                lead.status === 'Email Sent' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(lead.date_collected).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium border">
                                        <button
                                            onClick={() => handleManualSend(lead._id)}
                                            disabled={lead.status === "Email Sent" || !lead.email}
                                            className="text-blue-600 hover:text-blue-900 disabled:text-gray-400"
                                        >
                                            Send
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
