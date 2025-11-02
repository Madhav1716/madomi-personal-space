'use client';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-4 shadow-lg shadow-blue-500/50">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Listen together. Anywhere.</h1>
          <p className="mt-4 text-lg text-slate-300">Create a private room and play YouTube or Spotify in perfect sync. Chat, send hearts, and share the moment.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="/rooms" className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-medium text-white shadow-lg shadow-blue-500/30 hover:from-blue-500 hover:to-indigo-500">Create a room</a>
            <a href="/login" className="rounded-lg bg-slate-800 px-6 py-3 font-medium text-slate-200 hover:bg-slate-700">Sign in</a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-800/60 bg-slate-900/40 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Feature title="Perfect Sync" description="Play, pause, or seek — both devices stay in lockstep." />
            <Feature title="YouTube & Spotify" description="Use free YouTube or connect Spotify Premium." />
            <Feature title="Private Rooms" description="Invite by link or code. Just for you two." />
            <Feature title="Chat & Hearts" description="Talk, react, and share the vibe in real time." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-800/60 bg-slate-800/40 p-8 shadow-2xl backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-white">Ready to listen together?</h2>
            <p className="mt-2 text-slate-400">Create a room and send your love the link.</p>
            <a href="/rooms" className="mt-6 inline-flex rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-medium text-white shadow-lg shadow-blue-500/30 hover:from-blue-500 hover:to-indigo-500">Start now</a>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-800/40 p-5">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/60">
        <svg className="h-5 w-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13" />
        </svg>
      </div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
    </div>
  );
}