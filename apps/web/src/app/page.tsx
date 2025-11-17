import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-background">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          IELTS Prep Platform
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Comprehensive IELTS preparation with speaking, writing, listening, and
          reading practice. Track progress, get feedback from expert teachers.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/register">Register Organization</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
