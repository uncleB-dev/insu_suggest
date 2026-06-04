import '@/lib/colors_and_type.css';
import './globals.css';

export const metadata = {
  title: '보장 설계 시뮬레이터',
  description: '고객 보험 설계 제안 서비스 — 설계사가 만든 맞춤 보장 설계안을 고객이 직접 조정·저장하는 웹 서비스',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
