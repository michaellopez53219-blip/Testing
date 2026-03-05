"use client";
import { useParams } from "next/navigation";

export default function ServerSettings() {
  const params = useParams(); // This gets the ID from the URL
  
  return (
    <div className="min-h-screen bg-[#0f0f10] text-white p-10">
      <h1 className="text-3xl font-bold">Server Dashboard</h1>
      <p className="text-slate-400 mt-2">Managing Server ID: <span className="text-blue-400 font-mono">{params.id}</span></p>
      
      <div className="mt-10 p-6 bg-[#18181b] rounded-xl border border-slate-800">
        <h2 className="text-xl font-bold mb-4">ERLC API Configuration</h2>
        <input 
          type="text" 
          placeholder="Paste your ERLC API Key here" 
          className="w-full bg-[#0a0a0b] border border-slate-700 p-3 rounded-lg"
        />
      </div>
    </div>
  );
}