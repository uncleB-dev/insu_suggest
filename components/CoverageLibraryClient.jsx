'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AdminTopNav } from './AdminScreens';
import { Button, Icon, Badge } from './Primitives';
import { EmptyState, ToastAuto } from './CommonStates';

const CAT_LABEL = {
  cancer: '암', brainHeart: '뇌·심장', injury: '상해',
  disease: '질병', hospital: '입원', waiver: '납입면제',
};
const catLabel = (k) => CAT_LABEL[k] || k || '기타';

export function CoverageLibraryClient({ rows, advisorName, advisorEmail }) {
  const router = useRouter();
  const supabase = createClient();
  const [items, setItems] = useState(() => rows.map((r) => ({ ...r })));
  const [openId, setOpenId] = useState(rows[0]?.id || null);
  const [q, setQ] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const original = useMemo(() => Object.fromEntries(rows.map((r) => [r.id, r])), [rows]);
  const dirtyIds = items.filter((r) => {
    const o = original[r.id];
    return o && ((r.why || '') !== (o.why || '') || (r.how || '') !== (o.how || ''));
  }).map((r) => r.id);

  const edit = (id, field, val) => setItems((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: val } : r)));

  // 카테고리별 그룹 (검색 반영)
  const filtered = q ? items.filter((r) => r.name.includes(q)) : items;
  const groups = [];
  const seen = {};
  filtered.forEach((r) => {
    const k = r.cat || 'etc';
    if (!seen[k]) { seen[k] = { key: k, rows: [] }; groups.push(seen[k]); }
    seen[k].rows.push(r);
  });

  async function logout() {
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  }

  async function save() {
    if (saving || dirtyIds.length === 0) return;
    setSaving(true);
    let ok = true;
    for (const id of dirtyIds) {
      const r = items.find((x) => x.id === id);
      const { error } = await supabase
        .from('coverages_master')
        .update({ why: r.why, how: r.how, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) { ok = false; break; }
    }
    setSaving(false);
    if (ok) {
      // 저장 성공 → 기준값 갱신
      for (const id of dirtyIds) original[id] = { ...items.find((x) => x.id === id) };
      setToast({ msg: '보장 설명이 저장되었습니다', tone: 'success' });
      router.refresh();
    } else {
      setToast({ msg: '저장에 실패했어요. 다시 시도해 주세요', tone: 'error' });
    }
  }

  return (
    <div>
      <AdminTopNav onNew={() => router.push('/admin/new')} onHome={() => router.push('/admin')} onLogout={logout} advisorName={advisorName} advisorEmail={advisorEmail} />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 24px 96px' }}>
        <button onClick={() => router.push('/admin')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: 'var(--semantic-label-alternative)', padding: 0, marginBottom: 14 }}>
          <Icon name="arrow-left" size={16} /> 대시보드
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>보장 설명 관리</h1>
            <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--semantic-label-alternative)', maxWidth: 540, textWrap: 'pretty' }}>
              설계안을 만들 때마다 담보 설명이 여기에 누적됩니다(같은 담보명은 중복 추가되지 않아요). 여기서 고친 “왜 필요한가요·어떻게 받나요” 문구는 <b style={{ color: 'var(--semantic-label-neutral)', fontWeight: 600 }}>앞으로 만드는 설계안에 자동 적용</b>됩니다. (이미 만든 설계안은 그대로 유지돼요.)
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div style={{ marginTop: 20 }}>
            <EmptyState icon="book" tone="blue" title="아직 저장된 보장 설명이 없어요"
              body="설계안을 하나 만들면 그 담보 설명이 자동으로 여기 쌓입니다."
              action={<Button size="small" leadingContent={<Icon name="plus" size={16} />} onClick={() => router.push('/admin/new')}>새 설계안</Button>} />
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 16px' }}>
              <div style={{ flex: 1, maxWidth: 320, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 10, padding: '9px 12px', boxShadow: 'inset 0 0 0 1px var(--semantic-line-normal-neutral)' }}>
                <Icon name="search" size={17} color="var(--semantic-label-alternative)" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="담보명 검색" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, fontFamily: 'inherit', color: 'var(--semantic-label-normal)' }} />
              </div>
              <span style={{ fontSize: 12.5, color: 'var(--semantic-label-alternative)', marginLeft: 'auto' }}>총 {items.length}개</span>
            </div>

            {groups.map((g) => (
              <div key={g.key} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.02em', color: 'var(--semantic-label-assistive)', padding: '0 2px 8px' }}>{catLabel(g.key)}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {g.rows.map((c) => (
                    <LibItem key={c.id} c={c} open={openId === c.id} dirty={dirtyIds.includes(c.id)}
                      onToggle={() => setOpenId(openId === c.id ? null : c.id)}
                      onEdit={(f, v) => edit(c.id, f, v)} />
                  ))}
                </div>
              </div>
            ))}
            {groups.length === 0 && <div style={{ fontSize: 13.5, color: 'var(--semantic-label-alternative)', padding: '24px 2px' }}>“{q}” 검색 결과가 없어요.</div>}
          </>
        )}
      </div>

      {/* 하단 고정 저장 바 */}
      {dirtyIds.length > 0 && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: 'var(--semantic-background-transparent-normal)', backdropFilter: 'blur(20px)', boxShadow: '0 -1px 0 var(--semantic-line-normal-neutral)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, zIndex: 40 }}>
          <span style={{ fontSize: 13, color: 'var(--semantic-label-neutral)' }}>{dirtyIds.length}개 담보 설명이 수정됨</span>
          <Button size="medium" onClick={save} disabled={saving}>{saving ? '저장 중…' : '변경사항 저장'}</Button>
        </div>
      )}

      {toast && <ToastAuto {...toast} onDone={() => setToast(null)} />}
    </div>
  );
}

function LibItem({ c, open, dirty, onToggle, onEdit }) {
  return (
    <div style={{ borderRadius: 12, boxShadow: open ? 'inset 0 0 0 1.5px rgba(0,102,255,0.36)' : 'inset 0 0 0 1px var(--semantic-line-normal-neutral)', overflow: 'hidden', transition: 'box-shadow .15s ease', background: '#fff' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '13px 14px', border: 'none', background: open ? 'rgba(0,102,255,0.04)' : '#fff', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</span>
        {dirty && <Badge tone="orange">수정됨</Badge>}
        <Icon name="arrow-down" size={16} color="var(--semantic-label-alternative)" style={{ marginLeft: 'auto', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s ease' }} />
      </button>
      {open && (
        <div style={{ padding: '4px 14px 14px', display: 'flex', flexDirection: 'column', gap: 12, animation: 'panelDown .18s ease' }}>
          <LibField tone="orange" label="왜 필요한가요?" value={c.why || ''} onChange={(v) => onEdit('why', v)} />
          <LibField tone="green" label="어떻게 받나요?" value={c.how || ''} onChange={(v) => onEdit('how', v)} />
        </div>
      )}
    </div>
  );
}

function LibField({ tone, label, value, onChange }) {
  const [focus, setFocus] = useState(false);
  const t = tone === 'orange' ? { bg: 'rgba(255,146,0,0.14)', fg: 'var(--atomic-orange-39)' } : { bg: 'rgba(0,191,64,0.14)', fg: 'var(--atomic-green-40)' };
  return (
    <div>
      <span style={{ display: 'inline-flex', padding: '3px 9px', borderRadius: 6, fontSize: 11.5, fontWeight: 700, background: t.bg, color: t.fg, marginBottom: 7 }}>{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} rows={3}
        placeholder={tone === 'orange' ? '이 담보가 왜 필요한지 고객 눈높이로 적어주세요.' : '어떤 경우에 보험금을 받는지 적어주세요.'}
        style={{ width: '100%', resize: 'vertical', borderRadius: 10, border: 'none', padding: 11, fontSize: 13.5, lineHeight: '21px', fontFamily: 'inherit',
          background: '#fff', outline: 'none', color: 'var(--semantic-label-normal)',
          boxShadow: focus ? 'inset 0 0 0 2px rgba(0,102,255,0.43)' : 'inset 0 0 0 1px var(--semantic-line-normal-neutral)', transition: 'box-shadow .15s ease' }} />
    </div>
  );
}
