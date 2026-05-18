export function LoadingSpinner({ message = 'Loading weather...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
      <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
