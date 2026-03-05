"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; 
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serverName, setServerName] = useState("");
  const [servers, setServers] = useState<any[]>([]);

  // Load existing servers from Supabase
  useEffect(() => {
    if (session?.user?.email) {
      const fetchServers = async () => {
        const { data, error } = await supabase
          .from("user_servers")
          .select("*")
          .eq("owner_id", session?.user?.email); 

        if (data) setServers(data);
        if (error) console.error("Error loading servers:", error);
      };
      fetchServers();
    }
  }, [session]);

  const handleCreateServer = async () => {
    if (!serverName || !session?.user?.email) return;
    
    const { data, error } = await supabase
      .from("user_servers")
      .insert([
        { 
          name: serverName, 
          owner_id: session.user.email,
          theme_color: "#3b82f6" 
        }
      ])
      .select();

    if (error) {
      alert("Database error: " + error.message);
    } else if (data) {
      setServers([...servers, ...data]);
      setServerName("");
      setIsModalOpen(false);
    }
  };

  const handleJoinServer = async () => {
    const code = prompt("Enter Server ID to join:");
    if (!code) return;

    const { data, error } = await supabase
      .from("user_servers")
      .select("*")
      .eq("id", code)
      .single();

    if (data) {
      alert(`Found ${data.name}!`);
      router.push(`/dashboard/${data.id}`);
    } else {
      alert("Server not found.");
    }
  };

  if (!session) return <p className="text-white p-10">Please login first.</p>;

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white p-8 relative">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-200 uppercase tracking-tighter">My Servers</h1>
          <p className="text-slate-500 text-sm">Manage your ERLC communities.</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={handleJoinServer} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg font-medium border border-slate-700 transition">
            Join Server
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-medium transition shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            + Make Server
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers.map((server) => (
          <div key={server.id} className="bg-[#18181b] rounded-2xl overflow-hidden border border-slate-800 shadow-xl group hover:border-blue-500/50 transition-all">
             <div className="h-24 bg-gradient-to-br from-slate-800 to-slate-900 p-4 flex items-end relative">
                <span className="font-bold text-lg">{server.name}</span>
                <span className="absolute top-2 right-2 text-[10px] bg-black/40 px-2 py-1 rounded text-slate-400 font-mono">
                  ID: {server.id.slice(0, 8)}
                </span>
             </div>
             <div className="p-4">
                <button 
                  onClick={() => router.push(`/dashboard/${server.id}`)}
                  className="w-full py-2 bg-blue-600/10 text-blue-500 rounded-lg text-xs font-bold border border-blue-500/20 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all"
                >
                  Open Dashboard
                </button>
                <p className="text-[10px] text-slate-500 truncate">Owner: {server.owner_id}</p>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c1f] border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-2 text-white">Create Community</h2>
            <input 
              type="text" 
              className="w-full bg-[#0f0f10] border border-slate-800 rounded-lg p-3 mb-6 text-white outline-none focus:border-blue-500 transition"
              placeholder="Server Name"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
            />
            <div className="flex gap-3">
              <button className="flex-1 bg-slate-800 py-3 rounded-xl hover:bg-slate-700" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="flex-1 bg-blue-600 py-3 rounded-xl hover:bg-blue-500" onClick={handleCreateServer}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}