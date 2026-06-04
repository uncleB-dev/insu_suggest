'use client';
/* 화면 3 — 새 설계안 생성 (입력 → 검증/미리보기 → 발급). 데스크탑.
   onCreate 가 주어지면 실제 DB 생성, 없으면 미리보기(mock) 동작. */

import React, { useState } from 'react';
import { D } from '@/lib/data';
import { Icon, TextField, Button, Divider } from './Primitives';
import { Stat, AgentComment } from './Extras';
import { AdminTopNav } from './AdminScreens';

const useS = useState;

// 정식 proposal_json 예시 (고객 설계 페이지가 그대로 렌더링하는 형태)
const SAMPLE_JSON = `{
  "customer": {
    "maskedName": "김*아", "age": 13, "gender": "여",
    "maturity": "80세 만기", "payTerm": "20년 납",
    "injuryGrade": "상해 1급", "product": "(무)퍼펙트 어린이보장보험 2종"
  },
  "discountRate": 0.12,
  "categories": [
    { "key": "cancer", "label": "암" },
    { "key": "injury", "label": "상해" },
    { "key": "waiver", "label": "납입면제" }
  ],
  "coverages": [
    { "id": "c1", "cat": "cancer", "name": "암진단비 (유사암 제외)", "amount": 5000, "base": 5000, "min": 1000, "max": 10000, "step": 1000, "unit": 3.0, "on": true,
      "why": "진단 시 목돈을 한 번에 받아 치료비·생활비 공백을 메웁니다.", "how": "보장 대상 암 최초 진단 확정 시 가입금액 전액을 지급합니다.",
      "limitNote": "업계 암 진단비 합산 한도로 이 금액 이상은 가입이 어려울 수 있어요." },
    { "id": "c6", "cat": "injury", "name": "상해후유장해 (3~100%)", "amount": 10000, "base": 10000, "min": 5000, "max": 10000, "step": 1000, "unit": 0.3, "on": true, "required": true,
      "why": "사고 후유장해를 장해율에 비례해 보장하는 핵심 담보입니다.", "how": "상해로 후유장해 발생 시 가입금액 × 장해지급률을 지급합니다." },
    { "id": "c13", "cat": "waiver", "name": "보험료 납입면제 (특약)", "amount": null, "fixedPremium": 1200, "on": true, "required": true,
      "why": "면제 사유 발생 시 이후 보험료를 면제해 보장을 지켜줍니다.", "how": "약관상 면제 사유 발생 시 차회 이후 보험료 납입을 면제합니다." }
  ]
}`;

function premiumOf(c) {
  if (!c.on) return 0;
  return c.fixedPremium != null ? c.fixedPremium : Math.round((c.amount || 0) * (c.unit || 0));
}

export function validatePlan(raw) {
  const checks = [];
  let data = null;
  try { data = JSON.parse(raw); } catch (e) {
    return { ok: false, parseError: true, checks: [], errors: ['JSON 형식이 올바르지 않습니다. 따옴표·쉼표를 확인하세요.'], data: null };
  }
  const errors = [];
  const has = (c, k) => c && c[k] !== undefined && c[k] !== null && c[k] !== '';
  const cov = Array.isArray(data.coverages) ? data.coverages : [];
  const cats = Array.isArray(data.categories) ? data.categories : [];

  checks.push({ label: '고객 정보(customer.maskedName) 존재', ok: has(data.customer, 'maskedName') });
  checks.push({ label: `카테고리 ${cats.length}개 인식`, ok: cats.length > 0 });
  checks.push({ label: `담보 ${cov.length}개 인식`, ok: cov.length > 0 });

  if (!has(data.customer, 'maskedName')) errors.push('필수 필드 누락: customer.maskedName');
  if (!cats.length) errors.push('카테고리(categories)가 비어 있습니다.');
  if (!cov.length) errors.push('담보(coverages)가 비어 있습니다.');

  cov.forEach((c, i) => {
    if (!has(c, 'name')) errors.push(`필수 필드 누락: coverages[${i}].name`);
    if (!has(c, 'why')) errors.push(`필수 필드 누락: coverages[${i}].why`);
    const priced = typeof c.fixedPremium === 'number' || (typeof c.amount === 'number' && typeof c.unit === 'number');
    if (!priced) errors.push(`보험료 산정 정보 누락: coverages[${i}] (fixedPremium 또는 amount+unit)`);
  });
  const priceOk = cov.every(c => typeof c.fixedPremium === 'number' || (typeof c.amount === 'number' && typeof c.unit === 'number'));
  checks.push({ label: '담보별 필수 필드(name·why·보험료)', ok: cov.length > 0 && cov.every(c => has(c, 'name') && has(c, 'why')) && priceOk });

  const base = cov.reduce((s, c) => s + premiumOf(c), 0);
  return { ok: errors.length === 0, parseError: false, checks, errors, data, base };
}

function genSlug() {
  // 추측 불가능한 랜덤 토큰 (12자)
  const a = '0123456789abcdefghijklmnopqrstuvwxyz';
  let s = '';
  const r = (typeof crypto !== 'undefined' && crypto.getRandomValues)
    ? crypto.getRandomValues(new Uint32Array(12)) : null;
  for (let i = 0; i < 12; i++) s += a[(r ? r[i] : Math.floor(Math.random() * 1e9)) % a.length];
  return s;
}

export function Stepper({ step }) {
  const steps = ['JSON 입력', '검증 · 미리보기', '발급 완료'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 26 }}>
      {steps.map((s, i) => {
        const n = i + 1, done = n < step, active = n === step;
        return (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 26, height: 26, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: done ? 'var(--atomic-green-50)' : active ? 'var(--semantic-primary-normal)' : 'var(--semantic-fill-strong)',
                color: (done || active) ? '#fff' : 'var(--semantic-label-alternative)', fontSize: 13, fontWeight: 700 }}>
                {done ? <Icon name="check" size={15} /> : n}
              </div>
              <span style={{ fontSize: 13.5, fontWeight: active ? 700 : 500, color: active ? 'var(--semantic-label-normal)' : 'var(--semantic-label-alternative)' }}>{s}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: 'var(--semantic-line-solid-normal)', margin: '0 14px', maxWidth: 80 }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function NewPlanScreen({ onBack, onDone, setToast, onCreate }) {
  const [step, setStep] = useS(1);
  const [json, setJson] = useS(SAMPLE_JSON);
  const [label, setLabel] = useS('김OO 13세 어린이');
  const [authType, setAuthType] = useS('birth');
  const [birth, setBirth] = useS('130506');
  const [bFocus, setBFocus] = useS(false);
  const [code] = useS(() => String(Math.floor(100000 + Math.random() * 900000)));
  const [comment, setComment] = useS(D.PLAN_AGENT_COMMENT || '');
  const [cFocus, setCFocus] = useS(false);
  const [result, setResult] = useS(null);
  const [focus, setFocus] = useS(false);
  const [creating, setCreating] = useS(false);
  const [issuedUrl, setIssuedUrl] = useS('https://plan.simul.co.kr/p/k3x9q2');
  const [createErr, setCreateErr] = useS('');

  const accessValue = authType === 'birth' ? birth : code;

  function runValidate() {
    const r = validatePlan(json);
    setResult(r);
    setStep(2);
  }

  async function generate() {
    if (!result || !result.ok) return;
    setCreateErr('');
    if (onCreate) {
      setCreating(true);
      const slug = genSlug();
      const res = await onCreate({
        label: label.trim(), slug, accessCode: accessValue, authType,
        proposalJson: result.data, comment: comment.trim(),
      });
      setCreating(false);
      if (res && res.error) { setCreateErr(res.error); return; }
      setIssuedUrl(res.url);
      setStep(3);
    } else {
      // 미리보기(mock)
      D.PLAN_AGENT_COMMENT = comment;
      D.PLAN_AUTH = { type: authType, value: accessValue };
      setStep(3);
    }
  }

  const guideText = authType === 'birth'
    ? `안녕하세요. 맞춤 보장 설계안을 보내드립니다. 아래 링크에서 생년월일 6자리를 입력하시면 확인하실 수 있어요.\n${issuedUrl}`
    : `안녕하세요. 맞춤 보장 설계안을 보내드립니다. 아래 링크에서 접속 코드(${code})를 입력하시면 확인하실 수 있어요.\n${issuedUrl}`;

  return (
    <div>
      <AdminTopNav onNew={() => {}} onHome={onBack} />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '26px 28px 64px' }}>
        <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: 'var(--semantic-label-alternative)', padding: 0, marginBottom: 14 }}>
          <Icon name="arrow-left" size={16} /> 대시보드
        </button>
        <h1 style={{ margin: '0 0 22px', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>새 설계안 생성</h1>
        <Stepper step={step} />

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ fontSize: 13.5, fontWeight: 700, display: 'block', marginBottom: 8 }}>제안서 JSON</label>
              <div style={{ position: 'relative' }}>
                <textarea value={json} onChange={e => setJson(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} spellCheck={false}
                  style={{ width: '100%', height: 240, resize: 'vertical', borderRadius: 12, padding: 14, fontSize: 12.5, lineHeight: '19px', fontFamily: 'var(--font-mono)',
                    background: '#fff', border: 'none', outline: 'none', color: 'var(--semantic-label-normal)',
                    boxShadow: focus ? 'inset 0 0 0 2px rgba(0,102,255,0.43)' : 'inset 0 0 0 1px var(--semantic-line-normal-neutral)', transition: 'box-shadow .15s ease', whiteSpace: 'pre' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12.5, color: 'var(--semantic-label-alternative)' }}>
                <Icon name="bulb" size={15} /> Claude Desktop에서 변환한 제안서 JSON을 붙여넣으세요. 고객 페이지가 그대로 렌더링합니다.
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13.5, fontWeight: 700, display: 'block', marginBottom: 8 }}>고객 식별 라벨 <span style={{ color: 'var(--semantic-status-negative)' }}>*</span></label>
              <TextField placeholder="예) 김OO 13세 어린이" value={label} onChange={setLabel} />
              <div style={{ fontSize: 12, color: 'var(--semantic-label-assistive)', marginTop: 6 }}>실명 대신 식별용 라벨을 사용하세요. 고객에게는 노출되지 않습니다.</div>
            </div>

            <div>
              <label style={{ fontSize: 13.5, fontWeight: 700, display: 'block', marginBottom: 8 }}>고객 인증 방식</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <AuthOption active={authType === 'birth'} onClick={() => setAuthType('birth')} title="생년월일 6자리" desc="YYMMDD 입력" />
                <AuthOption active={authType === 'code'} onClick={() => setAuthType('code')} title="별도 접속 코드" desc="6자리 코드 자동 발급" />
              </div>

              {authType === 'birth' ? (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input inputMode="numeric" maxLength={6} value={birth} onChange={e => setBirth(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} onFocus={() => setBFocus(true)} onBlur={() => setBFocus(false)} placeholder="YYMMDD"
                      style={{ width: 160, height: 44, borderRadius: 10, border: 'none', padding: '0 14px', fontSize: 17, fontWeight: 700, letterSpacing: '0.14em', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-mono)',
                        background: '#fff', outline: 'none', color: 'var(--semantic-label-normal)', caretColor: 'var(--semantic-primary-normal)',
                        boxShadow: bFocus ? 'inset 0 0 0 2px rgba(0,102,255,0.43)' : 'inset 0 0 0 1px var(--semantic-line-normal-neutral)', transition: 'box-shadow .15s ease' }} />
                    <span style={{ fontSize: 13, color: 'var(--semantic-label-alternative)' }}>고객 생년월일 6자리 (YYMMDD)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 7, fontSize: 12, color: 'var(--semantic-label-assistive)' }}>
                    <LockMini /> 입력한 생년월일은 <b style={{ color: 'var(--semantic-label-alternative)', fontWeight: 600 }}>JSON·제안서에 저장되지 않고</b> 본인 확인에만 사용됩니다.
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 160, height: 44, borderRadius: 10, padding: '0 14px', background: 'var(--semantic-background-normal-alternative)', boxShadow: 'inset 0 0 0 1px var(--semantic-line-normal-neutral)', display: 'flex', alignItems: 'center', fontSize: 17, fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'var(--font-mono)' }}>{code}</div>
                    <span style={{ fontSize: 13, color: 'var(--semantic-label-alternative)' }}>자동 발급된 접속 코드 — 고객에게 함께 전달하세요</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label style={{ fontSize: 13.5, fontWeight: 700, display: 'block', marginBottom: 8 }}>고객에게 보여줄 코멘트 <span style={{ color: 'var(--semantic-label-alternative)', fontWeight: 500 }}>(설계 의도·인사말)</span></label>
              <textarea value={comment} onChange={e => setComment(e.target.value)} onFocus={() => setCFocus(true)} onBlur={() => setCFocus(false)}
                placeholder="예) 활동량이 많은 시기를 고려해 상해·암 보장을 중심으로 설계했어요. 부담되는 담보는 조정해 보세요."
                rows={3} style={{ width: '100%', resize: 'vertical', borderRadius: 12, border: 'none', padding: 12, fontSize: 14, lineHeight: '21px', fontFamily: 'inherit',
                  background: '#fff', outline: 'none', color: 'var(--semantic-label-normal)',
                  boxShadow: cFocus ? 'inset 0 0 0 2px rgba(0,102,255,0.43)' : 'inset 0 0 0 1px var(--semantic-line-normal-neutral)', transition: 'box-shadow .15s ease' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, color: 'var(--semantic-label-assistive)' }}>
                <Icon name="bubble" size={14} /> 고객의 설계 메인 화면과 저장 화면 상단에 설계사 메시지로 표시됩니다.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
              <Button variant="outlined" color="assistive" size="large" onClick={onBack}>취소</Button>
              <Button size="large" disabled={!label.trim() || !json.trim() || (authType === 'birth' && birth.length !== 6)} onClick={runValidate}>검증하기</Button>
            </div>
          </div>
        )}

        {step === 2 && result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: 'var(--semantic-shadow-xsmall), inset 0 0 0 1px var(--semantic-line-normal-neutral)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 24, height: 24, borderRadius: 999, background: result.ok ? 'var(--atomic-green-50)' : 'var(--semantic-status-negative)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={result.ok ? 'check' : 'close'} size={15} color="#fff" />
                </div>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{result.ok ? '검증을 통과했어요' : '오류를 확인해 주세요'}</span>
              </div>
              {!result.parseError && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.checks.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
                      <Icon name={c.ok ? 'check' : 'close'} size={16} color={c.ok ? 'var(--atomic-green-40)' : 'var(--semantic-status-negative)'} />
                      <span style={{ color: c.ok ? 'var(--semantic-label-neutral)' : 'var(--semantic-status-negative)' }}>{c.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {result.errors.length > 0 && (
                <div style={{ marginTop: 14, borderRadius: 10, background: 'rgba(255,66,66,0.06)', boxShadow: 'inset 0 0 0 1px rgba(255,66,66,0.18)', padding: 12 }}>
                  {result.errors.map((e, i) => (
                    <div key={i} style={{ display: 'flex', gap: 7, fontSize: 12.5, fontWeight: 500, color: 'var(--atomic-red-40)', padding: '2px 0' }}>
                      <Icon name="close" size={14} style={{ marginTop: 1, flexShrink: 0 }} />{e}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {result.ok && (
              <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: 'var(--semantic-shadow-xsmall), inset 0 0 0 1px var(--semantic-line-normal-neutral)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--semantic-label-alternative)', marginBottom: 12 }}>미리보기</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{label}</div>
                    <div style={{ fontSize: 13, color: 'var(--semantic-label-alternative)', marginTop: 2 }}>{result.data.customer.product || '상품명 미지정'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11.5, color: 'var(--semantic-label-alternative)' }}>월 보험료(참고)</div>
                    <div style={{ fontSize: 22, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{D.fmtWon(result.base)}원</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 0 }}>
                  <Stat value={result.data.coverages.length} label="담보 수" />
                  <Divider vertical />
                  <Stat value={`${result.data.customer.age}세`} label="나이" />
                  <Divider vertical />
                  <Stat value={result.data.customer.gender || '—'} label="성별(마스킹)" />
                </div>
                {comment.trim() && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--semantic-line-solid-neutral)' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--semantic-label-alternative)', marginBottom: 8 }}>고객에게 보여줄 코멘트</div>
                    <AgentComment text={comment} />
                  </div>
                )}
              </div>
            )}

            {createErr && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--semantic-status-negative)' }}>
                <Icon name="close" size={15} /> {createErr}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="outlined" color="assistive" size="large" onClick={() => setStep(1)}>수정</Button>
              <Button size="large" disabled={!result.ok || creating} onClick={generate}>{creating ? '생성 중…' : '이대로 생성'}</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '8px 0 4px' }}>
              <div style={{ width: 56, height: 56, borderRadius: 999, background: 'rgba(0,191,64,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, animation: 'pop .35s cubic-bezier(.2,.9,.3,1.2)' }}>
                <Icon name="check" size={30} color="var(--atomic-green-40)" />
              </div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>설계안이 생성되었어요</h2>
              <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--semantic-label-alternative)' }}>아래 링크를 고객에게 전달하세요.</p>
            </div>

            <CopyField label="고객 접속 URL" value={issuedUrl} onCopy={() => copy(issuedUrl, setToast, '고객 링크가 복사되었습니다')} mono />
            <div style={{ background: 'rgba(0,102,255,0.05)', borderRadius: 12, padding: 14, boxShadow: 'inset 0 0 0 1px rgba(0,102,255,0.14)', display: 'flex', gap: 9 }}>
              <Icon name="bulb" size={16} color="var(--semantic-primary-normal)" style={{ marginTop: 1, flexShrink: 0 }} />
              <div style={{ fontSize: 13, lineHeight: '20px', color: 'var(--semantic-label-neutral)' }}>{authType === 'birth' ? <>접속 방법: 고객이 링크 접속 후 <b>생년월일 6자리(YYMMDD)</b>를 입력하면 설계안이 열립니다.</> : <>접속 방법: 고객이 링크 접속 후 <b>접속 코드 {code}</b>를 입력하면 설계안이 열립니다.</>}</div>
            </div>
            <CopyField label="고객 안내 문구 (복사용)" value={guideText} onCopy={() => copy(guideText, setToast, '안내 문구가 복사되었습니다')} multiline />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="outlined" color="assistive" size="large" onClick={() => copy(issuedUrl, setToast, '고객 링크가 복사되었습니다')}>URL 복사</Button>
              <Button size="large" onClick={onDone}>대시보드로</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function copy(text, setToast, msg) {
  try { navigator.clipboard && navigator.clipboard.writeText(text); } catch {}
  setToast && setToast({ msg, tone: 'success' });
}

function LockMini() {
  return <svg viewBox="0 0 24 24" width={13} height={13} fill="currentColor" style={{ flexShrink: 0 }}><path d="M12 2.5a4.5 4.5 0 00-4.5 4.5v2H7A2.5 2.5 0 004.5 11.5v7A2.5 2.5 0 007 21h10a2.5 2.5 0 002.5-2.5v-7A2.5 2.5 0 0017 9h-.5V7A4.5 4.5 0 0012 2.5zm2.5 6.5h-5V7a2.5 2.5 0 015 0v2z"/></svg>;
}

function AuthOption({ active, onClick, title, desc }) {
  return (
    <button onClick={onClick} style={{ flex: 1, textAlign: 'left', border: 'none', cursor: 'pointer', borderRadius: 12, padding: 14, background: active ? 'rgba(0,102,255,0.05)' : '#fff',
      boxShadow: active ? 'inset 0 0 0 2px rgba(0,102,255,0.43)' : 'inset 0 0 0 1px var(--semantic-line-normal-neutral)', transition: 'box-shadow .15s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 16, height: 16, borderRadius: 999, boxShadow: active ? 'inset 0 0 0 5px var(--semantic-primary-normal)' : 'inset 0 0 0 1.5px var(--semantic-line-normal-normal)' }} />
        <span style={{ fontSize: 14, fontWeight: 700 }}>{title}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--semantic-label-alternative)', marginTop: 5, paddingLeft: 24 }}>{desc}</div>
    </button>
  );
}

function CopyField({ label, value, onCopy, mono, multiline }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 8 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 8 }}>
        <div style={{ flex: 1, background: '#fff', borderRadius: 10, padding: '11px 13px', boxShadow: 'inset 0 0 0 1px var(--semantic-line-normal-neutral)', fontSize: 13, lineHeight: '20px',
          fontFamily: mono ? 'var(--font-mono)' : 'inherit', color: 'var(--semantic-label-neutral)', whiteSpace: multiline ? 'pre-wrap' : 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
        <Button variant="outlined" color="assistive" size="medium" onClick={onCopy} leadingContent={<Icon name="share" size={15} />} style={{ flexShrink: 0 }}>복사</Button>
      </div>
    </div>
  );
}
