import { exportLedgerCsv } from "@/server/actions/economy";

export async function GET() {
  try {
    const csv = await exportLedgerCsv();

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="msm-ledger-${new Date().toISOString().slice(0, 10)}.csv"`
      }
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "No se pudo exportar el ledger." },
      { status: 500 }
    );
  }
}
