"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/lib/translations';
import React from 'react';

export default function RootPage({ params }: { params: Promise<{ lang: string }> }) {
  const router = useRouter();
  const { lang: langParam } = React.use(params);
  const lang = langParam as Language;

  useEffect(() => {
    // Strategic redirect to the primary dashboard node
    router.replace(`/${lang}/dashboard`);
  }, [lang, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-16 h-1 bg-slate-900 overflow-hidden rounded-full">
            <div className="w-1/2 h-full bg-orange-600 animate-slide-loading" />
        </div>
    </div>
  );
}
