'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GateScreen, PlannerMobile, SavedScreen } from './CustomerScreens';
import { usePlanner, SaveModal } from './PlannerCore';
import { ToastAuto } from './CommonStates';
import { ErrorState } from './CommonStates';
import { Button } from './Primitives';

// 고객 페이지 컨테이너 — 모바일 우선 프레임으로 감싸 전체 흐름(게이트→설계→저장)을 구동.
function Frame({ children }) {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--semantic-background-normal-alternative)', display: 'flex', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 480, minHeight: '100dvh', background: 'var(--semantic-background-normal-normal)', overflow: 'hidden', boxShadow: '0 0 0 1px var(--semantic-line-normal-neutral)' }}>
        {children}
      </div>
    </div>
  );
}

export function ClientPlanner({ slug, authType, invalid }) {
  const [supabase] = useState(() => createClient());
  const [stage, setStage] = useState('gate'); // gate | planner | saved
  const [plan, setPlan] = useState(null);
  const [code, setCode] = useState('');
  const [toast, setToast] = useState(null);

  if (invalid) {
    return (
      <Frame>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ErrorState kind="expired" />
        </div>
      </Frame>
    );
  }

  async function onVerify(val) {
    const { data, error } = await supabase.rpc('get_plan_for_client', { p_slug: slug, p_code: val });
    if (error) return { ok: false };
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return { ok: false };
    setPlan({ id: row.id, label: row.label, proposal: row.proposal_json, agentComment: row.agent_comment, authType: row.auth_type });
    setCode(val);
    return { ok: true };
  }

  if (!plan) {
    return (
      <Frame>
        <GateScreen authType={authType} onVerify={onVerify} onPass={() => setStage('planner')} showStatusBar={false} />
        {toast && <ToastAuto {...toast} onDone={() => setToast(null)} bottom={96} />}
      </Frame>
    );
  }

  return (
    <Frame>
      <Loaded slug={slug} code={code} plan={plan} supabase={supabase} stage={stage} setStage={setStage} toast={toast} setToast={setToast} />
    </Frame>
  );
}

function Loaded({ slug, code, plan, supabase, stage, setStage, toast, setToast }) {
  const proposal = plan.proposal || {};
  const P = usePlanner(proposal.coverages || [], proposal.discountRate ?? 0.12);
  const [memo, setMemo] = useState('');
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const customer = proposal.customer || {};
  const categories = proposal.categories || [];

  async function confirmSave() {
    if (saving) return;
    setSaving(true);
    const stateJson = {
      items: P.items.map((c) => ({ id: c.id, on: c.on, amount: c.amount, premium: P.premiumOf(c) })),
      total: P.total,
      base: P.base,
    };
    const { error } = await supabase.rpc('save_submission', {
      p_slug: slug,
      p_code: code,
      p_state_json: stateJson,
      p_total_premium: P.total,
      p_client_memo: memo.trim() || null,
    });
    setSaving(false);
    setModal(false);
    if (error) {
      setToast({ msg: '저장에 실패했어요. 다시 시도해 주세요', tone: 'error' });
      return;
    }
    setToast({ msg: '저장되었습니다', tone: 'success' });
    setTimeout(() => setStage('saved'), 350);
  }

  return (
    <>
      {stage === 'planner' && (
        <PlannerMobile
          P={P}
          memo={memo}
          setMemo={setMemo}
          onSave={() => setModal(true)}
          customer={customer}
          categories={categories}
          agentComment={plan.agentComment}
          showStatusBar={false}
        />
      )}
      {stage === 'saved' && (
        <SavedScreen P={P} memo={memo} agentComment={plan.agentComment} showStatusBar={false} onEdit={() => setStage('planner')} onClose={() => setStage('planner')} />
      )}
      {modal && stage === 'planner' && (
        <SaveModal P={P} memo={memo} onClose={() => setModal(false)} onConfirm={confirmSave} />
      )}
      {toast && <ToastAuto {...toast} onDone={() => setToast(null)} bottom={96} />}
    </>
  );
}
