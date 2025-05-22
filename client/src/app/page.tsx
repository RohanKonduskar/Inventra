// import Dashboard from "@/app/dashboard/page";

// export default function Home() {
//   return <Dashboard />;
// }



'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ Correct import for App Router
import { User, Lock } from 'lucide-react';
import Image from 'next/image';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/adminAuth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.success) {
      router.push('http://localhost:3000/dashboard'); // ✅ Still works with App Router
    } else {
      setError(data.message || 'Login failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white to-gray-200 px-4">
      <div className="bg-white p-10 rounded-3xl shadow-lg w-full max-w-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-3">
            <Image
              src="/assets/logo.png"
              alt="inventra-logo"
              width={32}
              height={32}
              className="rounded w-10 h-10"
            />
            <h1 className="font-extrabold text-3xl">INVENTRA</h1>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-6 text-lg">
          <div className="flex items-center border-2 rounded-lg px-4 py-3">
            <User className="w-6 h-6 text-gray-500 mr-3" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full outline-none text-lg"
            />
          </div>

          <div className="flex items-center border-2 rounded-lg px-4 py-3">
            <Lock className="w-6 h-6 text-gray-500 mr-3" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full outline-none text-lg"
            />
          </div>

          {error && (
            <p className="text-red-500 text-center text-base">{error}</p>
          )}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-3 rounded-lg"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
