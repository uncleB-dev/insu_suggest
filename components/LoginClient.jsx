'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LoginScreen, AdminTopNav } from './AdminScreens';
import { ToastAuto } from './CommonStates';

export function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/admin';
  const [toast, setToast] = useState(null);
  const supabase = createClient();

  async function onAuth(email, pw) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) return '이메일 또는 비밀번호를 확인하세요.';
    return null;
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <LoginScreen
        defaultEmail=""
        onAuth={onAuth}
        onLogin={() => { router.replace(next); router.refresh(); }}
      />
      {toast && <ToastAuto {...toast} onDone={() => setToast(null)} />}
    </div>
  );
}
