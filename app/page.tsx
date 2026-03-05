"use client";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase"; // Updated path based on your folder image
import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();
  const [servers, setServers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newServerName, setNewServerName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchServers = async () => {
    const { data, error } = await supabase.from("user_servers").select("*");
    if (data) setServers(data);
    if (error) console.error("Fetch Error:", error.message);
  };

  useEffect(() => { fetchServers(); }, []);

  const handleCreateServer = async () => {
    if (!newServerName.trim()) return;
    setIsCreating(true);

    try {
      const { data, error } = await supabase
        .from("user_servers")
        .insert([{ server_name: newServerName }])
        .select();

      if (error) throw error;

      alert("Success! Server Created.");
      setIsModalOpen(false);
      setNewServerName("");
      fetchServers();
    } catch (err: any) {
      // THE BUG FINDER
      alert(`DATABASE ERROR:\nCode: ${err.code}\nMessage: ${err.message}`);
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white p-8">
      <h1 className="text-3xl font-bold mb-8 underline decoration-blue-600">PROJECT: DASHBOARD</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {servers.map((s) => (
          <div key={s.id} className="bg-[#18181b] p-6 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-xl">{s.server_name}</h3>
          </div>
        ))}
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-slate-800 rounded-2xl p-10 text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-all"
        >
          + Add New Server
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f0f10] border border-slate-800 p-8 rounded-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Create Server</h2>
            <input 
              className="w-full bg-[#161618] border border-slate-800 p-4 rounded-xl mb-4 outline-none focus:border-blue-500"
              placeholder="Server Name"
              value={newServerName}
              onChange={(e) => setNewServerName(e.target.value)}
            />
            <button 
              onClick={handleCreateServer}
              disabled={isCreating}
              className="w-full bg-blue-600 py-4 rounded-xl font-bold hover:bg-blue-500 transition-all"
            >
              {isCreating ? "Connecting to Database..." : "Continue"}
            </button>
            <button onClick={() => setIsModalOpen(false)} className="w-full mt-2 text-slate-500 text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}