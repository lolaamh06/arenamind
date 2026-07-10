export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 text-zinc-50 font-sans">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-400">
          ArenaMind — Setup Complete
        </h1>
        <p className="text-zinc-400 text-lg">
          The foundational scaffolding for the ArenaMind AI Decision Intelligence Platform is fully
          configured.
        </p>
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-500 font-mono">
          Mono-Repository: Next.js + Tailwind + Express + TypeScript
        </div>
      </div>
    </main>
  );
}
