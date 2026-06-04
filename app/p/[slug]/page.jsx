import { createClient } from '@/lib/supabase/server';
import { ClientPlanner } from '@/components/ClientPlanner';

export const metadata = {
  title: '맞춤 보장 설계안',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default async function CustomerPlanPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();
  // slug 유효성 + 인증 방식 라벨 (민감정보 아님). 코드 검증은 게이트에서.
  const { data: authType } = await supabase.rpc('get_plan_meta', { p_slug: slug });
  const invalid = !authType;
  return <ClientPlanner slug={slug} authType={authType || 'birth'} invalid={invalid} />;
}
