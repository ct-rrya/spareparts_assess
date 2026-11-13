export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-9 w-48 animate-pulse rounded bg-[#E2E4EC]" />
      <div className="h-72 animate-pulse rounded-[8px] border border-[#E2E4EC] bg-white" />
    </div>
  );
}
