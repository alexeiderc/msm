"use client";

import { useActionState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { submitSellerReview } from "@/server/actions/reviews";
import { emptyActionResult } from "@/types/actions";

export function SellerReviewForm({
  sellerId,
  orderId
}: {
  sellerId?: string;
  orderId?: string;
}) {
  const [state, formAction, pending] = useActionState(submitSellerReview, emptyActionResult);

  return (
    <form action={formAction} className="grid gap-3 rounded-lg border border-msm-line bg-white p-4 shadow-soft">
      <h2 className="text-lg font-bold">Calificar vendedor VIP</h2>
      <Input name="sellerId" placeholder="ID vendedor" defaultValue={sellerId ?? ""} required />
      <Input name="orderId" placeholder="ID orden opcional" defaultValue={orderId ?? ""} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Select name="compliance" defaultValue="5" aria-label="Cumplimiento">
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>Cumplimiento {value}</option>
          ))}
        </Select>
        <Select name="quality" defaultValue="5" aria-label="Calidad">
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>Calidad {value}</option>
          ))}
        </Select>
        <Select name="attention" defaultValue="5" aria-label="Atencion">
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>Atencion {value}</option>
          ))}
        </Select>
      </div>
      <Textarea name="comment" placeholder="Comentario opcional para auditoria de confianza" />
      {state.message ? (
        <p className={state.ok ? "text-sm font-semibold text-msm-blue" : "text-sm font-semibold text-red-700"}>
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="bg-msm-blue">
        <Star size={17} />
        {pending ? "Guardando..." : "Guardar calificacion"}
      </Button>
    </form>
  );
}
