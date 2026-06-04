'use client';
/* 화면 4 — 설계안 상세 (원안 vs 고객안 비교). 데스크탑. */

import React, { useState } from 'react';
import { D } from '@/lib/data';
import { Icon, Divider, Button, Switch, Badge } from './Primitives';
import { StatusBadge, SectionTitle } from './Extras';
import { ExplanationPanel } from './PlannerCore';
import { AdminTopNav } from './AdminScreens';

const useS = useState;

// Comparison dataset for plan p1 (원안 = 전담보 base ON, 고객안 = 고객 조정안)
const CMP_ROWS = [
  { id: 'c1', name: '암진단비 (유사암 제외)', cat: '암', baseA: '5,000만원', baseP: 15000, custA: '7,000만원', custP: 21000, change: 'up' },
  { id: 'c2', name: '유사암진단비', cat: '암', baseA: '1,000만원', baseP: 1500, custA: '1,000만원', custP: 1500, change: 'keep' },
  { id: 'c3', name: '암수술비', cat: '암', baseA: '300만원', baseP: 1500, custA: '300만원', custP: 1500, change: 'keep' },
  { id: 'c4', name: '뇌혈관질환 진단비', cat: '뇌·심장', baseA: '2,000만원', baseP: 4000, custA: '2,000만원', custP: 4000, change: 'keep' },
  { id: 'c5', name: '허혈성심장질환 진단비', cat: '뇌·심장', baseA: '2,000만원', baseP: 3600, custA: '1,000만원', custP: 1800, change: 'down' },
  { id: 'c6', name: '상해후유장해 (3~100%)', cat: '상해', baseA: '1억원', baseP: 3000, custA: '1억원', custP: 3000, change: 'keep' },
  { id: 'c7', name: '상해사망', cat: '상해', baseA: '5,000만원', baseP: 1000, custA: '5,000만원', custP: 1000, change: 'keep' },
  { id: 'c8', name: '골절 진단비', cat: '상해', baseA: '30만원', baseP: 900, custA: '30만원', custP: 900, change: 'keep' },
  { id: 'c9', name: '질병수술비 (1~5종)', cat: '질병', baseA: '200만원', baseP: 1600, custA: '200만원', custP: 1600, change: 'keep' },
  { id: 'c10', name: '16대 질병 진단비', cat: '질병', baseA: '1,000만원', baseP: 4000, custA: '제외', custP: 0, change: 'exclude' },
  { id: 'c11', name: '질병입원일당', cat: '입원', baseA: '3만원/일', baseP: 4500, custA: '3만원/일', custP: 4500, change: 'keep' },
  { id: 'c12', name: '상해입원일당', cat: '입원', baseA: '3만원/일', baseP: 3000, custA: '제외', custP: 0, change: 'exclude' },
  { id: 'c13', name: '보험료 납입면제', cat: '납입면제', baseA: '—', baseP: 1200, custA: '—', custP: 1200, change: 'keep' },
];

const CHANGE_META = {
  keep:    { label: '유지', tone: 'neutral' },
  exclude: { label: '제외', tone: 'red' },
  up:      { label: '금액 ↑', tone: 'redfill' },
  down:    { label: '금액 ↓', tone: 'greenfill' },
};
export function ChangeBadge({ change }) {
  const m = CHANGE_META[change];
  const map = {
    neutral:  { bg: 'var(--semantic-fill-alternative)', fg: 'var(--semantic-label-neutral)' },
    red:      { bg: 'var(--semantic-fill-alternative)', fg: 'var(--semantic-label-alternative)' },
    redfill:  { bg: 'rgba(255,66,66,0.10)', fg: 'var(--atomic-red-40)' },
    greenfill:{ bg: 'rgba(0,191,64,0.12)', fg: 'var(--atomic-green-40)' },
  }[m.tone];
  return <span style={{ display: 'inline-flex', padding: '3px 9px', borderRadius: 6, fontSize: 11.5, fontWeight: 700, background: map.bg, color: map.fg, whiteSpace: 'nowrap' }}>{m.label}</span>;
}

const DEFAULT_MEMO = '암 보장은 좀 더 키우고 싶고, 입원 일당이랑 16대 질병은 일단 빼주세요. 월 보험료는 4만 2천원 정도면 좋겠어요.';
const DEFAULT_HISTORY = [
  { t: '2시간 전', d: '2026.05.28 14:20', p: 42000, latest: true },
  { t: '어제', d: '2026.05.27 21:08', p: 44200, latest: false },
];

export function DetailScreen({ onBack, onNew, setToast, label = '김OO 13세 어린이', status = 'saved',
  cmpRows = CMP_ROWS, memo = DEFAULT_MEMO, history = DEFAULT_HISTORY, coverageMap,
  onLogout, advisorName, advisorEmail }) {
  const [onlyChanged, setOnlyChanged] = useS(false);
  const [openRows, setOpenRows] = useS(() => new Set());
  const toggleRow = (id) => setOpenRows(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const baseTotal = cmpRows.reduce((s, r) => s + r.baseP, 0);
  const custTotal = cmpRows.reduce((s, r) => s + r.custP, 0);
  const diff = custTotal - baseTotal;
  const diffPct = baseTotal ? ((diff / baseTotal) * 100).toFixed(1) : '0.0';
  const rows = onlyChanged ? cmpRows.filter(r => r.change !== 'keep') : cmpRows;
  const covLookup = (id) => (coverageMap ? coverageMap[id] : (D.PLAN_COVERAGES.find(c => c.id === id))) || {};
  const hasMemo = memo && String(memo).trim().length > 0;

  return (
    <div>
      <AdminTopNav onNew={onNew} onHome={onBack} onLogout={onLogout} advisorName={advisorName} advisorEmail={advisorEmail} />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '22px 28px 64px' }}>
        {/* Breadcrumb / header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: 'var(--semantic-label-alternative)', padding: 0 }}>
              <Icon name="arrow-left" size={16} /> 목록으로
            </button>
            <Divider vertical style={{ height: 16 }} />
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>{label}</h1>
            <StatusBadge status={status} />
          </div>
          <Button size="small" variant="outlined" color="assistive" leadingContent={<Icon name="share" size={15} />} onClick={() => setToast({ msg: '고객 링크가 복사되었습니다', tone: 'success' })}>URL 복사</Button>
        </div>

        {/* Premium comparison card */}
        <div style={{ background: '#fff', borderRadius: 18, padding: 24, boxShadow: 'var(--semantic-shadow-xsmall), inset 0 0 0 1px var(--semantic-line-normal-neutral)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <CompareCol label="원안" value={baseTotal} muted />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <Icon name="arrow-right" size={22} color="var(--semantic-label-assistive)" />
              <span style={{ fontSize: 13, fontWeight: 800, padding: '4px 10px', borderRadius: 999, background: diff > 0 ? 'rgba(255,66,66,0.10)' : 'rgba(0,191,64,0.12)', color: diff > 0 ? 'var(--atomic-red-40)' : 'var(--atomic-green-40)', whiteSpace: 'nowrap' }}>
                {diff > 0 ? '+' : '−'}{D.fmtWon(Math.abs(diff))}원 ({diff > 0 ? '+' : ''}{diffPct}%)
              </span>
            </div>
            <CompareCol label="고객안" value={custTotal} accent />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--semantic-line-solid-neutral)' }}>
            <MiniCompare label="연 보험료" base={baseTotal * 12} cust={custTotal * 12} />
            <Divider vertical />
            <MiniCompare label="20년 총 납입" base={baseTotal * 240} cust={custTotal * 240} />
          </div>
        </div>

        {/* Customer memo */}
        <div style={{ background: 'rgba(0,102,255,0.05)', borderRadius: 14, padding: 16, boxShadow: 'inset 0 0 0 1px rgba(0,102,255,0.16)', marginBottom: 16, display: 'flex', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(0,102,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="bubble" size={17} color="var(--semantic-primary-normal)" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--semantic-primary-strong)', marginBottom: 3 }}>고객 요청사항</div>
            <div style={{ fontSize: 14, lineHeight: '22px', color: hasMemo ? 'var(--semantic-label-normal)' : 'var(--semantic-label-assistive)', textWrap: 'pretty' }}>{hasMemo ? `“${memo}”` : '남긴 요청사항이 없습니다'}</div>
          </div>
        </div>

        {/* Coverage comparison table */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <SectionTitle>담보 비교</SectionTitle>
          <button onClick={() => setOnlyChanged(o => !o)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--semantic-label-neutral)' }}>
            변경된 담보만 <Switch checked={onlyChanged} onChange={setOnlyChanged} />
          </button>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: 'var(--semantic-shadow-xsmall), inset 0 0 0 1px var(--semantic-line-normal-neutral)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr 1.3fr 0.9fr', gap: 12, padding: '11px 20px', borderBottom: '1px solid var(--semantic-line-solid-neutral)', fontSize: 12, fontWeight: 600, color: 'var(--semantic-label-alternative)' }}>
            <span>담보명</span><span style={{ textAlign: 'right' }}>원안</span><span style={{ textAlign: 'right' }}>고객안</span><span style={{ textAlign: 'center' }}>변경</span>
          </div>
          {rows.map((r, i) => {
            const ex = r.change === 'exclude';
            const cov = covLookup(r.id);
            const open = openRows.has(r.id);
            return (
              <div key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--semantic-line-solid-neutral)' : 'none' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr 1.3fr 0.9fr', gap: 12, padding: '12px 20px', alignItems: 'center', background: r.change !== 'keep' && !ex ? 'rgba(0,102,255,0.02)' : 'transparent' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, opacity: ex ? 0.45 : 1, textDecoration: ex ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                      <span style={{ fontSize: 11, color: 'var(--semantic-label-assistive)' }}>{r.cat}</span>
                      <button onClick={() => toggleRow(r.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, fontSize: 11.5, fontWeight: 700, color: open ? 'var(--semantic-primary-normal)' : 'var(--semantic-label-alternative)' }}>
                        {open ? '닫기' : '설명'}
                        <Icon name="arrow-down" size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s ease' }} />
                      </button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', opacity: ex ? 0.45 : 1 }}>
                    <div style={{ fontSize: 12.5, color: 'var(--semantic-label-alternative)' }}>{r.baseA}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{D.fmtWon(r.baseP)}원</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12.5, color: ex ? 'var(--atomic-red-40)' : 'var(--semantic-label-alternative)' }}>{r.custA}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: ex ? 'var(--semantic-label-assistive)' : 'var(--semantic-label-normal)' }}>{D.fmtWon(r.custP)}원</div>
                  </div>
                  <div style={{ textAlign: 'center' }}><ChangeBadge change={r.change} /></div>
                </div>
                {open && <div style={{ padding: '0 20px 14px' }}><ExplanationPanel why={cov.why} how={cov.how} /></div>}
              </div>
            );
          })}
          {/* Totals */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr 1.3fr 0.9fr', gap: 12, padding: '14px 20px', alignItems: 'center', background: 'var(--semantic-background-normal-alternative)', borderTop: '1px solid var(--semantic-line-solid-normal)' }}>
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>합계 (월)</span>
            <span style={{ textAlign: 'right', fontSize: 14, fontWeight: 700, color: 'var(--semantic-label-alternative)', fontVariantNumeric: 'tabular-nums' }}>{D.fmtWon(baseTotal)}원</span>
            <span style={{ textAlign: 'right', fontSize: 15, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{D.fmtWon(custTotal)}원</span>
            <span style={{ textAlign: 'center' }}><span style={{ fontSize: 11.5, fontWeight: 700, color: diff > 0 ? 'var(--atomic-red-40)' : 'var(--atomic-green-40)' }}>{diff > 0 ? '▲' : '▼'}{D.fmtWon(Math.abs(diff))}</span></span>
          </div>
        </div>

        {/* Save history timeline */}
        <SectionTitle style={{ margin: '24px 0 10px' }}>저장 이력</SectionTitle>
        <div style={{ background: '#fff', borderRadius: 16, padding: '8px 20px', boxShadow: 'var(--semantic-shadow-xsmall), inset 0 0 0 1px var(--semantic-line-normal-neutral)' }}>
          {history.map((h, i, arr) => (
            <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--semantic-line-solid-neutral)' : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ width: 11, height: 11, borderRadius: 999, background: h.latest ? 'var(--semantic-primary-normal)' : 'var(--semantic-line-normal-normal)', marginTop: 4 }} />
                {i < arr.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--semantic-line-solid-neutral)', marginTop: 4 }} />}
              </div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700 }}>{h.t} 저장</span>
                    {h.latest && <Badge tone="blue">최신</Badge>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--semantic-label-alternative)', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{h.d}</div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>월 {D.fmtWon(h.p)}원</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CompareCol({ label, value, muted, accent }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: accent ? 'var(--semantic-primary-normal)' : 'var(--semantic-label-alternative)', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 3 }}>
        <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color: muted ? 'var(--semantic-label-neutral)' : accent ? 'var(--semantic-primary-normal)' : 'var(--semantic-label-normal)' }}>{D.fmtWon(value)}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--semantic-label-alternative)' }}>원</span>
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--semantic-label-assistive)', marginTop: 2 }}>월 · 참고</div>
    </div>
  );
}

function MiniCompare({ label, base, cust }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12, color: 'var(--semantic-label-alternative)', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 13, color: 'var(--semantic-label-alternative)', textDecoration: 'line-through', fontVariantNumeric: 'tabular-nums' }}>{D.fmtWon(base)}원</span>
        <Icon name="arrow-right" size={13} color="var(--semantic-label-assistive)" />
        <span style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{D.fmtWon(cust)}원</span>
      </div>
    </div>
  );
}
