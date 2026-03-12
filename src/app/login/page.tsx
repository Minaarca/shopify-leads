"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const res = await signIn("credentials", {
            username,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Invalid username or password");
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                <h1 className="mb-6 text-2xl font-bold text-center text-gray-900">Admin Login</h1>

                {error && (
                    <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-500">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
