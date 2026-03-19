import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function RegisterInfoPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-16">
      <Card className="w-full p-10 text-center">
        <h1 className="text-4xl font-black">Registration requires the live app</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          This uploadable build is the static public site. User registration needs the full application with backend services.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/">
            <Button variant="primary">Back to Home</Button>
          </Link>
          <Link href="/courses">
            <Button variant="outline">Explore Courses</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
