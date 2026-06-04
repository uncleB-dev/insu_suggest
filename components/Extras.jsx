'use client';
/* Shared building blocks for the 보장 설계 시뮬레이터, on top of the WDS Primitives. */

import React, { useState, useEffect, useRef } from 'react';
import { D } from '@/lib/data';
import { Icon, Badge } from './Primitives';

const useS = useState, useE = useEffect, useR = useRef;

export const SERVICE_NAME = '보장 설계 시뮬레이터';

// Brand lockup — Wanted signature gradient symbol + service name
export function Logo({ size = 28, color = 'var(--semantic-label-normal)', sub }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: size, height: size, borderRadius: size * 0.32,
        background: 'var(--brand-gradient-deep)',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)', flexShrink: 0,
      }} />
      <div style={{ lineHeight: 1.1 }}>
        <div style={{ fontSize: size * 0.62, fontWeight: 700, letterSpacing: '-0.02em', color }}>{SERVICE_NAME}</div>
        {sub && <div style={{ fontSize: size * 0.42, fontWeight: 500, color: 'var(--semantic-label-alternative)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// Status badge for plans: sent / viewed / saved
export const STATUS_META = {
  sent:   { label: '발송', tone: 'neutral' },
  viewed: { label: '열람', tone: 'blue' },
  saved:  { label: '저장됨', tone: 'green' },
};
export function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.sent;
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

// Inline limit / caution note (shown when a customer raises an amount above base)
export function LimitNote({ children, tone = 'orange' }) {
  const c = tone === 'orange'
    ? { bg: 'rgba(255,146,0,0.10)', fg: 'var(--atomic-orange-39)', ring: 'rgba(255,146,0,0.22)' }
    : { bg: 'rgba(255,66,66,0.08)', fg: 'var(--atomic-red-40)', ring: 'rgba(255,66,66,0.20)' };
  return (
    <div style={{
      display: 'flex', gap: 7, alignItems: 'flex-start',
      background: c.bg, color: c.fg, boxShadow: `inset 0 0 0 1px ${c.ring}`,
      borderRadius: 8, padding: '8px 10px', fontSize: 12.5, lineHeight: '18px', fontWeight: 500,
    }}>
      <svg viewBox="0 0 24 24" width={15} height={15} style={{ flexShrink: 0, marginTop: 1.5 }} fill="currentColor">
        <path d="M12 2.4a9.6 9.6 0 100 19.2 9.6 9.6 0 000-19.2zM11 7.5a1 1 0 112 0v5a1 1 0 11-2 0v-5zm1 8.2a1.15 1.15 0 110 2.3 1.15 1.15 0 010-2.3z"/>
      </svg>
      <span style={{ textWrap: 'pretty' }}>{children}</span>
    </div>
  );
}

// Amount stepper field — − [input] + with unit suffix
export function AmountField({ value, min, max, step, unitLabel = '만원', onChange, disabled, width = 150 }) {
  const [focus, setFocus] = useS(false);
  const clamp = (v) => Math.max(min, Math.min(max, v));
  const round = (v) => clamp(Math.round(v / step) * step);
  const ring = disabled
    ? 'inset 0 0 0 1px var(--semantic-line-normal-alternative)'
    : focus ? 'inset 0 0 0 2px rgba(0,102,255,0.43)' : 'inset 0 0 0 1px var(--semantic-line-normal-neutral)';
  const btn = (dir) => (
    <button disabled={disabled} onClick={() => onChange(round(value + dir * step))} style={{
      width: 30, height: '100%', border: 'none', background: 'transparent', cursor: disabled ? 'default' : 'pointer',
      color: disabled ? 'var(--semantic-label-disable)' : 'var(--semantic-label-alternative)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon name={dir > 0 ? 'plus' : 'minus'} size={15} />
    </button>
  );
  return (
    <div style={{
      display: 'flex', alignItems: 'center', height: 36, width, borderRadius: 8,
      boxShadow: ring, background: disabled ? 'var(--semantic-fill-alternative)' : 'var(--semantic-background-normal-normal)',
      transition: 'box-shadow .15s ease', overflow: 'hidden', flexShrink: 0,
    }}>
      {btn(-1)}
      <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 3, minWidth: 0 }}>
        <input
          inputMode="numeric" disabled={disabled}
          value={value == null ? '' : value.toLocaleString('ko-KR')}
          onChange={e => { const n = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10); onChange(isNaN(n) ? min : clamp(n)); }}
          onFocus={() => setFocus(true)}
          onBlur={() => { setFocus(false); onChange(round(value)); }}
          style={{
            width: '100%', textAlign: 'right', border: 'none', outline: 'none', background: 'transparent',
            fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
            color: disabled ? 'var(--semantic-label-assistive)' : 'var(--semantic-label-normal)',
            padding: 0, caretColor: 'var(--semantic-primary-normal)',
          }}
        />
        <span style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--semantic-label-alternative)', whiteSpace: 'nowrap' }}>{unitLabel}</span>
      </div>
      {btn(1)}
    </div>
  );
}

export function Stat({ value, label, accent }) {
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ fontSize: 19, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: accent || 'var(--semantic-label-normal)', letterSpacing: '-0.01em' }}>{value}</div>
      <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--semantic-label-alternative)', marginTop: 3 }}>{label}</div>
    </div>
  );
}

export function Spinner({ size = 18, color = '#fff', stroke = 2.5 }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%', display: 'inline-block',
      border: `${stroke}px solid ${color === '#fff' ? 'rgba(255,255,255,0.35)' : 'var(--semantic-fill-strong)'}`,
      borderTopColor: color, animation: 'spin 0.7s linear infinite', flexShrink: 0,
    }} />
  );
}

// Toast — single message, auto-dismiss handled by caller
export function Toast({ msg, tone = 'success', bottom = 24 }) {
  if (!msg) return null;
  const meta = {
    success: { icon: 'check', bg: 'var(--semantic-inverse-background)', fg: '#fff', ic: 'var(--atomic-green-60)' },
    error:   { icon: 'close', bg: 'var(--semantic-inverse-background)', fg: '#fff', ic: 'var(--atomic-red-60)' },
    info:    { icon: 'bell',  bg: 'var(--semantic-inverse-background)', fg: '#fff', ic: 'var(--atomic-blue-60)' },
  }[tone];
  return (
    <div style={{
      position: 'absolute', left: '50%', bottom, transform: 'translateX(-50%)', zIndex: 60,
      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 16px', borderRadius: 12,
      background: meta.bg, color: meta.fg, boxShadow: 'var(--semantic-shadow-large)',
      fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', animation: 'toastIn .25s ease',
    }}>
      <Icon name={meta.icon} size={17} color={meta.ic} />
      {msg}
    </div>
  );
}

// Phone frame for mobile-first customer screens
export function PhoneFrame({ children, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 390, height: 800, borderRadius: 44, background: '#0b0c0e',
        padding: 11, boxShadow: '0 30px 70px -20px rgba(20,30,60,0.35), 0 8px 24px -8px rgba(20,30,60,0.20)',
        flexShrink: 0, position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)',
          width: 116, height: 30, background: '#0b0c0e', borderRadius: 999, zIndex: 40,
        }} />
        <div data-screen-label={label} style={{
          width: '100%', height: '100%', borderRadius: 34, overflow: 'hidden',
          background: 'var(--semantic-background-normal-normal)', position: 'relative',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Mobile status bar (inside the phone) — subtle, brand-neutral
export function PhoneStatusBar({ dark }) {
  const c = dark ? '#fff' : 'var(--semantic-label-normal)';
  return (
    <div style={{
      height: 46, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      padding: '0 26px 6px', flexShrink: 0, position: 'sticky', top: 0, zIndex: 5, pointerEvents: 'none',
    }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: c, fontVariantNumeric: 'tabular-nums' }}>9:41</span>
      <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center', color: c }}>
        <svg width="17" height="11" viewBox="0 0 17 11" fill={c}><rect x="0" y="6" width="3" height="5" rx="1"/><rect x="4.5" y="4" width="3" height="7" rx="1"/><rect x="9" y="2" width="3" height="9" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg>
        <svg width="22" height="11" viewBox="0 0 22 11" fill="none"><rect x="0.6" y="0.6" width="18" height="9.8" rx="2.6" stroke={c} strokeOpacity="0.4" strokeWidth="1"/><rect x="2" y="2" width="14" height="7" rx="1.5" fill={c}/><rect x="19.6" y="3.6" width="1.6" height="3.8" rx="0.8" fill={c} fillOpacity="0.5"/></svg>
      </span>
    </div>
  );
}

export function SectionTitle({ children, sub, style }) {
  return (
    <div style={{ ...style }}>
      <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>{children}</div>
      {sub && <div style={{ fontSize: 13, color: 'var(--semantic-label-alternative)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// 설계사 코멘트 카드 — 고객 화면(6·7)의 잘 보이는 위치에 노출
export function AgentComment({ text, name, style, tone = 'tint' }) {
  if (!text) return null;
  const init = (name || D.PLAN_AGENT_NAME || '설계사').slice(0, 2);
  const box = tone === 'tint'
    ? { background: 'rgba(0,102,255,0.045)', boxShadow: 'inset 0 0 0 1px rgba(0,102,255,0.16)' }
    : { background: '#fff', boxShadow: 'var(--semantic-shadow-xsmall), inset 0 0 0 1px var(--semantic-line-normal-neutral)' };
  return (
    <div style={{ display: 'flex', gap: 12, padding: '15px 16px', borderRadius: 14, ...box, ...style }}>
      <div style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--brand-gradient-deep)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13.5, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)' }}>{init}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          <Icon name="bubble-fill" size={14} color="var(--semantic-primary-normal)" />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--semantic-primary-strong)' }}>담당 설계사 {name || D.PLAN_AGENT_NAME} 메시지</span>
        </div>
        <div style={{ fontSize: 13.5, lineHeight: '21px', color: 'var(--semantic-label-normal)', textWrap: 'pretty' }}>{text}</div>
      </div>
    </div>
  );
}
