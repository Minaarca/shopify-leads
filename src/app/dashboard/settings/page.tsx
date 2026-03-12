"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [settings, setSettings] = useState({
        gmail_email: "",
        gmail_password: "",
        daily_email_limit: 200,
        daily_leads_limit: 1000,
        default_query: "",
        email_subject: "",
        email_body: "",
    });

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch("/api/settings");
                if (res.ok) {
                    const data = await res.json();
                    setSettings({ ...data, gmail_password: "" }); // Never prefill actual password client-side
                }
            } catch (error) {
                console.error("Failed to load settings");
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, []);

    const handleChange = (e: any) => {
        const { name, value, type } = e.target;
        setSettings((prev) => ({
            ...prev,
            [name]: type === "number" ? parseInt(value) || 0 : value,
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: "", type: "" });

        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });

            if (res.ok) {
                setMessage({ text: "Settings saved successfully", type: "success" });
            } else {
                const data = await res.json();
                setMessage({ text: data.error || "Failed to save settings", type: "error" });
            }
        } catch (error) {
            setMessage({ text: "An error occurred while saving", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading settings...</div>;

    return (
        <div className="max-w-4xl bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6">System Settings</h2>

            {message.text && (
                <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-8">

                {/* Email Config section */}
                <section>
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">SMTP Configuration (Gmail)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gmail Address</label>
                            <input
                                type="email"
                                name="gmail_email"
                                value={settings.gmail_email}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500"
                                placeholder="you@gmail.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">App Password</label>
                            <input
                                type="password"
                                name="gmail_password"
                                value={settings.gmail_password}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500"
                                placeholder="Leave blank to keep unchanged"
                            />
                            <p className="text-xs text-gray-500 mt-1">Use a 16-character App Password, not your real password.</p>
                        </div>
                    </div>
                </section>

                {/* Limits */}
                <section>
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Automation Limits</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Daily Email Limit (Max 500 for Gmail)</label>
                            <input
                                type="number"
                                name="daily_email_limit"
                                value={settings.daily_email_limit}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Daily Leads Scrape Target</label>
                            <input
                                type="number"
                                name="daily_leads_limit"
                                value={settings.daily_leads_limit}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                </section>

                {/* Searching */}
                <section>
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Scraper Configuration</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Google Search Query (Dork)</label>
                        <input
                            type="text"
                            name="default_query"
                            value={settings.default_query}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500"
                        />
                    </div>
                </section>

                {/* Email Template */}
                <section>
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Email Template</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input
                                type="text"
                                name="email_subject"
                                value={settings.email_subject}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Body (Plain text or HTML)</label>
                            <textarea
                                name="email_body"
                                value={settings.email_body}
                                onChange={handleChange}
                                rows={8}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                </section>

                <div className="pt-4 border-t">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                    >
                        {saving ? "Saving..." : "Save Settings"}
                    </button>
                </div>

            </form>
        </div>
    );
}
