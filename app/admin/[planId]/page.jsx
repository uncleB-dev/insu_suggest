import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DetailClient } from '@/components/DetailClient';
import { buildComparison, relTime, fmtDate } from '@/lib/plan';

export const metadata = { title: '설계안 상세 — 보장 설계 시뮬레이터' };
export const dynamic = 'force-dynamic';

function fmtDateTime(iso) {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${fmtDate(iso)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function PlanDetailPage({ params }) {
  const { planId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: plan } = await supabase
    .from('plans')
    .select('id, label, status, proposal_json, created_at')
    .eq('id', planId)
    .maybeSingle();
  if (!plan) notFound();

  const { data: subs } = await supabase
    .from('submissions')
    .select('state_json, total_premium, client_memo, created_at')
    .eq('plan_id', planId)
    .order('created_at', { ascending: false });

  const latest = (subs && subs[0]) || null;
  const proposal = plan.proposal_json || {};
  const cmpRows = buildComparison(proposal, latest?.state_json);
  const coverageMap = Object.fromEntries(
    (proposal.coverages || []).map((c) => [c.id, { why: c.why, how: c.how }])
  );
  const history = (subs || []).map((s, i) => ({
    t: relTime(s.created_at),
    d: fmtDateTime(s.created_at),
    p: s.total_premium,
    latest: i === 0,
  }));

  const { data: advisor } = await supabase
    .from('advisors').select('name, email').eq('id', user.id).maybeSingle();

  const data = {
    label: plan.label,
    status: plan.status,
    cmpRows,
    memo: latest?.client_memo || '',
    history,
    coverageMap,
  };

  return (
    <DetailClient
      data={data}
      advisorName={advisor?.name || user.email?.split('@')[0] || '설계사'}
      advisorEmail={advisor?.email || user.email}
    />
  );
}
