"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // 1. Import useRouter

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter(); // 2. Initialize the router

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0b] text-white p-4">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm flex flex-col">
        <h1 className="text-5xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">
          PROJECT: DASHBOARD
        </h1>

        {session ? (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
            {session.user?.image && (
              <img 
                src={session.user.image} 
                alt="Profile" 
                className="w-20 h-20 rounded-full border-2 border-blue-500 mb-4"
              />
            )}
            <h2 className="text-2xl font-bold">Welcome, {session.user?.name}!</h2>
            <p className="text-slate-400 mb-6">You are now authenticated.</p>
            
            <div className="flex gap-4">
              <button 
                // 3. Add the onClick handler to navigate
                onClick={() => router.push("/dashboard")} 
                className="px-8 py-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-all"
              >
                Go to Dashboard
              </button>
              <button 
                onClick={() => signOut()}
                className="px-8 py-4 bg-red-900/20 text-red-400 rounded-xl font-bold hover:bg-red-900/40 transition-all border border-red-900/50"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-slate-400 text-lg mb-8 text-center max-w-md">
              The next generation of ERLC management. 100% customizable. 100% free.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => signIn("discord")}
                className="px-8 py-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 hover:scale-105 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              >
                Login with Discord
              </button>
            </div>
          </>
        )}
      </div>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -z-10"></div>
    </main>
  );
}