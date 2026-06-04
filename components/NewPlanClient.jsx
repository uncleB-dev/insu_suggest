'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { NewPlanScreen } from './NewPlanScreen';
import { ToastAuto } from './CommonStates';

export function NewPlanClient() {
  const router = useRouter();
  const [toast, setToast] = useState(null);
  const supabase = createClient();

  async function onCreate({ label, slug, accessCode, authType, proposalJson, comment }) {
    const { error } = await supabase.rpc('create_plan', {
      p_label: label,
      p_slug: slug,
      p_access_code: accessCode,
      p_auth_type: authType,
      p_proposal_json: proposalJson,
      p_agent_comment: comment || null,
    });
    if (error) {
      return { error: error.message.includes('duplicate') ? '링크 토큰이 중복됐어요. 다시 시도해 주세요.' : `생성 실패: ${error.message}` };
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return { url: `${origin}/p/${slug}` };
  }

  return (
    <>
      <NewPlanScreen
        onCreate={onCreate}
        onBack={() => router.push('/admin')}
        onDone={() => { router.push('/admin'); router.refresh(); }}
        setToast={setToast}
      />
      {toast && <ToastAuto {...toast} onDone={() => setToast(null)} />}
    </>
  );
}
