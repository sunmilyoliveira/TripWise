import { useEffect, useState } from "react";
import { useAppState } from "@/lib/store";
import { NativeSelect } from "./ui";

/** Shared trip selection that remembers the last trip across pages (session only). */
let lastTrip = "";
export function useSelectedTrip() {
  const trips = useAppState((s) => s.trips);
  const [id, setId] = useState(lastTrip);
  useEffect(() => { if (!trips.some((t) => t.id === id) && trips[0]) setId(trips[0].id); }, [trips, id]);
  const set = (v: string) => { lastTrip = v; setId(v); };
  return { trip: trips.find((t) => t.id === id) ?? trips[0], setTripId: set, trips };
}
export function TripPicker({ value, onChange }: { value?: string; onChange: (id: string) => void }) {
  const trips = useAppState((s) => s.trips);
  return (
    <NativeSelect aria-label="Selecionar viagem" value={value} onChange={(e) => onChange(e.target.value)} className="w-auto min-w-48">
      {trips.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.destination}</option>)}
    </NativeSelect>
  );
}
