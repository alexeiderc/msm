"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { submitProductReview } from "@/server/actions/reviews";
import type { ActionResult } from "@/types/actions";

const initialState: ActionResult = { ok: false, message: "" };

export function OrderReviewForm({
  productId,
  productName,
  orderId
}: {
  productId: string;
  productName: string;
  orderId: string;
}) {
  const [state, formAction, pending] = useActionState(submitProductReview, initialState);
  const [rating, setRating] = useState(0);

  if (state.ok) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
        Reseña enviada. Pendiente de aprobacion del administrador.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="rating" value={rating} />
      <p className="text-sm font-semibold">Califica {productName}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((v) => (
          <button key={v} type="button" onClick={() => setRating(v)} className="p-0.5">
            <Star size={20} className={v <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
          </button>
        ))}
      </div>
      <Input name="title" placeholder="Titulo (opcional)" />
      <Textarea name="comment" placeholder="Cuenta tu experiencia con este producto..." />
      {state.message && !state.ok ? (
        <p className="text-sm text-red-700">{state.message}</p>
      ) : null}
      <Button type="submit" disabled={pending || rating === 0}>
        {pending ? "Enviando..." : "Enviar reseña"}
      </Button>
    </form>
  );
}
