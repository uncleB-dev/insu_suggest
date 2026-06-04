import { redirect } from 'next/navigation';

export default function Home() {
  // 서비스 진입 → 설계사 로그인. 디자인 프로토타입은 /preview 에서 확인.
  redirect('/login');
}
