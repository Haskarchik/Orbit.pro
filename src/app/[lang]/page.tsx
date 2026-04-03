import { redirect } from 'next/navigation';
import { Language } from '@/lib/translations';

export default async function RootPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang = langParam as Language;

  // Optimized server-side redirect to the dashboard
  redirect(`/${lang}/dashboard`);
}
