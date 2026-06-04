// Supabase 연결 설정.
// publishable(anon) 키는 브라우저로 전송되는 공개 키이므로 폴백 기본값으로 둬도 안전합니다.
// (데이터 접근은 RLS + SECURITY DEFINER RPC가 보호합니다.) 환경변수가 있으면 우선합니다.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rqngzsmenridabrluvxt.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_jbBT_TD88s3L5rdKpv6wQw_6LC5ao93';
