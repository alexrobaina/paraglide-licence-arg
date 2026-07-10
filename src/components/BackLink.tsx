'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

/**
 * "Back" that returns to wherever the user actually came from (router history),
 * falling back to a fixed route on a fresh tab / deep link.
 */
export default function BackLink({
  fallback,
  label,
}: {
  fallback: string;
  label: string;
}) {
  const router = useRouter();

  function goBack() {
    // history.length > 1 means there is somewhere to go back to within the tab.
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push(fallback);
  }

  return (
    <button
      onClick={goBack}
      className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-800 dark:hover:text-neutral-200"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
