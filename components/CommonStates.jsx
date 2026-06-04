'use client';
/* 화면 8 — 공통 상태 컴포넌트 (로딩 / 에러 / 빈 상태 / 토스트) + 갤러리. */

import React, { useState, useEffect } from 'react';
import { Icon, Button } from './Primitives';
import { Spinner, Toast, SectionTitle } from './Extras';

const useS = useState, useE = useEffect;

export function SkeletonLine({ w = '100%', h = 12, r = 6, style }) {
  return <div style={{
    width: w, height: h, borderRadius: r,
    background: 'linear-gradient(90deg, var(--semantic-fill-alternative) 0%, var(--semantic-fill-normal) 40%, var(--semantic-fill-alternative) 80%)',
    backgroundSize: '400px 100%', animation: 'shimmer 1.4s ease infinite', ...style,
  }} />;
}

export function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: 'var(--semantic-shadow-xsmall), inset 0 0 0 1px var(--semantic-line-normal-neutral)', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <SkeletonLine w={44} h={44} r={12} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SkeletonLine w="60%" h={14} />
          <SkeletonLine w="38%" h={11} />
        </div>
      </div>
      <SkeletonLine w="100%" h={11} />
      <SkeletonLine w="82%" h={11} />
      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
        <SkeletonLine w={64} h={26} r={8} />
        <SkeletonLine w={80} h={26} r={8} />
      </div>
    </div>
  );
}

export function LoadingBlock({ label = '불러오는 중', minHeight = 220 }) {
  return (
    <div style={{ minHeight, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: 'var(--semantic-label-alternative)' }}>
      <Spinner size={30} color="var(--semantic-primary-normal)" stroke={3} />
      <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

// Decorative geometric glyph for empty/error (no AI-slop illustration)
export function Glyph({ tone = 'neutral', icon = 'search', size = 72 }) {
  const map = {
    neutral: { bg: 'var(--semantic-fill-alternative)', fg: 'var(--semantic-label-alternative)' },
    blue:    { bg: 'rgba(0,102,255,0.08)', fg: 'var(--semantic-primary-normal)' },
    red:     { bg: 'rgba(255,66,66,0.10)', fg: 'var(--atomic-red-40)' },
    green:   { bg: 'rgba(0,191,64,0.12)', fg: 'var(--atomic-green-40)' },
  }[tone];
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.32, background: map.bg, color: map.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon name={icon} size={size * 0.42} />
    </div>
  );
}

export function EmptyState({ icon = 'search', title, body, action, tone = 'neutral', compact }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center', padding: compact ? '36px 24px' : '56px 24px' }}>
      <Glyph tone={tone} icon={icon} />
      <div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</h3>
        {body && <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: '21px', color: 'var(--semantic-label-alternative)', maxWidth: 320, textWrap: 'pretty' }}>{body}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ kind = 'expired', action }) {
  const meta = {
    expired: { icon: 'close', title: '유효하지 않거나 만료된 링크예요', body: '링크가 만료되었거나 잘못되었습니다. 설계사에게 문의해 주세요.' },
    server:  { icon: 'bell',  title: '일시적인 오류가 발생했어요', body: '잠시 후 다시 시도해 주세요. 문제가 계속되면 설계사에게 알려주세요.' },
  }[kind];
  return <EmptyState tone="red" icon={meta.icon} title={meta.title} body={meta.body} action={action} />;
}

// Gallery screen (review surface for the design system tab)
export function CommonStatesScreen() {
  const [toast, setToast] = useS(null);
  const cell = { background: '#fff', borderRadius: 16, boxShadow: 'var(--semantic-shadow-xsmall), inset 0 0 0 1px var(--semantic-line-normal-neutral)', overflow: 'hidden', position: 'relative' };
  const head = { padding: '14px 18px', borderBottom: '1px solid var(--semantic-line-solid-neutral)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' };
  const cap = { fontSize: 12.5, fontWeight: 700, letterSpacing: '0.02em', color: 'var(--semantic-label-neutral)' };
  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 32px 80px' }}>
      <SectionTitle sub="모든 화면에서 재사용하는 로딩·에러·빈 상태·토스트 패턴입니다." style={{ marginBottom: 24 }}>공통 상태 컴포넌트</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>

        <div style={cell}>
          <div style={head}><span style={cap}>로딩 — 스켈레톤</span></div>
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SkeletonCard />
          </div>
        </div>

        <div style={cell}>
          <div style={head}><span style={cap}>로딩 — 스피너</span></div>
          <LoadingBlock />
        </div>

        <div style={cell}>
          <div style={head}><span style={cap}>에러 — 만료/잘못된 링크</span></div>
          <ErrorState kind="expired" action={<Button variant="outlined" color="assistive" size="small">설계사에게 문의</Button>} />
        </div>

        <div style={cell}>
          <div style={head}><span style={cap}>에러 — 서버 오류</span></div>
          <ErrorState kind="server" action={<Button size="small">다시 시도</Button>} />
        </div>

        <div style={cell}>
          <div style={head}><span style={cap}>빈 상태 — 설계안 0건</span></div>
          <EmptyState icon="business-bag" tone="blue" title="아직 설계안이 없어요" body="첫 설계안을 만들어 고객에게 보내보세요." action={<Button size="small" leadingContent={<Icon name="plus" size={16} />}>새 설계안</Button>} />
        </div>

        <div style={cell}>
          <div style={head}><span style={cap}>빈 상태 — 검색 결과 없음</span></div>
          <EmptyState icon="search" title="조건에 맞는 설계안이 없어요" body="검색어나 필터를 바꿔보세요." />
        </div>

        <div style={{ ...cell, gridColumn: '1 / -1' }}>
          <div style={head}><span style={cap}>토스트 — 성공 / 오류 / 정보</span></div>
          <div style={{ padding: 28, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', minHeight: 120 }}>
            <Button size="small" variant="outlined" color="assistive" onClick={() => setToast({ msg: '고객 링크가 복사되었습니다', tone: 'success' })}>성공 토스트</Button>
            <Button size="small" variant="outlined" color="assistive" onClick={() => setToast({ msg: '복사에 실패했어요. 다시 시도해 주세요', tone: 'error' })}>오류 토스트</Button>
            <Button size="small" variant="outlined" color="assistive" onClick={() => setToast({ msg: '고객이 설계안을 열람했습니다', tone: 'info' })}>정보 토스트</Button>
            <span style={{ fontSize: 13, color: 'var(--semantic-label-alternative)' }}>버튼을 눌러 토스트를 확인하세요</span>
          </div>
          {toast && <ToastAuto {...toast} onDone={() => setToast(null)} />}
        </div>
      </div>
    </div>
  );
}

// Toast that auto-dismisses
export function ToastAuto({ msg, tone, onDone, bottom = 24 }) {
  useE(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, [msg]);
  return <Toast msg={msg} tone={tone} bottom={bottom} />;
}
