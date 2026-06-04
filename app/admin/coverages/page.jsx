import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CoverageLibraryClient } from '@/components/CoverageLibraryClient';

export const metadata = { title: '보장 설명 관리 — 보장 설계 시뮬레이터' };
export const dynamic = 'force-dynamic';

const CAT_ORDER = { cancer: 0, brainHeart: 1, injury: 2, disease: 3, hospital: 4, waiver: 5 };

export default async function CoveragesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: rows } = await supabase
    .from('coverages_master')
    .select('id, name, cat, why, how')
    .order('name', { ascending: true });

  const sorted = (rows || []).slice().sort((a, b) => {
    const ca = CAT_ORDER[a.cat] ?? 99, cb = CAT_ORDER[b.cat] ?? 99;
    return ca !== cb ? ca - cb : a.name.localeCompare(b.name, 'ko');
  });

  const { data: advisor } = await supabase
    .from('advisors').select('name, email').eq('id', user.id).maybeSingle();

  return (
    <CoverageLibraryClient
      rows={sorted}
      advisorName={advisor?.name || user.email?.split('@')[0] || '설계사'}
      advisorEmail={advisor?.email || user.email}
    />
  );
}
