"use client";

import { Star } from "lucide-react";

export function ProductReviews({
  reviews,
  average,
  count,
}: {
  reviews: { id: string; rating: number; title?: string; comment?: string; profiles?: { full_name?: string }[] | { full_name?: string }; created_at: string }[];
  average: number;
  count: number;
}) {
  if (count === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1 text-amber-500">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={20} fill={s <= Math.round(average) ? "currentColor" : "none"} />
          ))}
        </div>
        <span className="text-lg font-bold">{average}</span>
        <span className="text-sm text-slate-500">({count} reseñas)</span>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => {
          const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
          return (
            <div key={r.id} className="rounded-lg border bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">{profile?.full_name ?? "Anonimo"}</p>
                <div className="flex text-amber-500">
                  {Array.from({ length: r.rating }, (_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
              </div>
              {r.title && <p className="mt-1 text-sm font-semibold">{r.title}</p>}
              {r.comment && <p className="mt-1 text-sm text-slate-600">{r.comment}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
