import { Suspense } from 'react';
import { LoginClient } from '@/components/LoginClient';

export const metadata = { title: '설계사 로그인 — 보장 설계 시뮬레이터' };

export default function LoginPage() {
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
}
