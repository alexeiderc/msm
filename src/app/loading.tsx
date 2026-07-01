export default function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-msm-cloud">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-msm-line border-t-msm-blue" />
        <p className="text-sm font-semibold text-slate-500">Cargando...</p>
      </div>
    </div>
  );
}
