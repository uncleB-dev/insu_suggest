'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DetailScreen } from './DetailScreen';
import { ToastAuto } from './CommonStates';

export function DetailClient({ data, advisorName, advisorEmail }) {
  const router = useRouter();
  const [toast, setToast] = useState(null);
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  }

  return (
    <>
      <DetailScreen
        label={data.label}
        status={data.status}
        cmpRows={data.cmpRows}
        memo={data.memo}
        history={data.history}
        coverageMap={data.coverageMap}
        advisorName={advisorName}
        advisorEmail={advisorEmail}
        onBack={() => router.push('/admin')}
        onNew={() => router.push('/admin/new')}
        onLogout={logout}
        setToast={setToast}
      />
      {toast && <ToastAuto {...toast} onDone={() => setToast(null)} />}
    </>
  );
}
