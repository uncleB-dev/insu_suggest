'use client';
/* 화면 6 (데스크탑) — 2단 레이아웃: 본문 + 우측 고정 요약. */

import React, { useState } from 'react';
import { D } from '@/lib/data';
import { Button, Icon, Divider } from './Primitives';
import { Stat, AgentComment, SERVICE_NAME } from './Extras';
import { usePlanner, CategoryTabs, CategorySection, MemoBox, ComplianceFooter, ProgressVsBase, DiffPill, DiscountBox } from './PlannerCore';
import { LockIcon } from './CustomerScreens';
import { ToastAuto } from './CommonStates';

const useS = useState;

export function PlannerDesktop({ toast, setToast }) {
  const P = usePlanner();
  const [memo, setMemo] = useS('');
  const [tab, setTab] = useS('all');
  const [modal, setModal] = useS(false);
  const C = D.PLAN_CUSTOMER;
  const cats = tab === 'all' ? D.PLAN_CATEGORIES : D.PLAN_CATEGORIES.filter(c => c.key === tab);

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(120deg, #005EEB 0%, #2F86FF 100%)', color: '#fff' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '26px 32px 30px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.85 }}>{SERVICE_NAME}</div>
          <h1 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>{C.maskedName}님 맞춤 보장 설계</h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 14 }}>
            {[`${C.age}세 ${C.gender}`, `${C.maturity} · ${C.payTerm}`, C.injuryGrade, C.product].map(t => (
              <span key={t} style={{ fontSize: 12.5, fontWeight: 600, padding: '5px 11px', borderRadius: 999, background: 'rgba(255,255,255,0.18)' }}>{t}</span>
            ))}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 500, opacity: 0.82, marginLeft: 4 }}>
              <LockIcon size={13} /> 주민번호·병력 등 민감정보는 표시하지 않아요
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '20px 32px 0' }}>
        <AgentComment text={D.PLAN_AGENT_COMMENT} />
      </div>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '16px 32px 64px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'start' }}>
        <div>
          <div style={{ marginBottom: 16 }}><CategoryTabs active={tab} onChange={setTab} P={P} /></div>
          {cats.map(cat => (
            <CategorySection key={cat.key} cat={cat} rows={P.items.filter(c => c.cat === cat.key)} P={P} />
          ))}
          <div style={{ marginTop: 8, marginBottom: 16 }}><MemoBox value={memo} onChange={setMemo} /></div>
          <ComplianceFooter />
        </div>

        {/* Sticky summary */}
        <div style={{ position: 'sticky', top: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 20, boxShadow: 'var(--semantic-shadow-small), inset 0 0 0 1px var(--semantic-line-normal-neutral)' }}>
            <div style={{ fontSize: 12.5, color: 'var(--semantic-label-alternative)', fontWeight: 600 }}>월 예상 보험료 <span style={{ fontWeight: 500 }}>(참고)</span></div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '4px 0 12px' }}>
              <span style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{D.fmtWon(P.total)}</span>
              <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--semantic-label-neutral)' }}>원</span>
            </div>
            <ProgressVsBase P={P} />
            <div style={{ marginTop: 14 }}><DiffPill P={P} /></div>
            <div style={{ marginTop: 14 }}><DiscountBox P={P} /></div>
            <div style={{ display: 'flex', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--semantic-line-solid-neutral)' }}>
              <Stat value={P.selectedCount} label="선택 보장" />
              <Divider vertical />
              <Stat value={P.excludedCount} label="제외" />
              <Divider vertical />
              <Stat value={`${D.fmtWon(P.total * 12)}`} label="연 보험료(원)" />
            </div>
            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: 'var(--semantic-background-normal-alternative)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12.5, color: 'var(--semantic-label-alternative)' }}>20년 총 납입 예상</span>
              <span style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{D.fmtWon(P.total * 12 * 20)}원</span>
            </div>
            <div style={{ marginTop: 16 }}>
              <Button size="large" fullWidth onClick={() => setModal(true)}>저장하기</Button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 12, background: 'rgba(0,102,255,0.05)', boxShadow: 'inset 0 0 0 1px rgba(0,102,255,0.14)' }}>
            <Icon name="bulb" size={16} color="var(--semantic-primary-normal)" style={{ marginTop: 1, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, lineHeight: '18px', color: 'var(--semantic-label-neutral)', textWrap: 'pretty' }}>조정 후 저장하면 설계사가 내용을 확인하고 상담을 도와드려요.</span>
          </div>
        </div>
      </div>

      {modal && <CenterModal P={P} memo={memo} onClose={() => setModal(false)} onConfirm={() => { setModal(false); setToast({ msg: '저장되었습니다', tone: 'success' }); }} />}
      {toast && <ToastAuto {...toast} onDone={() => setToast(null)} />}
    </div>
  );
}

// Centered confirm modal (desktop)
export function CenterModal({ P, memo, onClose, onConfirm }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'var(--semantic-material-dimmer)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'fadeIn .2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 420, maxWidth: '100%', background: '#fff', borderRadius: 20, padding: 24, boxShadow: 'var(--semantic-shadow-large)', animation: 'pop .25s cubic-bezier(.2,.8,.2,1)' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>이대로 저장할까요?</h3>
        <p style={{ margin: '0 0 18px', fontSize: 14, color: 'var(--semantic-label-alternative)' }}>설계사가 조정 내용을 확인한 뒤 연락드려요.</p>
        <div style={{ borderRadius: 12, background: 'var(--semantic-background-normal-alternative)', padding: 16, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          <CMRow k="선택 보장" v={`${P.selectedCount}개 (제외 ${P.excludedCount})`} />
          <CMRow k="월 예상 보험료" v={`${D.fmtWon(P.total)}원`} strong />
          <CMRow k="원안 대비" v={P.diff === 0 ? '동일' : (P.diff > 0 ? `+${D.fmtWon(P.diff)}원` : `−${D.fmtWon(Math.abs(P.diff))}원`)} tone={P.diff > 0 ? 'red' : P.diff < 0 ? 'green' : null} />
          <CMRow k="요청사항" v={memo.trim() ? '작성함' : '없음'} />
        </div>
        <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', fontSize: 12, lineHeight: '18px', color: 'var(--semantic-label-alternative)', marginBottom: 18 }}>
          <Icon name="bulb" size={15} style={{ marginTop: 1, flexShrink: 0 }} />
          <span style={{ textWrap: 'pretty' }}>참고 금액이며 실제 가입 금액은 심사 후 확정됩니다.</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="outlined" color="assistive" size="large" fullWidth onClick={onClose}>수정 더하기</Button>
          <Button size="large" fullWidth onClick={onConfirm}>이대로 저장</Button>
        </div>
      </div>
    </div>
  );
}
function CMRow({ k, v, strong, tone }) {
  const c = tone === 'red' ? 'var(--atomic-red-40)' : tone === 'green' ? 'var(--atomic-green-40)' : 'var(--semantic-label-normal)';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontSize: 13.5, color: 'var(--semantic-label-alternative)' }}>{k}</span>
      <span style={{ fontSize: strong ? 17 : 14, fontWeight: strong ? 800 : 600, color: c, fontVariantNumeric: 'tabular-nums' }}>{v}</span>
    </div>
  );
}
