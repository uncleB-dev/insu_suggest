'use client';
/* Shell — prototype navigator + screen routing for the 화면 정의서. */

import React, { useState } from 'react';
import { Icon } from './Primitives';
import { Logo, PhoneFrame } from './Extras';
import { CustomerFlow } from './CustomerScreens';
import { LoginScreen, DashboardScreen } from './AdminScreens';
import { NewPlanScreen } from './NewPlanScreen';
import { DetailScreen } from './DetailScreen';
import { PlannerDesktop } from './PlannerDesktop';
import { CommonStatesScreen, ToastAuto } from './CommonStates';

const useS = useState;

const SCREENS = [
  { group: '설계사 (관리자)', items: [
    { key: 'login',  no: '1', label: '로그인', frame: 'desk' },
    { key: 'admin',  no: '2', label: '관리자 대시보드', frame: 'desk' },
    { key: 'new',    no: '3', label: '새 설계안 생성', frame: 'desk' },
    { key: 'detail', no: '4', label: '설계안 상세 · 비교', frame: 'desk' },
  ]},
  { group: '고객 (모바일 우선)', items: [
    { key: 'gate',    no: '5', label: '인증 게이트', frame: 'phone' },
    { key: 'planner', no: '6', label: '설계 메인 (모바일)', frame: 'phone' },
    { key: 'planner-desktop', no: '6', label: '설계 메인 (데스크탑)', frame: 'desk' },
    { key: 'saved',   no: '7', label: '저장 완료', frame: 'phone' },
  ]},
  { group: '공통', items: [
    { key: 'common', no: '8', label: '상태 (로딩·에러·빈·토스트)', frame: 'desk' },
  ]},
];
const FRAME_OF = {};
SCREENS.forEach(g => g.items.forEach(it => { FRAME_OF[it.key] = it.frame; }));

export function Shell() {
  const [screen, setScreen] = useS('planner');
  const [toast, setToast] = useS(null);

  const isPhone = FRAME_OF[screen] === 'phone';
  const adminToast = ['login', 'admin', 'new', 'detail'].includes(screen);

  const phoneLabel = (SCREENS.flatMap(g => g.items).find(i => i.key === screen) || {});

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Navigator rail */}
      <nav style={{ width: 252, flexShrink: 0, position: 'fixed', top: 0, bottom: 0, left: 0, background: '#fff', boxShadow: '1px 0 0 var(--semantic-line-normal-neutral)', display: 'flex', flexDirection: 'column', zIndex: 50 }}>
        <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid var(--semantic-line-solid-neutral)' }}>
          <Logo size={22} />
          <div style={{ fontSize: 11.5, color: 'var(--semantic-label-alternative)', marginTop: 8, lineHeight: '16px' }}>화면 정의서 · Wanted WDS 스타일</div>
        </div>
        <div className="scroll" style={{ flex: 1, overflow: 'auto', padding: '14px 12px' }}>
          {SCREENS.map(g => (
            <div key={g.group} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.03em', color: 'var(--semantic-label-assistive)', padding: '0 8px 7px' }}>{g.group}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {g.items.map(it => {
                  const on = screen === it.key;
                  return (
                    <button key={it.key} onClick={() => { setScreen(it.key); setToast(null); window.scrollTo(0, 0); }} style={{
                      display: 'flex', alignItems: 'center', gap: 9, padding: '8px 9px', borderRadius: 9, border: 'none', cursor: 'pointer', textAlign: 'left',
                      background: on ? 'rgba(0,102,255,0.08)' : 'transparent', transition: 'background .15s ease',
                    }}
                      onMouseEnter={e => { if (!on) e.currentTarget.style.background = 'var(--semantic-fill-alternative)'; }}
                      onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
                      <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                        background: on ? 'var(--semantic-primary-normal)' : 'var(--semantic-fill-strong)', color: on ? '#fff' : 'var(--semantic-label-alternative)' }}>{it.no}</span>
                      <span style={{ fontSize: 13, fontWeight: on ? 700 : 500, color: on ? 'var(--semantic-primary-strong)' : 'var(--semantic-label-neutral)' }}>{it.label}</span>
                      {it.frame === 'phone' && <Icon name="home" size={13} color="var(--semantic-label-assistive)" style={{ marginLeft: 'auto' }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--semantic-line-solid-neutral)', fontSize: 11, color: 'var(--semantic-label-assistive)', lineHeight: '16px' }}>
          고객 이름은 항상 마스킹 · 주민번호·병력 미표시
        </div>
      </nav>

      {/* Canvas */}
      <main style={{ marginLeft: 252, flex: 1, minHeight: '100vh', background: 'var(--semantic-background-normal-alternative)', position: 'relative' }}>
        {isPhone ? (
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
            <div style={{ marginBottom: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{phoneLabel.label}</div>
              <div style={{ fontSize: 12, color: 'var(--semantic-label-alternative)', marginTop: 2 }}>모바일 · 390×844</div>
            </div>
            <PhoneFrame label={phoneLabel.label}>
              <CustomerFlow step={screen} onStep={setScreen} toast={toast} setToast={setToast} />
            </PhoneFrame>
          </div>
        ) : (
          <div data-screen-label={phoneLabel.label}>
            {screen === 'login' && <div style={{ minHeight: '100vh' }}><LoginScreen onLogin={() => setScreen('admin')} /></div>}
            {screen === 'admin' && <DashboardScreen onNew={() => setScreen('new')} onOpen={() => setScreen('detail')} setToast={setToast} />}
            {screen === 'new' && <NewPlanScreen onBack={() => setScreen('admin')} onDone={() => setScreen('admin')} setToast={setToast} />}
            {screen === 'detail' && <DetailScreen onBack={() => setScreen('admin')} onNew={() => setScreen('new')} setToast={setToast} />}
            {screen === 'planner-desktop' && <PlannerDesktop toast={toast} setToast={setToast} />}
            {screen === 'common' && <CommonStatesScreen />}
          </div>
        )}

        {adminToast && toast && <ToastAuto {...toast} onDone={() => setToast(null)} />}
      </main>
    </div>
  );
}
