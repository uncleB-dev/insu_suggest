import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardClient } from '@/components/DashboardClient';
import { basePremium, fmtDate, relTime } from '@/lib/plan';

export const metadata = { title: '내 설계안 — 보장 설계 시뮬레이터' };
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: plans } = await supabase
    .from('plans')
    .select('id, label, proposal_json, status, created_at')
    .order('created_at', { ascending: false });

  const ids = (plans || []).map((p) => p.id);
  let subsByPlan = {};
  if (ids.length) {
    const { data: subs } = await supabase
      .from('submissions')
      .select('plan_id, total_premium, created_at')
      .in('plan_id', ids)
      .order('created_at', { ascending: false });
    for (const s of subs || []) {
      if (!subsByPlan[s.plan_id]) subsByPlan[s.plan_id] = s; // latest (first due to desc)
    }
  }

  const rows = (plans || []).map((p) => {
    const latest = subsByPlan[p.id];
    return {
      id: p.id,
      label: p.label,
      product: p.proposal_json?.customer?.product || '—',
      issued: fmtDate(p.created_at),
      status: p.status,
      base: basePremium(p.proposal_json),
      customer: latest ? latest.total_premium : null,
      savedAt: latest ? relTime(latest.created_at) : relTime(p.created_at),
      memo: false,
    };
  });

  const { data: advisor } = await supabase
    .from('advisors').select('name, email').eq('id', user.id).maybeSingle();

  return (
    <DashboardClient
      plans={rows}
      advisorName={advisor?.name || user.email?.split('@')[0] || '설계사'}
      advisorEmail={advisor?.email || user.email}
    />
  );
}
