import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { NewPlanClient } from '@/components/NewPlanClient';

export const metadata = { title: '새 설계안 — 보장 설계 시뮬레이터' };
export const dynamic = 'force-dynamic';

export default async function NewPlanPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return <NewPlanClient />;
}
