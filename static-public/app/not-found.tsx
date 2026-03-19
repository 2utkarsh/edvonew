export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-black">Page not found</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">
        This static public build only includes the uploadable marketing site.
      </p>
    </main>
  );
}
