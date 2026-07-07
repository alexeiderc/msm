"use client";

"use client";

import { useActionState } from "react";
import { moderateReview } from "@/server/actions/reviews";

export function ReviewModerationForm({ reviewId }: { reviewId: string }) {
  const [state, action, pending] = useActionState(
    () => moderateReview(reviewId, true),
    null
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    () => moderateReview(reviewId, false),
    null
  );

  return (
    <div className="flex gap-2">
      <form action={action}>
        <button disabled={pending} className="rounded bg-green-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">
          {pending ? "..." : "Aprobar"}
        </button>
      </form>
      <form action={rejectAction}>
        <button disabled={rejectPending} className="rounded bg-red-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">
          {rejectPending ? "..." : "Rechazar"}
        </button>
      </form>
      {state?.message && <p className={`text-xs ${state.ok ? "text-green-600" : "text-red-600"}`}>{state.message}</p>}
      {rejectState?.message && <p className={`text-xs ${rejectState.ok ? "text-green-600" : "text-red-600"}`}>{rejectState.message}</p>}
    </div>
  );
}
