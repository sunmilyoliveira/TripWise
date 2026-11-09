import { Plane, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./ui";
import { TripDialog } from "./TripDialog";
export function NoTrips() {
  return <EmptyState icon={Plane} title="Nenhuma viagem" text="Crie uma viagem com participantes para começar." action={<TripDialog><Button><Plus />Nova viagem</Button></TripDialog>} />;
}
