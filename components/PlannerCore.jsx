'use client';
/* Shared planner logic + pieces for 화면 6 (고객 설계 페이지). Used by mobile flow & desktop. */

import React, { useState, useRef } from 'react';
import { D } from '@/lib/data';
import { Switch, Badge, Icon, Button } from './Primitives';
import { AmountField, LimitNote } from './Extras';

const useS = useState, useR = useRef;

export function usePlanner(coverages = D.PLAN_COVERAGES, discountRate = D.PLAN_DISCOUNT_RATE) {
  const [items, setItems] = useS(() => coverages.map(c => ({ ...c })));
  const premiumOf = (c) => !c.on ? 0 : (c.fixedPremium != null ? c.fixedPremium : Math.round(c.amount * c.unit));
  const total = items.reduce((s, c) => s + premiumOf(c), 0);
  const baseRef = useR(coverages.reduce((s, c) => s + (c.on ? (c.fixedPremium != null ? c.fixedPremium : Math.round(c.base * c.unit)) : 0), 0));
  const base = baseRef.current;
  const rate = discountRate;
  const general = Math.round(total / (1 - rate));
  const savings = general - total;
  const savingsPct = Math.round((savings / general) * 100);
  const selectedCount = items.filter(c => c.on).length;
  const excludedCount = items.filter(c => !c.on).length;
  const diff = total - base;

  const setAmount = (id, amount) => setItems(prev => prev.map(c => c.id === id ? { ...c, amount } : c));
  const toggle = (id) => setItems(prev => prev.map(c => (c.id === id && !c.required) ? { ...c, on: !c.on } : c));
  return { items, premiumOf, total, base, general, savings, savingsPct, selectedCount, excludedCount, diff, setAmount, toggle, rate };
}

export function CoverageRow({ c, premium, onToggle, onAmount, dense }) {
  const [open, setOpen] = useS(false);
  const off = !c.on;
  const overBase = c.on && c.amount != null && c.amount > c.base && c.limitNote;
  return (
    <div style={{
      borderRadius: 12, background: '#fff',
      boxShadow: off ? 'inset 0 0 0 1px var(--semantic-line-normal-alternative)' : 'inset 0 0 0 1px var(--semantic-line-normal-neutral)',
      padding: dense ? '9px 11px' : '11px 13px', transition: 'box-shadow .2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ opacity: c.required ? 0.55 : 1, pointerEvents: c.required ? 'none' : 'auto', flexShrink: 0 }}>
          <Switch checked={c.on} onChange={onToggle} />
        </div>
        <div style={{ flex: '1 1 130px', minWidth: 0, opacity: off ? 0.5 : 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
            {c.required && <Badge tone="neutral">필수</Badge>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          {c.amount != null ? (
            <AmountField value={c.amount} min={c.min} max={c.max} step={c.step} unitLabel={c.unitLabel || '만원'} onChange={onAmount} disabled={off} width={132} />
          ) : (
            <span style={{ fontSize: 12, color: 'var(--semantic-label-alternative)', width: 132, textAlign: 'center' }}>금액 해당 없음</span>
          )}
          <div style={{ width: 86, textAlign: 'right', flexShrink: 0 }}>
            <span style={{ fontSize: 15, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: off ? 'var(--semantic-label-assistive)' : 'var(--semantic-label-normal)' }}>
              {D.fmtWon(premium)}
            </span>
            <span style={{ fontSize: 11, color: 'var(--semantic-label-alternative)', marginLeft: 2 }}>원</span>
          </div>
          <button onClick={() => setOpen(o => !o)} style={{
            height: 32, padding: '0 13px', borderRadius: 8, border: 'none', flexShrink: 0, cursor: 'pointer',
            fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: open ? 'var(--semantic-primary-normal)' : '#fff',
            color: open ? '#fff' : 'var(--semantic-primary-normal)',
            boxShadow: open ? 'none' : 'inset 0 0 0 1px rgba(0,102,255,0.36)',
            transition: 'background .2s ease, color .2s ease, box-shadow .2s ease',
          }}>
            {open ? '닫기' : '설명'}
          </button>
        </div>
      </div>

      {/* 가입 한도 안내 — 경고 톤, 금액칸 바로 아래 (설명 패널과 구분) */}
      {overBase && <div style={{ marginTop: 9 }}><LimitNote tone="red">{c.limitNote}</LimitNote></div>}

      {/* 보장 설명 패널 — 정보 톤, 차분한 박스 + 역할별 색상 태그 */}
      {open && <ExplanationPanel why={c.why} how={c.how} />}
    </div>
  );
}

export function ExplanationPanel({ why, how, animate = true }) {
  return (
    <div style={{ marginTop: 11, overflow: 'hidden', animation: animate ? 'panelDown .18s ease' : 'none' }}>
      <div style={{ background: 'var(--semantic-background-normal-alternative)', borderRadius: 9, padding: 13, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <ExplainBlock tone="orange" label="왜 필요한가요?" body={why} />
        <ExplainBlock tone="green" label="어떻게 받나요?" body={how} />
      </div>
    </div>
  );
}

export function ExplainBlock({ tone, label, body }) {
  const t = tone === 'orange'
    ? { bg: 'rgba(255,146,0,0.14)', fg: 'var(--atomic-orange-39)' }
    : { bg: 'rgba(0,191,64,0.14)', fg: 'var(--atomic-green-40)' };
  return (
    <div>
      <span style={{ display: 'inline-flex', padding: '3px 9px', borderRadius: 6, fontSize: 11.5, fontWeight: 700, background: t.bg, color: t.fg }}>{label}</span>
      <div style={{ fontSize: 13, lineHeight: '22px', color: 'var(--semantic-label-neutral)', marginTop: 6, textWrap: 'pretty' }}>{body}</div>
    </div>
  );
}

// Category section: header (selected N/M + subtotal) + rows
export function CategorySection({ cat, rows, P }) {
  const onCount = rows.filter(c => c.on).length;
  const subtotal = rows.reduce((s, c) => s + P.premiumOf(c), 0);
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 2px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{cat.label}</span>
          <span style={{ fontSize: 12, color: 'var(--semantic-label-alternative)', fontVariantNumeric: 'tabular-nums' }}>{onCount}/{rows.length}</span>
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--semantic-label-neutral)', fontVariantNumeric: 'tabular-nums' }}>월 {D.fmtWon(subtotal)}원</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map(c => (
          <CoverageRow key={c.id} c={c} premium={P.premiumOf(c)} onToggle={() => P.toggle(c.id)} onAmount={(v) => P.setAmount(c.id, v)} />
        ))}
      </div>
    </div>
  );
}

export function CategoryTabs({ active, onChange, P }) {
  const tabs = [{ key: 'all', label: '전체' }, ...D.PLAN_CATEGORIES];
  return (
    <div className="scroll" style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4 }}>
      {tabs.map(t => {
        const on = active === t.key;
        return (
          <button key={t.key} onClick={() => onChange(t.key)} style={{
            flexShrink: 0, border: 'none', cursor: 'pointer', padding: '7px 14px', borderRadius: 999,
            fontSize: 13.5, fontWeight: on ? 700 : 500, fontFamily: 'inherit',
            background: on ? 'var(--semantic-primary-normal)' : 'var(--semantic-fill-alternative)',
            color: on ? '#fff' : 'var(--semantic-label-neutral)',
            transition: 'background .2s ease, color .2s ease',
          }}>{t.label}</button>
        );
      })}
    </div>
  );
}

// Health-disclosure savings box
export function DiscountBox({ P }) {
  const [open, setOpen] = useS(false);
  return (
    <div style={{ borderRadius: 14, background: 'rgba(0,191,64,0.07)', boxShadow: 'inset 0 0 0 1px rgba(0,191,64,0.20)', padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--atomic-green-40)' }}>건강고지 할인 효과</span>
        </div>
        <button onClick={() => setOpen(o => !o)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--atomic-green-40)', display: 'inline-flex', alignItems: 'center', gap: 3, padding: 0 }}>
          건강고지란?
          <Icon name="arrow-down" size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s ease' }} />
        </button>
      </div>
      {open && (
        <div style={{ fontSize: 12.5, lineHeight: '19px', color: 'var(--semantic-label-neutral)', marginTop: 8, animation: 'fadeIn .2s ease', textWrap: 'pretty' }}>
          건강고지는 최근 건강 상태를 추가로 알리고 심사를 받는 방식으로, 일반 가입보다 보험료를 낮출 수 있어요. 실제 할인율은 고지 내용과 심사 결과에 따라 달라집니다.
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--semantic-label-alternative)' }}>일반고지</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--semantic-label-alternative)', textDecoration: 'line-through', fontVariantNumeric: 'tabular-nums' }}>{D.fmtWon(P.general)}원</div>
        </div>
        <Icon name="arrow-right" size={16} color="var(--atomic-green-40)" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--atomic-green-40)', fontWeight: 600 }}>건강고지</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--atomic-green-40)', fontVariantNumeric: 'tabular-nums' }}>{D.fmtWon(P.total)}원</div>
        </div>
      </div>
      <div style={{ marginTop: 10, padding: '7px 10px', borderRadius: 8, background: 'rgba(0,191,64,0.12)', fontSize: 12.5, fontWeight: 700, color: 'var(--atomic-green-40)', textAlign: 'center' }}>
        월 {D.fmtWon(P.savings)}원 절감 (−{P.savingsPct}%)
      </div>
    </div>
  );
}

// Premium vs proposal progress bar with proposal marker
export function ProgressVsBase({ P }) {
  const scale = Math.max(P.general, P.base * 1.4);
  const fill = Math.min(100, (P.total / scale) * 100);
  const mark = Math.min(100, (P.base / scale) * 100);
  return (
    <div>
      <div style={{ position: 'relative', height: 8, borderRadius: 999, background: 'var(--semantic-fill-strong)', overflow: 'visible' }}>
        <div style={{ position: 'absolute', inset: 0, width: fill + '%', borderRadius: 999, background: 'var(--semantic-primary-normal)', transition: 'width .3s ease' }} />
        <div style={{ position: 'absolute', top: -3, left: mark + '%', width: 2, height: 14, background: 'var(--semantic-status-negative)', transform: 'translateX(-1px)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--semantic-label-alternative)' }}>
        <span>현재 {D.fmtWon(P.total)}원</span>
        <span style={{ color: 'var(--semantic-status-negative)', fontWeight: 600 }}>원안 {D.fmtWon(P.base)}원</span>
      </div>
    </div>
  );
}

export function DiffPill({ P }) {
  if (P.diff === 0) return <Pill bg="var(--semantic-fill-alternative)" fg="var(--semantic-label-neutral)">원안과 동일</Pill>;
  if (P.diff > 0) return <Pill bg="rgba(255,66,66,0.10)" fg="var(--atomic-red-40)">원안 대비 +{D.fmtWon(P.diff)}원 ▲</Pill>;
  return <Pill bg="rgba(0,191,64,0.12)" fg="var(--atomic-green-40)">원안 대비 −{D.fmtWon(Math.abs(P.diff))}원 ▼</Pill>;
}
export function Pill({ bg, fg, children }) {
  return <div style={{ padding: '7px 12px', borderRadius: 999, background: bg, color: fg, fontSize: 12.5, fontWeight: 700, textAlign: 'center' }}>{children}</div>;
}

export function MemoBox({ value, onChange }) {
  const [focus, setFocus] = useS(false);
  return (
    <div>
      <label style={{ fontSize: 13.5, fontWeight: 700, display: 'block', marginBottom: 8 }}>설계사에게 남길 요청사항 <span style={{ color: 'var(--semantic-label-alternative)', fontWeight: 500 }}>(선택)</span></label>
      <textarea value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        placeholder="예) 암 보장은 더 키우고 싶어요 / 보험료를 6만원 이하로 맞추고 싶어요"
        rows={3} style={{
          width: '100%', resize: 'none', borderRadius: 12, border: 'none', padding: 12, fontSize: 14, lineHeight: '21px',
          background: '#fff', outline: 'none', color: 'var(--semantic-label-normal)',
          boxShadow: focus ? 'inset 0 0 0 2px rgba(0,102,255,0.43)' : 'inset 0 0 0 1px var(--semantic-line-normal-neutral)',
          transition: 'box-shadow .15s ease', fontFamily: 'inherit',
        }} />
    </div>
  );
}

export function ComplianceFooter() {
  return (
    <div style={{ borderRadius: 12, background: 'var(--semantic-background-normal-alternative)', padding: 13, fontSize: 11.5, lineHeight: '17px', color: 'var(--semantic-label-alternative)' }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <span style={{ flexShrink: 0 }}>·</span>
        <span style={{ textWrap: 'pretty' }}>표시된 보험료는 <b style={{ fontWeight: 700, color: 'var(--semantic-label-neutral)' }}>참고 금액</b>이며, 실제 보험료·가입 가능 금액은 나이·성별·병력·심사·업계 한도에 따라 달라질 수 있습니다.</span>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
        <span style={{ flexShrink: 0 }}>·</span>
        <span style={{ textWrap: 'pretty' }}>건강고지 할인은 고지 내용과 심사 결과에 따라 적용 여부·할인율이 달라집니다.</span>
      </div>
    </div>
  );
}

// Save confirmation modal
export function SaveModal({ P, memo, onConfirm, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'var(--semantic-material-dimmer)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', animation: 'fadeIn .2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#fff', borderRadius: '20px 20px 0 0', padding: '20px 20px 24px', animation: 'sheetUp .28s cubic-bezier(.2,.8,.2,1)' }}>
        <div style={{ width: 36, height: 4, borderRadius: 999, background: 'var(--semantic-fill-strong)', margin: '0 auto 16px' }} />
        <h3 style={{ margin: '0 0 4px', fontSize: 19, fontWeight: 700 }}>이대로 저장할까요?</h3>
        <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--semantic-label-alternative)' }}>설계사가 조정 내용을 확인한 뒤 연락드려요.</p>
        <div style={{ borderRadius: 12, background: 'var(--semantic-background-normal-alternative)', padding: 14, display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
          <SummaryRow k="선택 보장" v={`${P.selectedCount}개 (제외 ${P.excludedCount})`} />
          <SummaryRow k="월 예상 보험료" v={`${D.fmtWon(P.total)}원`} strong />
          <SummaryRow k="원안 대비" v={P.diff === 0 ? '동일' : (P.diff > 0 ? `+${D.fmtWon(P.diff)}원` : `−${D.fmtWon(Math.abs(P.diff))}원`)} tone={P.diff > 0 ? 'red' : P.diff < 0 ? 'green' : null} />
          <SummaryRow k="요청사항" v={memo.trim() ? '작성함' : '없음'} />
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', fontSize: 11.5, lineHeight: '17px', color: 'var(--semantic-label-alternative)', marginBottom: 16 }}>
          <Icon name="bulb" size={14} style={{ marginTop: 1, flexShrink: 0 }} />
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
export function SummaryRow({ k, v, strong, tone }) {
  const c = tone === 'red' ? 'var(--atomic-red-40)' : tone === 'green' ? 'var(--atomic-green-40)' : 'var(--semantic-label-normal)';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontSize: 13, color: 'var(--semantic-label-alternative)' }}>{k}</span>
      <span style={{ fontSize: strong ? 16 : 13.5, fontWeight: strong ? 800 : 600, color: c, fontVariantNumeric: 'tabular-nums' }}>{v}</span>
    </div>
  );
}
