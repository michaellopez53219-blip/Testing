"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // App States
  const [servers, setServers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newServerName, setNewServerName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Discord States
  const [discordServers, setDiscordServers] = useState<any[]>([]);
  const [loadingGuilds, setLoadingGuilds] = useState(false);
  const [selectedDiscordId, setSelectedDiscordId] = useState("");

  const fetchServers = async () => {
    const { data } = await supabase.from("user_servers").select("*");
    if (data) setServers(data);
  };

  const fetchDiscordGuilds = async () => {
    // @ts-ignore - Ignore the accessToken type error for now
    if (!session?.accessToken) return;
    setLoadingGuilds(true);
    try {
      const res = await fetch("https://discord.com/api/users/@me/guilds", {
        // @ts-ignore
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      const guilds = await res.json();
      // Filter for servers where user has Admin permissions
      const adminGuilds = guilds.filter((guild: any) => 
        guild.owner || (BigInt(guild.permissions) & BigInt(0x8)) === BigInt(0x8)
      );
      setDiscordServers(adminGuilds);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGuilds(false);
    }
  };

  useEffect(() => { fetchServers(); }, []);
  useEffect(() => { if (isModalOpen) fetchDiscordGuilds(); }, [isModalOpen, session]);

  const handleCreateServer = async () => {
    if (!newServerName.trim()) return;
    setIsCreating(true);

    try {
      const { data, error } = await supabase
        .from("user_servers")
        .insert([{ 
          server_name: newServerName, 
          discord_id: selectedDiscordId 
        }])
        .select()
        .single();

      if (error) throw error;

      // Reset and Close
      setIsModalOpen(false);
      setNewServerName("");
      setSelectedDiscordId("");
      
      // Refresh list or redirect
      fetchServers();
      // Uncomment the line below to go straight to the new server's panel:
      // router.push(`/dashboard/${data.id}`);

    } catch (err: any) {
      console.error("Error:", err.message);
      alert("Failed to create server.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold italic tracking-tighter underline decoration-blue-600">PROJECT: DASHBOARD</h1>
      </header>

      {/* SERVER CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers.map((server) => (
          <div key={server.id} className="bg-[#18181b] rounded-2xl overflow-hidden border border-slate-800 p-5 hover:border-blue-500/50 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold uppercase shadow-lg shadow-blue-900/20">
                {server.server_name?.charAt(0)}
              </div>
              <h3 className="font-bold text-lg">{server.server_name}</h3>
            </div>
            <Link href={`/dashboard/${server.id}`}>
              <button className="w-full bg-[#1e293b] hover:bg-blue-600 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2">
                ⚡ Quick Access
              </button>
            </Link>
          </div>
        ))}

        {/* ADD NEW BUTTON */}
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="border-2 border-dashed border-slate-800 rounded-2xl p-10 text-slate-500 hover:text-blue-400 hover:border-blue-400/50 transition-all flex flex-col items-center gap-2"
        >
          <span className="text-2xl">+</span>
          <span className="font-semibold text-sm">Add New Server</span>
        </button>
      </div>

      {/* CREATE SERVER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-[#0f0f10] border border-slate-800 w-full max-w-2xl rounded-2xl p-8 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">Create New Server</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
              {/* SERVER NAME INPUT */}
              <div>
                <label className="text-sm font-semibold text-slate-400">Server Name *</label>
                <input 
                  placeholder="Give your server a unique name"
                  className="w-full bg-[#161618] border border-slate-800 rounded-xl p-4 mt-2 focus:border-blue-500 outline-none transition"
                  value={newServerName}
                  onChange={(e) => setNewServerName(e.target.value)}
                />
              </div>

              {/* DISCORD LINKER SECTION */}
              <div>
                <label className="text-sm font-semibold text-slate-400">Link Your Discord Server <span className="text-xs font-normal opacity-50">(optional)</span></label>
                <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                  {discordServers.length > 0 ? (
                    discordServers.map((guild) => (
                      <div 
                        key={guild.id}
                        onClick={() => setSelectedDiscordId(guild.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all ${
                          selectedDiscordId === guild.id 
                            ? "border-emerald-500 bg-emerald-500/10" 
                            : "border-slate-800 bg-[#161618] hover:border-slate-700"
                        }`}
                      >
                        {guild.icon ? (
                          <img src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} className="w-8 h-8 rounded-full shadow-md" alt="" />
                        ) : (
                          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-[10px] font-bold">{guild.name.charAt(0)}</div>
                        )}
                        <span className="text-sm font-medium">{guild.name}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-600 py-4 text-center">No servers found or Discord not linked.</p>
                  )}
                </div>
              </div>

              {/* CONTINUE BUTTON */}
              <button 
                onClick={handleCreateServer}
                disabled={isCreating}
                className="w-full bg-blue-600 font-bold py-4 rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                {isCreating ? "Creating..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}