'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DashboardScreen } from './AdminScreens';
import { ToastAuto } from './CommonStates';

export function DashboardClient({ plans, advisorName, advisorEmail }) {
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
      <DashboardScreen
        plans={plans}
        hideManager
        advisorName={advisorName}
        advisorEmail={advisorEmail}
        onNew={() => router.push('/admin/new')}
        onOpen={(p) => router.push(`/admin/${p.id}`)}
        onLogout={logout}
        setToast={setToast}
      />
      {toast && <ToastAuto {...toast} onDone={() => setToast(null)} />}
    </>
  );
}
