"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
    // Set loading to false after router.replace has been called
    // to avoid rendering anything from this page.
    // The target page will handle its own loading state.
    // If we set it too early, there might be a flash of this page's content (null).
    // However, since we return null, it's less of an issue.
    // For an even smoother experience, a global loading state or a brief skeleton here might be used.
    // setIsLoading(false); 
  }, [router]);

  // Render a minimal loading state or null during the check
  // This prevents any flash of content before redirection.
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center">
        <svg className="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-muted-foreground">Loading Reservista...</p>
      </div>
    </div>
  );
}
