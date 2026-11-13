export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:grid md:grid-cols-[230px_1fr]">
      <div className="bg-slate-900 h-14 md:h-auto" />
      <div className="p-6 sm:p-8 flex flex-col gap-6 max-w-[1200px]">
        <div className="h-9 w-56 rounded bg-slate-200 animate-pulse" />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-lg bg-white border border-slate-200 animate-pulse"
            />
          ))}
        </div>
        <div className="h-64 rounded-lg bg-white border border-slate-200 animate-pulse" />
      </div>
    </div>
  );
}
