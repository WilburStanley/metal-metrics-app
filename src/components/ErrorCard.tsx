interface ErrorCardProps {
  message?: string;
}

export const ErrorCard = ({ message = 'Failed to load data.' }: ErrorCardProps) => (
  <div className="rounded-lg bg-black border-2 border-white/10 flex items-center justify-center p-6 h-full">
    <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-8 py-6 text-center w-full max-w-sm mx-auto">
      <p className="text-red-400 text-sm font-medium mb-1">Unavailable</p>
      <p className="text-red-400/70 text-xs">{message}</p>
    </div>
  </div>
);