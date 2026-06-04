'use client';
/* 고객용 화면 (모바일 우선): 5 인증 게이트 · 6 설계 메인 · 7 저장 완료. */

import React, { useState, useRef } from 'react';
import { D } from '@/lib/data';
import { Icon, Button, Divider } from './Primitives';
import { PhoneStatusBar, Spinner, Stat, SERVICE_NAME, AgentComment } from './Extras';
import { usePlanner, CategoryTabs, CategorySection, ProgressVsBase, DiscountBox, MemoBox, ComplianceFooter, SaveModal } from './PlannerCore';
import { ToastAuto } from './CommonStates';

const useS = useState, useR = useRef;
const CUST = D.PLAN_CUSTOMER;

// ── 화면 5: 인증 게이트 ──
export function GateScreen({ onPass, onVerify, authType, showStatusBar = true }) {
  const auth = D.PLAN_AUTH || { type: 'birth', value: '130506' };
  const isCode = (authType || auth.type) === 'code';
  const [val, setVal] = useS('');
  const [err, setErr] = useS('');
  const [attempts, setAttempts] = useS(0);
  const [loading, setLoading] = useS(false);
  const locked = attempts >= 5;
  const ok = val.length === 6;

  function fail() {
    const a = attempts + 1; setAttempts(a);
    const msg = isCode ? '접속 코드가 일치하지 않습니다.' : '생년월일이 일치하지 않습니다.';
    setErr(a >= 5 ? '시도 횟수를 초과했어요. 잠시 후 다시 시도해 주세요.' : `${msg} (${a}/5)`);
  }

  async function submit() {
    if (!ok || loading || locked) return;
    setLoading(true);
    if (onVerify) {
      const res = await onVerify(val);
      setLoading(false);
      if (res && res.ok) onPass();
      else fail();
      return;
    }
    setTimeout(() => {
      setLoading(false);
      if (val === auth.value) onPass();
      else fail();
    }, 700);
  }

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--semantic-background-normal-normal)' }}>
      {showStatusBar ? <PhoneStatusBar /> : <div style={{ height: 'env(safe-area-inset-top, 12px)', flexShrink: 0 }} />}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 26px 40px' }}>
        <div style={{ width: 56, height: 56, borderRadius: 18, background: 'var(--brand-gradient-deep)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)', marginBottom: 22 }} />
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--semantic-primary-normal)', marginBottom: 6 }}>맞춤 보장 설계안</div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: '32px' }}>본인 확인을 위해<br/>{isCode ? '접속 코드를' : '생년월일을'} 입력해 주세요</h1>
        <p style={{ margin: '10px 0 26px', fontSize: 14, lineHeight: '21px', color: 'var(--semantic-label-alternative)' }}>
          전달받은 링크의 보장 설계안을 확인하려면 본인 확인이 필요해요.
        </p>

        <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--semantic-label-neutral)' }}>{isCode ? '접속 코드 6자리' : '생년월일 6자리 (YYMMDD)'}</label>
        <div style={{ marginTop: 8 }}>
          <CodeInput value={val} onChange={(v) => { setVal(v); setErr(''); }} invalid={!!err} disabled={locked} onEnter={submit} />
        </div>

        <div style={{ minHeight: 22, marginTop: 10 }}>
          {err && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: 'var(--semantic-status-negative)' }}><Icon name="close" size={14} />{err}</div>}
          {!err && !onVerify && <div style={{ fontSize: 12, color: 'var(--semantic-label-assistive)' }}>데모: <b style={{ color: 'var(--semantic-label-alternative)' }}>{auth.value}</b> 입력 시 진입</div>}
        </div>

        <div style={{ marginTop: 16 }}>
          <Button size="large" fullWidth disabled={!ok || loading || locked} onClick={submit}
            leadingContent={loading ? <Spinner size={17} /> : null}>
            {loading ? '확인 중' : '확인하고 보기'}
          </Button>
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginTop: 18, fontSize: 11.5, lineHeight: '17px', color: 'var(--semantic-label-alternative)' }}>
          <LockIcon size={14} />
          <span style={{ textWrap: 'pretty' }}>입력하신 정보는 본인 확인에만 사용되며 저장되지 않습니다.</span>
        </div>
      </div>
    </div>
  );
}

export function CodeInput({ value, onChange, invalid, disabled, onEnter }) {
  const ref = useR(null);
  const cells = Array.from({ length: 6 });
  return (
    <div style={{ position: 'relative' }} onClick={() => ref.current && ref.current.focus()}>
      <input ref={ref} inputMode="numeric" maxLength={6} value={value} disabled={disabled}
        onChange={e => onChange(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
        onKeyDown={e => { if (e.key === 'Enter') onEnter && onEnter(); }}
        style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'text' }} />
      <div style={{ display: 'flex', gap: 8 }}>
        {cells.map((_, i) => {
          const filled = i < value.length;
          const active = i === value.length && !disabled;
          const ring = invalid ? 'inset 0 0 0 2px rgba(255,66,66,0.43)' : active ? 'inset 0 0 0 2px rgba(0,102,255,0.43)' : 'inset 0 0 0 1px var(--semantic-line-normal-neutral)';
          return (
            <div key={i} style={{
              flex: 1, height: 54, borderRadius: 12, background: disabled ? 'var(--semantic-fill-alternative)' : '#fff',
              boxShadow: ring, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, transition: 'box-shadow .15s ease',
            }}>{filled ? '•' : ''}</div>
          );
        })}
      </div>
    </div>
  );
}

export function LockIcon({ size = 14 }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ flexShrink: 0, marginTop: 1 }}><path d="M12 2.5a4.5 4.5 0 00-4.5 4.5v2H7A2.5 2.5 0 004.5 11.5v7A2.5 2.5 0 007 21h10a2.5 2.5 0 002.5-2.5v-7A2.5 2.5 0 0017 9h-.5V7A4.5 4.5 0 0012 2.5zm2.5 6.5h-5V7a2.5 2.5 0 015 0v2z"/></svg>;
}

// ── 화면 6: 설계 메인 (모바일) ──
export function PlannerMobile({ P, memo, setMemo, onSave, customer = CUST, categories = D.PLAN_CATEGORIES, agentComment = D.PLAN_AGENT_COMMENT, showStatusBar = true }) {
  const [tab, setTab] = useS('all');
  const cats = tab === 'all' ? categories : categories.filter(c => c.key === tab);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--semantic-background-normal-alternative)' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, background: 'linear-gradient(135deg, #005EEB 0%, #2F86FF 100%)', color: '#fff', paddingBottom: 16 }}>
        {showStatusBar ? <PhoneStatusBar dark /> : <div style={{ height: 'calc(env(safe-area-inset-top, 0px) + 18px)', flexShrink: 0 }} />}
        <div style={{ padding: '4px 20px 0' }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, opacity: 0.85 }}>{SERVICE_NAME}</div>
          <h1 style={{ margin: '4px 0 0', fontSize: 21, fontWeight: 700, letterSpacing: '-0.02em' }}>{customer.maskedName}님 맞춤 보장 설계</h1>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
            {[`${customer.age}세 ${customer.gender}`, `${customer.maturity}·${customer.payTerm}`, customer.injuryGrade].map(t => (
              <span key={t} style={{ fontSize: 11.5, fontWeight: 600, padding: '4px 9px', borderRadius: 999, background: 'rgba(255,255,255,0.18)' }}>{t}</span>
            ))}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 11, fontSize: 11, fontWeight: 500, opacity: 0.82 }}>
            <LockIcon size={12} /> 주민번호·병력 등 민감정보는 표시하지 않아요
          </div>
        </div>
      </div>

      {/* Scroll body */}
      <div className="scroll" style={{ flex: 1, overflow: 'auto', padding: '14px 14px 14px' }}>
        {/* 설계사 코멘트 */}
        <div style={{ marginBottom: 12 }}><AgentComment text={agentComment} /></div>
        {/* Summary card */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: 'var(--semantic-shadow-xsmall), inset 0 0 0 1px var(--semantic-line-normal-neutral)', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--semantic-label-alternative)', fontWeight: 600 }}>월 예상 보험료 <span style={{ fontWeight: 500 }}>(참고)</span></div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 3 }}>
                <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{D.fmtWon(P.total)}</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--semantic-label-neutral)' }}>원</span>
              </div>
            </div>
            <DiffPillCompact P={P} />
          </div>
          <div style={{ margin: '14px 0' }}><ProgressVsBase P={P} /></div>
          <DiscountBox P={P} />
          <div style={{ display: 'flex', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--semantic-line-solid-neutral)' }}>
            <Stat value={P.selectedCount} label="선택 보장" />
            <Divider vertical />
            <Stat value={P.excludedCount} label="제외" />
            <Divider vertical />
            <Stat value={`${D.fmtWon(P.total * 12)}원`} label="연 보험료" />
          </div>
          <div style={{ marginTop: 12, padding: '9px 12px', borderRadius: 10, background: 'var(--semantic-background-normal-alternative)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, color: 'var(--semantic-label-alternative)' }}>20년 총 납입 예상</span>
            <span style={{ fontSize: 13.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{D.fmtWon(P.total * 12 * 20)}원</span>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}><CategoryTabs active={tab} onChange={setTab} P={P} /></div>

        {cats.map(cat => (
          <CategorySection key={cat.key} cat={cat} rows={P.items.filter(c => c.cat === cat.key)} P={P} />
        ))}

        <div style={{ marginTop: 4, marginBottom: 14 }}><MemoBox value={memo} onChange={setMemo} /></div>
        <ComplianceFooter />
        <div style={{ height: 8 }} />
      </div>

      {/* Bottom bar */}
      <div style={{ flexShrink: 0, background: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(20px)', boxShadow: '0 -1px 0 var(--semantic-line-normal-neutral)', padding: '12px 16px calc(12px + env(safe-area-inset-bottom))', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--semantic-label-alternative)' }}>월 보험료</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span style={{ fontSize: 20, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{D.fmtWon(P.total)}원</span>
            {P.diff !== 0 && <span style={{ fontSize: 12, fontWeight: 700, color: P.diff > 0 ? 'var(--atomic-red-40)' : 'var(--atomic-green-40)' }}>{P.diff > 0 ? '▲' : '▼'}{D.fmtWon(Math.abs(P.diff))}</span>}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <Button size="large" fullWidth onClick={onSave}>저장하기</Button>
        </div>
      </div>
    </div>
  );
}

export function DiffPillCompact({ P }) {
  if (P.diff === 0) return <span style={{ fontSize: 11.5, fontWeight: 700, padding: '5px 10px', borderRadius: 999, background: 'var(--semantic-fill-alternative)', color: 'var(--semantic-label-neutral)' }}>원안과 동일</span>;
  const up = P.diff > 0;
  return <span style={{ fontSize: 11.5, fontWeight: 700, padding: '5px 10px', borderRadius: 999, background: up ? 'rgba(255,66,66,0.10)' : 'rgba(0,191,64,0.12)', color: up ? 'var(--atomic-red-40)' : 'var(--atomic-green-40)' }}>{up ? '+' : '−'}{D.fmtWon(Math.abs(P.diff))}원</span>;
}

// ── 화면 7: 저장 완료 ──
export function SavedScreen({ P, memo, onEdit, onClose, agentComment = D.PLAN_AGENT_COMMENT, showStatusBar = true }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--semantic-background-normal-normal)' }}>
      {showStatusBar ? <PhoneStatusBar /> : <div style={{ height: 'env(safe-area-inset-top, 12px)', flexShrink: 0 }} />}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px 30px' }}>
        <div style={{ width: 72, height: 72, borderRadius: 999, background: 'rgba(0,191,64,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22, animation: 'pop .4s cubic-bezier(.2,.9,.3,1.2)' }}>
          <Icon name="check" size={38} color="var(--atomic-green-40)" />
        </div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>저장이 완료되었어요</h1>
        <p style={{ margin: '10px 0 24px', fontSize: 14, lineHeight: '21px', color: 'var(--semantic-label-alternative)', textWrap: 'pretty' }}>
          설계사가 조정하신 내용을 확인한 뒤 곧 연락드릴 예정입니다.
        </p>

        <div style={{ background: 'var(--semantic-background-normal-alternative)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 11 }}>
          <SavedRow k="월 예상 보험료" v={`${D.fmtWon(P.total)}원`} strong />
          <Divider />
          <SavedRow k="선택 보장" v={`${P.selectedCount}개`} />
          <SavedRow k="원안 대비" v={P.diff === 0 ? '동일' : (P.diff > 0 ? `+${D.fmtWon(P.diff)}원` : `−${D.fmtWon(Math.abs(P.diff))}원`)} tone={P.diff > 0 ? 'red' : P.diff < 0 ? 'green' : null} />
          {memo.trim() && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, fontSize: 12.5, fontWeight: 600, color: 'var(--semantic-primary-normal)' }}>
              <Icon name="check" size={15} /> 요청사항이 설계사에게 전달되었습니다
            </div>
          )}
        </div>

        <div style={{ marginTop: 14 }}><AgentComment text={agentComment} /></div>

        <div style={{ fontSize: 11.5, color: 'var(--semantic-label-assistive)', textAlign: 'center', margin: '16px 0 20px' }}>이 설계안은 2026.06.27까지 확인할 수 있어요</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <Button size="large" fullWidth onClick={onEdit}>다시 수정하기</Button>
          <Button size="large" variant="outlined" color="assistive" fullWidth onClick={onClose}>닫기</Button>
        </div>
      </div>
    </div>
  );
}
export function SavedRow({ k, v, strong, tone }) {
  const c = tone === 'red' ? 'var(--atomic-red-40)' : tone === 'green' ? 'var(--atomic-green-40)' : 'var(--semantic-label-normal)';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontSize: 13, color: 'var(--semantic-label-alternative)' }}>{k}</span>
      <span style={{ fontSize: strong ? 18 : 14, fontWeight: strong ? 800 : 600, color: c, fontVariantNumeric: 'tabular-nums' }}>{v}</span>
    </div>
  );
}

// ── Customer flow controller (gate → planner → saved), state persists ──
export function CustomerFlow({ step, onStep, toast, setToast }) {
  const P = usePlanner();
  const [memo, setMemo] = useS('');
  const [modal, setModal] = useS(false);

  return (
    <>
      {step === 'gate' && <GateScreen onPass={() => onStep('planner')} />}
      {step === 'planner' && <PlannerMobile P={P} memo={memo} setMemo={setMemo} onSave={() => setModal(true)} />}
      {step === 'saved' && <SavedScreen P={P} memo={memo} onEdit={() => onStep('planner')} onClose={() => onStep('gate')} />}
      {modal && step === 'planner' && (
        <SaveModal P={P} memo={memo} onClose={() => setModal(false)} onConfirm={() => { setModal(false); setToast({ msg: '저장되었습니다', tone: 'success' }); setTimeout(() => onStep('saved'), 350); }} />
      )}
      {toast && <ToastAuto {...toast} bottom={96} onDone={() => setToast(null)} />}
    </>
  );
}
