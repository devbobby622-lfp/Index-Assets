import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div
          className="text-8xl font-black text-primary mb-4 bloom-text"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          404
        </div>
        <h1 className="text-2xl font-black mb-3">Page not found</h1>
        <p className="text-muted-foreground mb-8">
          This page doesn't exist, or it got removed when Rec Room updated past 2020.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold hover:opacity-90 transition-opacity"
          style={{ boxShadow: '0 8px 24px hsl(var(--primary) / 0.25)' }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
      </div>
    </div>
  );
}
