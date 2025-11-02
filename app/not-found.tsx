export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white">Page not found</h1>
        <p className="mt-2 text-slate-400">The page you’re looking for doesn’t exist.</p>
        <a href="/" className="mt-6 inline-flex rounded-lg bg-slate-800 px-5 py-3 font-medium text-slate-200 hover:bg-slate-700">Go home</a>
      </div>
    </div>
  );
}


