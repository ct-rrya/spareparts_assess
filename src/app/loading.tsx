export default function StoreLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-[72px] border-b border-slate-200 bg-white" />
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        <div className="h-[340px] rounded-xl bg-slate-100 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-200 bg-white p-3.5 flex flex-col gap-3"
            >
              <div className="aspect-square rounded bg-slate-100 animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-slate-100 animate-pulse" />
              <div className="h-4 w-1/3 rounded bg-slate-100 animate-pulse" />
              <div className="h-12 rounded bg-slate-100 animate-pulse mt-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
