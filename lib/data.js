/* Mock data for the 보장 설계 시뮬레이터 (Wanted WDS styling).
   Exported as a single mutable store `D` so the prototype's
   global-mutation pattern (보장 설명 관리, 코멘트/인증값 갱신) keeps working. */

export const D = {
  // ── Customer (always masked; NO resident number / medical history anywhere) ──
  PLAN_CUSTOMER: {
    maskedName: '김*아',
    age: 13,
    gender: '여',
    maturity: '80세 만기',
    payTerm: '20년 납',
    injuryGrade: '상해 1급',
    product: '(무)퍼펙트 어린이보장보험 2종',
  },

  // Health-disclosure discount applied to the base (건강고지 할인)
  PLAN_DISCOUNT_RATE: 0.12,

  // category keys: cancer / brainHeart / injury / disease / hospital / waiver
  PLAN_CATEGORIES: [
    { key: 'cancer',     label: '암' },
    { key: 'brainHeart', label: '뇌·심장' },
    { key: 'injury',     label: '상해' },
    { key: 'disease',    label: '질병' },
    { key: 'hospital',   label: '입원' },
    { key: 'waiver',     label: '납입면제' },
  ],

  // Coverages. premium(원) = amount(만원) × unit, unless fixedPremium set.
  PLAN_COVERAGES: [
    {
      id: 'c1', cat: 'cancer', name: '암진단비 (유사암 제외)',
      amount: 5000, base: 5000, min: 1000, max: 10000, step: 1000, unit: 3.0, on: true,
      why: '소아·청소년기 암은 발병 시 장기 치료와 큰 비용이 발생합니다. 진단 시 목돈을 한 번에 받아 치료비·생활비 공백을 메울 수 있습니다.',
      how: '약관상 보장 대상 암으로 최초 진단 확정 시 가입금액 전액을 1회 지급합니다.',
      limitNote: '업계 암 진단비 합산 한도(통상 5,000만원)로 이 금액 이상은 가입이 어려울 수 있어요.',
    },
    {
      id: 'c2', cat: 'cancer', name: '유사암진단비',
      amount: 1000, base: 1000, min: 200, max: 2000, step: 100, unit: 1.5, on: true,
      why: '갑상선암·기타피부암·경계성종양 등 유사암은 일반암보다 발생 빈도가 높습니다.',
      how: '유사암 최초 진단 확정 시 가입금액을 지급합니다 (감액 기간 적용될 수 있음).',
    },
    {
      id: 'c3', cat: 'cancer', name: '암수술비',
      amount: 300, base: 300, min: 100, max: 500, step: 50, unit: 5.0, on: true,
      why: '암 수술은 횟수·종류에 따라 비용 편차가 큽니다. 수술마다 보장받아 부담을 낮춥니다.',
      how: '암 치료를 직접 목적으로 한 수술 시 수술 1회당 가입금액을 지급합니다.',
    },
    {
      id: 'c4', cat: 'brainHeart', name: '뇌혈관질환 진단비',
      amount: 2000, base: 2000, min: 500, max: 3000, step: 500, unit: 2.0, on: true,
      why: '뇌출혈을 포함한 뇌혈관질환 전체를 보장합니다. 후유 관리까지 긴 비용이 듭니다.',
      how: '뇌혈관질환(I60–I69) 최초 진단 확정 시 가입금액을 지급합니다.',
      limitNote: '뇌혈관질환 진단비는 상품·업계 한도로 2,000만원을 초과하면 가입이 제한될 수 있어요.',
    },
    {
      id: 'c5', cat: 'brainHeart', name: '허혈성심장질환 진단비',
      amount: 2000, base: 2000, min: 500, max: 3000, step: 500, unit: 1.8, on: true,
      why: '심근경색 등 허혈성심장질환을 폭넓게 보장합니다.',
      how: '허혈성심장질환(I20–I25) 최초 진단 확정 시 가입금액을 지급합니다.',
      limitNote: '허혈성심장질환 진단비도 합산 한도가 적용되어 2,000만원 초과는 어려울 수 있어요.',
    },
    {
      id: 'c6', cat: 'injury', name: '상해후유장해 (3~100%)',
      amount: 10000, base: 10000, min: 5000, max: 10000, step: 1000, unit: 0.3, on: true, required: true,
      why: '사고로 인한 후유장해를 장해율에 비례해 보장하는 핵심 담보입니다.',
      how: '상해로 후유장해(3~100%) 발생 시 가입금액 × 장해지급률을 지급합니다.',
    },
    {
      id: 'c7', cat: 'injury', name: '상해사망',
      amount: 5000, base: 5000, min: 1000, max: 5000, step: 1000, unit: 0.2, on: true,
      why: '불의의 사고에 대비하는 기본 보장입니다.',
      how: '상해를 직접 원인으로 사망 시 가입금액을 지급합니다.',
    },
    {
      id: 'c8', cat: 'injury', name: '골절(치아파절 제외) 진단비',
      amount: 30, base: 30, min: 10, max: 50, step: 10, unit: 30, on: true,
      why: '활동량이 많은 시기, 골절 빈도가 높아 실속 있는 담보입니다.',
      how: '상해로 골절 진단 시 진단 1회당 가입금액을 지급합니다.',
    },
    {
      id: 'c9', cat: 'disease', name: '질병수술비 (1~5종)',
      amount: 200, base: 200, min: 50, max: 300, step: 50, unit: 8, on: true,
      why: '입원·통원 수술 전반을 종별로 보장해 잔병치레 비용을 덜어줍니다.',
      how: '질병으로 수술 시 종별 가입금액을 수술 1회당 지급합니다.',
    },
    {
      id: 'c10', cat: 'disease', name: '16대 질병 진단비',
      amount: 1000, base: 1000, min: 500, max: 2000, step: 500, unit: 4, on: false,
      why: '소아 주요 질병을 폭넓게 묶어 보장합니다. 선택 시 보장 공백을 줄입니다.',
      how: '약관상 16대 질병 최초 진단 확정 시 가입금액을 지급합니다.',
    },
    {
      id: 'c11', cat: 'hospital', name: '질병입원일당 (1일이상)',
      amount: 3, base: 3, min: 1, max: 5, step: 1, unit: 1500, on: true, unitLabel: '만원/일',
      why: '입원 1일부터 일당을 받아 간병·생활비 공백을 메웁니다.',
      how: '질병으로 입원 시 1일당 가입금액을 (한도 일수까지) 지급합니다.',
    },
    {
      id: 'c12', cat: 'hospital', name: '상해입원일당 (1일이상)',
      amount: 3, base: 3, min: 1, max: 5, step: 1, unit: 1000, on: true, unitLabel: '만원/일',
      why: '사고 입원 시 일당으로 회복 기간의 부담을 낮춥니다.',
      how: '상해로 입원 시 1일당 가입금액을 (한도 일수까지) 지급합니다.',
    },
    {
      id: 'c13', cat: 'waiver', name: '보험료 납입면제 (특약)',
      amount: null, fixedPremium: 1200, on: true, required: true,
      why: '계약자에게 약관상 면제 사유 발생 시 이후 보험료를 면제해 보장을 지켜줍니다.',
      how: '약관에서 정한 면제 사유 발생 시 차회 이후 보험료 납입을 면제합니다.',
    },
  ],

  // ── Admin dashboard: list of created plans ──
  ADMIN_PLANS: [
    { id: 'p1', label: '김OO 13세 어린이', product: '(무)퍼펙트 어린이보장보험 2종', issued: '2026.05.28', status: 'saved',  base: 44800, customer: 38600, savedAt: '2시간 전', memo: true },
    { id: 'p2', label: '이OO 35세 남 종합', product: '(무)다이렉트 건강보험 5.0', issued: '2026.05.27', status: 'viewed', base: 92100, customer: null, savedAt: '5시간 전', memo: false },
    { id: 'p3', label: '박OO 42세 여 간편', product: '(무)간편건강보험 3·5·5', issued: '2026.05.26', status: 'saved',  base: 118400, customer: 104200, savedAt: '어제', memo: true },
    { id: 'p4', label: '최OO 7세 어린이', product: '(무)퍼펙트 어린이보장보험 2종', issued: '2026.05.25', status: 'sent',   base: 39500, customer: null, savedAt: '3일 전', memo: false },
    { id: 'p5', label: '정OO 50세 남 3대질병', product: '(무)New 3대진단비보험', issued: '2026.05.24', status: 'viewed', base: 156700, customer: null, savedAt: '4일 전', memo: false },
    { id: 'p6', label: '강OO 29세 여 실손종합', product: '(무)건강보장 종합보험', issued: '2026.05.22', status: 'saved',  base: 67300, customer: 71900, savedAt: '6일 전', memo: false },
  ],

  // 설계사가 새 설계안 생성 시 남기는 코멘트 (고객 화면 6·7에 노출)
  PLAN_AGENT_COMMENT: '안녕하세요, 김*아님. 활동량이 많은 시기를 고려해 상해·암 보장을 중심으로 설계했어요. 부담되는 담보는 끄거나 금액을 조정해 보시고, 원하시는 방향을 아래 요청사항에 남겨주시면 반영해 드릴게요.',
  PLAN_AGENT_NAME: '김설계',

  // 고객 인증 정보 — 설계사가 생성 화면(화면 3)에서 직접 입력. JSON·제안서에는 저장하지 않음.
  PLAN_AUTH: { type: 'birth', value: '130506' },

  // helper
  fmtWon(n) {
    return n.toLocaleString('ko-KR');
  },
};
