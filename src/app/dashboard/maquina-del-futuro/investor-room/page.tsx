"use client";

import { useState, useEffect } from "react";
import { Lock, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { InvestorRoom } from "@/components/maquina-futuro/investor-room";

type Room = {
  id: string;
  room_name: string;
  summary?: string;
  pitch_text?: string;
  access_token?: string;
  status: string;
  target_raise_amount?: number;
  currency?: string;
};

export default function InvestorRoomPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [summary, setSummary] = useState("");
  const [targetRaise, setTargetRaise] = useState("");

  useEffect(() => {
    fetch("/api/maquina-futuro/investors/list")
      .then((r) => r.json())
      .then((data) => setRooms(data.rooms ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function createRoom() {
    setCreating(true);
    try {
      const res = await fetch("/api/maquina-futuro/investors/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: roomName || "Investor Room",
          summary,
          targetRaiseAmount: targetRaise ? Number(targetRaise) : undefined
        })
      });
      if (res.ok) {
        const data = await res.json();
        setRooms((prev) => [data.room, ...prev]);
        setShowForm(false);
        setRoomName("");
        setSummary("");
        setTargetRaise("");
      }
    } catch {}
    setCreating(false);
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Badge className="bg-msm-blue/10 text-msm-blue border-msm-blue/20 mb-2">La Maquina del Futuro</Badge>
          <h1 className="text-2xl font-black text-msm-ink">Investor Room</h1>
          <p className="mt-1 text-sm text-slate-500">Crea rooms privados para presentar tu proyecto a inversionistas</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-msm-blue">
          <Plus size={16} /> Nuevo Room
        </Button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-msm-blue/20 bg-white p-5 shadow-soft">
          <h3 className="font-bold text-msm-ink mb-4">Crear Investor Room</h3>
          <div className="grid gap-3">
            <Input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Nombre del room" />
            <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Resumen ejecutivo" rows={3} />
            <Input value={targetRaise} onChange={(e) => setTargetRaise(e.target.value)} placeholder="Monto objetivo (USD)" type="number" />
            <div className="flex gap-2">
              <Button onClick={createRoom} disabled={creating} className="bg-msm-blue">
                {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Crear Room
              </Button>
              <Button onClick={() => setShowForm(false)} className="bg-slate-200 text-slate-600 shadow-none">Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="text-msm-blue animate-spin" size={32} />
        </div>
      ) : rooms.length > 0 ? (
        <div className="grid gap-6">
          {rooms.map((room) => (
            <InvestorRoom
              key={room.id}
              roomName={room.room_name}
              summary={room.summary}
              pitchText={room.pitch_text}
              accessToken={room.access_token}
              status={room.status}
              targetRaise={room.target_raise_amount}
              currency={room.currency}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-msm-line bg-white p-12 text-center">
          <Lock className="mx-auto text-slate-300" size={48} />
          <h2 className="mt-4 text-lg font-bold text-msm-ink">No hay investor rooms</h2>
          <p className="mt-2 text-sm text-slate-500">Crea tu primer room privado para inversionistas</p>
        </div>
      )}
    </div>
  );
}
