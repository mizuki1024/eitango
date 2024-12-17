export function Logo() {
  return (
    <div className="flex items-center gap-2 text-2xl font-bold">
      <div className="relative size-8">
        <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur" />
        <div className="relative flex h-full items-center justify-center rounded-full bg-white">
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            A
          </span>
        </div>
      </div>
      <span>AppName</span>
    </div>
  )
}

