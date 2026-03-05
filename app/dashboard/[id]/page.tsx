"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase"; 
import { useParams } from "next/navigation";

export default function ModeratorPanel() {
  const { id } = useParams();
  const [server, setServer] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [reason, setReason] = useState("");
  const [type, setType] = useState("Warning");

  // Fetch Server Info & Logs
  useEffect(() => {
    async function fetchData() {
      const { data: serverData } = await supabase.from("user_servers").select("*").eq("id", id).single();
      if (serverData) setServer(serverData);

      const { data: logData } = await supabase
        .from("punishment_logs")
        .select("*")
        .eq("server_id", id)
        .order("created_at", { ascending: false });
      if (logData) setLogs(logData);
    }
    fetchData();
  }, [id]);

  // Submit Punishment
  const handleSubmitLog = async () => {
    const { error } = await supabase.from("punishment_logs").insert([{
      server_id: id,
      player_name: playerName,
      player_id: playerId,
      reason: reason,
      type: type
    }]);

    if (!error) {
      setIsModalOpen(false);
      setPlayerName("");
      setPlayerId("");
      setReason("");
      // Refresh logs
      const { data } = await supabase.from("punishment_logs").select("*").eq("server_id", id).order("created_at", { ascending: false });
      if (data) setLogs(data);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col p-4 gap-4">
      {/* Top Navbar */}
      <header className="flex justify-between items-center bg-[#18181b] p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-emerald-500 font-bold">●</span>
          <h1 className="font-bold">{server?.server_name || "Loading..."}</h1>
        </div>
        <div className="flex gap-4 items-center">
          <input className="bg-[#0f0f10] border border-slate-800 rounded-lg px-3 py-1 text-sm w-64 outline-none focus:border-blue-500" placeholder="Command Palette (/)" />
          <div className="w-8 h-8 bg-slate-700 rounded-full" />
        </div>
      </header>

      <div className="grid grid-cols-12 gap-4 flex-grow overflow-hidden">
        {/* LEFT COLUMN */}
        <div className="col-span-3 space-y-4">
          <div className="bg-[#18181b] p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-slate-600 rounded-full" />
              <div>
                <h2 className="font-bold tracking-tight">Hey, Admin!</h2>
                <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                   <span className="animate-pulse">●</span> Online
                </span>
              </div>
            </div>
            <button className="w-full bg-[#10b981] hover:bg-[#059669] text-black font-bold py-3 rounded-xl transition shadow-lg shadow-emerald-500/10">
              Start Shift
            </button>
          </div>

          <div className="bg-[#18181b] p-6 rounded-2xl border border-slate-800">
            <h3 className="text-slate-400 text-[11px] font-bold uppercase mb-4 tracking-widest">Toolbox</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-[#10b981]/10 text-[#10b981] p-3 rounded-xl text-xs font-bold border border-[#10b981]/20 hover:bg-[#10b981]/20">Manage LOA</button>
              <button className="bg-[#e11d48]/10 text-[#e11d48] p-3 rounded-xl text-xs font-bold border border-[#e11d48]/20 hover:bg-[#e11d48]/20">Run Command</button>
              <button onClick={() => setIsModalOpen(true)} className="bg-blue-600/10 text-blue-400 p-3 rounded-xl text-xs font-bold border border-blue-600/20 hover:bg-blue-600/20">Actions</button>
              <button className="bg-orange-600/10 text-orange-400 p-3 rounded-xl text-xs font-bold border border-orange-600/20 hover:bg-orange-600/20">Session</button>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Activity Feed */}
        <div className="col-span-5 bg-[#18181b] rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">What's happening in game?</h3>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar">
            <div className="bg-[#0f0f10] p-4 rounded-xl border border-slate-800 text-sm">
              <span className="text-slate-500 font-mono text-xs">Recently</span>
              <p className="mt-1 text-slate-300">System is ready for logs...</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Real Punishment Logs */}
        <div className="col-span-4 bg-[#18181b] rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-[#1c1c1f]">
            <h3 className="font-bold">Punishment Logs</h3>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar">
            {logs.map((log) => (
              <div key={log.id} className="bg-[#0f0f10] p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition">
                <div className="flex justify-between items-start">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    log.type === 'Ban' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'
                  }`}>
                    {log.type}
                  </span>
                  <span className="text-slate-500 text-[10px]">{new Date(log.created_at).toLocaleDateString()}</span>
                </div>
                <p className="font-bold mt-2 text-sm">User: {log.player_name}</p>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">Reason: {log.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ACTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-[#0f0f10] border border-slate-800 w-full max-w-md rounded-2xl p-8 space-y-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold">Log Punishment</h2>
            <div className="space-y-4">
              <input placeholder="Player Name" className="w-full bg-[#18181b] border border-slate-800 p-3 rounded-xl outline-none focus:border-blue-500" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
              <input placeholder="Roblox ID" className="w-full bg-[#18181b] border border-slate-800 p-3 rounded-xl outline-none focus:border-blue-500" value={playerId} onChange={(e) => setPlayerId(e.target.value)} />
              <select className="w-full bg-[#18181b] border border-slate-800 p-3 rounded-xl outline-none" value={type} onChange={(e) => setType(e.target.value)}>
                <option>Warning</option>
                <option>Kick</option>
                <option>Ban</option>
              </select>
              <textarea placeholder="Reason for punishment" className="w-full bg-[#18181b] border border-slate-800 p-3 rounded-xl h-24 outline-none focus:border-blue-500" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-400 hover:text-white transition">Cancel</button>
              <button onClick={handleSubmitLog} className="flex-1 bg-blue-600 hover:bg-blue-500 font-bold py-3 rounded-xl transition">Submit Log</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}