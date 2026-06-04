'use client';
/* 설계사용 화면 (데스크탑): 1 로그인 · 2 대시보드 · 4 설계안 상세. */

import React, { useState } from 'react';
import { D } from '@/lib/data';
import { Button, Icon, Avatar, TextField, Chip, Badge } from './Primitives';
import { Logo, StatusBadge, SERVICE_NAME, Spinner } from './Extras';
import { EmptyState } from './CommonStates';
import { LockIcon } from './CustomerScreens';

const useS = useState;

// ── Admin top nav ──
export function AdminTopNav({ onNew, onHome, onLogout, advisorName = '김설계', advisorEmail = 'planner@agency.co.kr' }) {
  const [menu, setMenu] = useS(false);
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 30, height: 60, background: 'var(--semantic-background-transparent-normal)', backdropFilter: 'blur(32px)', boxShadow: '0 1px 0 var(--semantic-line-normal-neutral)' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', height: '100%', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={onHome} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 22 }}>
          <Logo size={24} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--semantic-label-neutral)' }}>내 설계안</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <Button size="small" leadingContent={<Icon name="plus" size={16} />} onClick={onNew}>새 설계안</Button>
          <button onClick={() => setMenu(m => !m)} style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', cursor: 'pointer', padding: 2 }}>
            <Avatar name="설 계" size={32} gradient="violet" />
            <Icon name="arrow-down" size={14} color="var(--semantic-label-alternative)" />
          </button>
          {menu && (
            <div style={{ position: 'absolute', top: 46, right: 0, width: 180, background: '#fff', borderRadius: 12, boxShadow: 'var(--semantic-shadow-large)', padding: 6, animation: 'pop .15s ease' }}>
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--semantic-line-solid-neutral)', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{advisorName} 설계사</div>
                <div style={{ fontSize: 11.5, color: 'var(--semantic-label-alternative)' }}>{advisorEmail}</div>
              </div>
              {['계정 설정', '로그아웃'].map(x => (
                <div key={x} onClick={() => { if (x === '로그아웃' && onLogout) onLogout(); setMenu(false); }} style={{ padding: '8px 10px', borderRadius: 8, fontSize: 13.5, cursor: 'pointer', color: x === '로그아웃' ? 'var(--semantic-status-negative)' : 'var(--semantic-label-normal)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--semantic-fill-alternative)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>{x}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 화면 1: 로그인 ──
export function LoginScreen({ onLogin, onAuth, defaultEmail = 'planner@agency.co.kr' }) {
  const [email, setEmail] = useS(defaultEmail);
  const [pw, setPw] = useS('');
  const [show, setShow] = useS(false);
  const [err, setErr] = useS('');
  const [loading, setLoading] = useS(false);
  async function submit() {
    if (!email || !pw || loading) return;
    setErr(''); setLoading(true);
    if (onAuth) {
      const e = await onAuth(email, pw);
      setLoading(false);
      if (e) setErr(e); else if (onLogin) onLogin();
      return;
    }
    setTimeout(() => { setLoading(false); if (pw === '0000') setErr('이메일 또는 비밀번호를 확인하세요.'); else onLogin(); }, 800);
  }
  return (
    <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, background: 'radial-gradient(120% 80% at 50% 0%, rgba(0,102,255,0.10) 0%, rgba(0,102,255,0) 60%), var(--semantic-background-normal-alternative)' }}>
      <div style={{ width: 400, maxWidth: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--brand-gradient-deep)', marginBottom: 14, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)' }} />
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{SERVICE_NAME}</h1>
          <div style={{ fontSize: 13.5, color: 'var(--semantic-label-alternative)', marginTop: 4 }}>설계사 전용 관리자</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 18, padding: 24, boxShadow: 'var(--semantic-shadow-small), inset 0 0 0 1px var(--semantic-line-normal-neutral)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <TextField placeholder="이메일" value={email} onChange={(v) => { setEmail(v); setErr(''); }} leadingContent={<Icon name="bubble" size={18} />} />
            <TextField placeholder="비밀번호" type={show ? 'text' : 'password'} value={pw} onChange={(v) => { setPw(v); setErr(''); }} invalid={!!err}
              leadingContent={<LockIcon size={17} />}
              trailingContent={<button onClick={() => setShow(s => !s)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--semantic-label-alternative)' }}>{show ? '숨김' : '표시'}</button>} />
            {err && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: 'var(--semantic-status-negative)' }}><Icon name="close" size={14} />{err}</div>}
            <div style={{ marginTop: 4 }}>
              <Button size="large" fullWidth disabled={!email || !pw || loading} onClick={submit} leadingContent={loading ? <Spinner size={17} /> : null}>{loading ? '로그인 중' : '로그인'}</Button>
            </div>
            <div style={{ textAlign: 'center', marginTop: 2 }}>
              <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: 13, color: 'var(--semantic-label-alternative)', fontWeight: 500 }}>비밀번호 찾기</a>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginTop: 16, padding: '0 4px', fontSize: 12, lineHeight: '18px', color: 'var(--semantic-label-alternative)' }}>
          <LockIcon size={14} />
          <span style={{ textWrap: 'pretty' }}>이 영역은 설계사 전용입니다. 고객은 전달받은 링크로 접속하세요. <span style={{ color: 'var(--semantic-label-assistive)' }}>(데모: 비밀번호 0000 → 오류)</span></span>
        </div>
      </div>
    </div>
  );
}

// ── 화면 2: 대시보드 ──
export function DashboardScreen({ onNew, onOpen, setToast, plans = D.ADMIN_PLANS, hideManager = false, onManage, onLogout, advisorName, advisorEmail }) {
  const [q, setQ] = useS('');
  const [filter, setFilter] = useS('all');
  const [mgr, setMgr] = useS(false);
  const counts = { all: plans.length, sent: plans.filter(p => p.status === 'sent').length, viewed: plans.filter(p => p.status === 'viewed').length, saved: plans.filter(p => p.status === 'saved').length };
  let visible = plans;
  if (filter !== 'all') visible = visible.filter(p => p.status === filter);
  if (q) visible = visible.filter(p => p.label.includes(q) || p.product.includes(q));

  const stats = [
    { key: 'all', label: '전체 설계안', value: counts.all },
    { key: 'sent', label: '발송', value: counts.sent },
    { key: 'viewed', label: '열람', value: counts.viewed },
    { key: 'saved', label: '저장됨', value: counts.saved, accent: true },
  ];

  return (
    <div>
      <AdminTopNav onNew={onNew} onHome={() => {}} onLogout={onLogout} advisorName={advisorName} advisorEmail={advisorEmail} />
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '28px 28px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 18px' }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>내 설계안</h1>
          {!hideManager && <Button size="small" variant="outlined" color="assistive" leadingContent={<Icon name="book" size={16} />} onClick={() => (onManage ? onManage() : setMgr(true))}>보장 설명 관리</Button>}
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
          {stats.map(s => (
            <div key={s.key} onClick={() => setFilter(s.key)} style={{
              background: '#fff', borderRadius: 14, padding: '16px 18px', cursor: 'pointer',
              boxShadow: filter === s.key ? `var(--semantic-shadow-xsmall), inset 0 0 0 1.5px var(--semantic-primary-normal)` : 'var(--semantic-shadow-xsmall), inset 0 0 0 1px var(--semantic-line-normal-neutral)',
              transition: 'box-shadow .2s ease',
            }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: s.accent ? 'var(--atomic-green-40)' : 'var(--semantic-label-alternative)' }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, fontVariantNumeric: 'tabular-nums', marginTop: 4, color: s.accent ? 'var(--atomic-green-40)' : 'var(--semantic-label-normal)' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Search / filter bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
          <div style={{ flex: 1, maxWidth: 360 }}>
            <TextField placeholder="고객 라벨·상품명 검색" value={q} onChange={setQ} leadingContent={<Icon name="search" size={18} />} />
          </div>
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
            {[['all', '전체'], ['sent', '발송'], ['viewed', '열람'], ['saved', '저장됨']].map(([k, l]) => (
              <Chip key={k} size="small" active={filter === k} onClick={() => setFilter(k)}>{l}</Chip>
            ))}
            <Chip variant="outlined" size="small" trailingContent={<Icon name="arrow-down" size={14} />}>최신순</Chip>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: 'var(--semantic-shadow-xsmall), inset 0 0 0 1px var(--semantic-line-normal-neutral)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.4fr 0.9fr 0.8fr 1fr 1fr 1.4fr', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--semantic-line-solid-neutral)', fontSize: 12, fontWeight: 600, color: 'var(--semantic-label-alternative)' }}>
            <span>고객 라벨</span><span>상품</span><span>발급일</span><span>상태</span><span style={{ textAlign: 'right' }}>원안 보험료</span><span style={{ textAlign: 'right' }}>고객안</span><span style={{ textAlign: 'right' }}>최근 활동 · 액션</span>
          </div>
          {visible.length === 0 && <EmptyState compact icon="search" title="조건에 맞는 설계안이 없어요" body="검색어나 필터를 바꿔보세요." />}
          {visible.map(p => <PlanRow key={p.id} p={p} onOpen={() => onOpen(p)} onCopy={() => setToast({ msg: '고객 링크가 복사되었습니다', tone: 'success' })} />)}
        </div>
      </div>
      {mgr && <ExplanationManager onClose={() => setMgr(false)} setToast={setToast} />}
    </div>
  );
}

export function PlanRow({ p, onOpen, onCopy }) {
  const [hover, setHover] = useS(false);
  const saved = p.status === 'saved';
  const diff = p.customer != null ? p.customer - p.base : null;
  return (
    <div onClick={onOpen} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      display: 'grid', gridTemplateColumns: '1.5fr 1.4fr 0.9fr 0.8fr 1fr 1fr 1.4fr', gap: 12, padding: '14px 20px', alignItems: 'center', cursor: 'pointer',
      borderBottom: '1px solid var(--semantic-line-solid-neutral)', background: hover ? 'var(--semantic-fill-alternative)' : saved ? 'rgba(0,191,64,0.035)' : 'transparent',
      boxShadow: saved ? 'inset 3px 0 0 var(--atomic-green-50)' : 'none', transition: 'background .15s ease',
    }}>
      <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{p.label}</span>
      <span style={{ fontSize: 13, color: 'var(--semantic-label-neutral)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.product}</span>
      <span style={{ fontSize: 13, color: 'var(--semantic-label-alternative)', fontVariantNumeric: 'tabular-nums' }}>{p.issued}</span>
      <span><StatusBadge status={p.status} /></span>
      <span style={{ textAlign: 'right', fontSize: 13.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{D.fmtWon(p.base)}원</span>
      <span style={{ textAlign: 'right', fontSize: 13.5, fontVariantNumeric: 'tabular-nums' }}>
        {p.customer != null ? (
          <span style={{ fontWeight: 700 }}>{D.fmtWon(p.customer)}원 {diff !== 0 && <span style={{ fontSize: 11.5, fontWeight: 700, color: diff > 0 ? 'var(--atomic-red-40)' : 'var(--atomic-green-40)' }}>{diff > 0 ? '▲' : '▼'}{D.fmtWon(Math.abs(diff))}</span>}</span>
        ) : <span style={{ color: 'var(--semantic-label-assistive)' }}>—</span>}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
        {hover ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <Chip variant="outlined" size="xsmall" onClick={(e) => { e.stopPropagation(); onCopy(); }} leadingContent={<Icon name="share" size={13} />}>URL</Chip>
            <Chip variant="outlined" size="xsmall" leadingContent={<Icon name="arrow-up-right" size={13} />}>상세</Chip>
          </div>
        ) : <span style={{ fontSize: 12.5, color: 'var(--semantic-label-alternative)' }}>{p.savedAt}</span>}
      </span>
    </div>
  );
}

// 보장 설명 관리 — 설계사가 담보별 왜/어떻게 설명 문구를 확인·수정 (화면 2)
export function ExplanationManager({ onClose, setToast }) {
  const [list, setList] = useS(() => D.PLAN_COVERAGES.map(c => ({ id: c.id, cat: c.cat, name: c.name, required: c.required, why: c.why, how: c.how })));
  const [openId, setOpenId] = useS(D.PLAN_COVERAGES[0].id);
  const catLabel = (k) => (D.PLAN_CATEGORIES.find(c => c.key === k) || {}).label || k;

  const edit = (id, field, val) => setList(prev => prev.map(c => c.id === id ? { ...c, [field]: val } : c));
  function save() {
    list.forEach(e => { const c = D.PLAN_COVERAGES.find(x => x.id === e.id); if (c) { c.why = e.why; c.how = e.how; } });
    setToast({ msg: '보장 설명이 저장되었습니다', tone: 'success' });
    onClose();
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'var(--semantic-material-dimmer)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'fadeIn .2s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 660, maxWidth: '100%', maxHeight: '86vh', background: '#fff', borderRadius: 20, boxShadow: 'var(--semantic-shadow-large)', display: 'flex', flexDirection: 'column', animation: 'pop .25s cubic-bezier(.2,.8,.2,1)' }}>
        {/* header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--semantic-line-solid-neutral)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>보장 설명 관리</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--semantic-label-alternative)' }}>고객에게 보이는 담보별 “왜 필요한가요·어떻게 받나요” 문구를 수정합니다.</p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'var(--semantic-fill-alternative)', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--semantic-label-neutral)' }}><Icon name="close" size={18} /></button>
        </div>
        {/* body */}
        <div className="scroll" style={{ flex: 1, overflow: 'auto', padding: '14px 24px 18px' }}>
          {D.PLAN_CATEGORIES.map(cat => {
            const rows = list.filter(c => c.cat === cat.key);
            if (!rows.length) return null;
            return (
              <div key={cat.key} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.02em', color: 'var(--semantic-label-assistive)', padding: '0 2px 7px' }}>{cat.label}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {rows.map(c => (
                    <ExpEditItem key={c.id} c={c} open={openId === c.id} onToggle={() => setOpenId(openId === c.id ? null : c.id)} onEdit={(f, v) => edit(c.id, f, v)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {/* footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--semantic-line-solid-neutral)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="outlined" color="assistive" size="medium" onClick={onClose}>취소</Button>
          <Button size="medium" onClick={save}>저장</Button>
        </div>
      </div>
    </div>
  );
}

function ExpEditItem({ c, open, onToggle, onEdit }) {
  return (
    <div style={{ borderRadius: 12, boxShadow: open ? 'inset 0 0 0 1.5px rgba(0,102,255,0.36)' : 'inset 0 0 0 1px var(--semantic-line-normal-neutral)', overflow: 'hidden', transition: 'box-shadow .15s ease' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', border: 'none', background: open ? 'rgba(0,102,255,0.04)' : '#fff', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</span>
        {c.required && <Badge tone="neutral">필수</Badge>}
        <Icon name="arrow-down" size={16} color="var(--semantic-label-alternative)" style={{ marginLeft: 'auto', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s ease' }} />
      </button>
      {open && (
        <div style={{ padding: '4px 14px 14px', display: 'flex', flexDirection: 'column', gap: 12, animation: 'panelDown .18s ease' }}>
          <ExpField tone="orange" label="왜 필요한가요?" value={c.why} onChange={(v) => onEdit('why', v)} />
          <ExpField tone="green" label="어떻게 받나요?" value={c.how} onChange={(v) => onEdit('how', v)} />
        </div>
      )}
    </div>
  );
}

function ExpField({ tone, label, value, onChange }) {
  const [focus, setFocus] = useS(false);
  const t = tone === 'orange' ? { bg: 'rgba(255,146,0,0.14)', fg: 'var(--atomic-orange-39)' } : { bg: 'rgba(0,191,64,0.14)', fg: 'var(--atomic-green-40)' };
  return (
    <div>
      <span style={{ display: 'inline-flex', padding: '3px 9px', borderRadius: 6, fontSize: 11.5, fontWeight: 700, background: t.bg, color: t.fg, marginBottom: 7 }}>{label}</span>
      <textarea value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} rows={3}
        style={{ width: '100%', resize: 'vertical', borderRadius: 10, border: 'none', padding: 11, fontSize: 13.5, lineHeight: '21px', fontFamily: 'inherit',
          background: '#fff', outline: 'none', color: 'var(--semantic-label-normal)',
          boxShadow: focus ? 'inset 0 0 0 2px rgba(0,102,255,0.43)' : 'inset 0 0 0 1px var(--semantic-line-normal-neutral)', transition: 'box-shadow .15s ease' }} />
    </div>
  );
}
