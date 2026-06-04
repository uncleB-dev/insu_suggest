// Shared helpers for working with proposal_json / submission state.

export function coveragePremium(c) {
  if (!c || !c.on) return 0;
  return c.fixedPremium != null ? c.fixedPremium : Math.round((c.amount || 0) * (c.unit || 0));
}

// 원안(설계사 제안) 월 보험료 합계
export function basePremium(proposal) {
  const cov = (proposal && proposal.coverages) || [];
  return cov.reduce((s, c) => s + coveragePremium(c), 0);
}

// 원안(proposal) vs 고객안(submission.state_json) 담보 비교표 rows 생성
export function buildComparison(proposal, state) {
  const cov = (proposal && proposal.coverages) || [];
  const cats = (proposal && proposal.categories) || [];
  const catLabel = (k) => (cats.find((c) => c.key === k) || {}).label || k;
  const byId = {};
  ((state && state.items) || []).forEach((it) => { byId[it.id] = it; });
  const amtStr = (a, unit) => (a == null ? '—' : `${a.toLocaleString('ko-KR')}${unit || '만원'}`);

  return cov.map((c) => {
    const it = byId[c.id];
    const custOn = it ? it.on : c.on;
    const custAmount = it ? it.amount : c.amount;
    const custP = it ? it.premium : coveragePremium(c);
    const baseP = coveragePremium({ ...c, on: true });
    let change = 'keep';
    if (!custOn && c.on) change = 'exclude';
    else if (custOn && !c.on) change = 'up';
    else if (c.amount != null && custAmount > c.amount) change = 'up';
    else if (c.amount != null && custAmount < c.amount) change = 'down';
    return {
      id: c.id,
      name: c.name,
      cat: catLabel(c.cat),
      baseA: amtStr(c.amount, c.unitLabel),
      baseP,
      custA: custOn ? amtStr(custAmount, c.unitLabel) : '제외',
      custP: custOn ? custP : 0,
      change,
    };
  });
}

export function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

export function relTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d === 1) return '어제';
  if (d < 7) return `${d}일 전`;
  return fmtDate(iso);
}
