'use client';
/* Shared Montage-style primitives for the Wanted UI kit. */

import React, { useState, useEffect, useRef } from 'react';
import { WDS_ICONS } from '@/lib/icons';

// Icon — pulls from WDS_ICONS (icons-data)
export function Icon({ name, size = 20, color, style, ...rest }) {
  const path = (WDS_ICONS || {})[name];
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      style={{ color: color || 'currentColor', flexShrink: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: path || '' }}
      aria-hidden="true"
      {...rest}
    />
  );
}

const buttonBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  border: 'none',
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
  transition: 'background-color .2s ease, color .2s ease, box-shadow .2s ease',
  boxSizing: 'border-box',
};

const buttonSizes = {
  large:  { borderRadius: 12, padding: '12px 28px', gap: 6,  fontSize: 16,   lineHeight: '24px', letterSpacing: '0.0057em' },
  medium: { borderRadius: 10, padding: '9px 20px',  gap: 5,  fontSize: 15,   lineHeight: '22px', letterSpacing: '0.0096em' },
  small:  { borderRadius: 8,  padding: '7px 14px',  gap: 4,  fontSize: 13,   lineHeight: '18px', letterSpacing: '0.0194em' },
};

const buttonVariants = {
  'solid-primary':    { color: '#fff', background: 'var(--semantic-primary-normal)', fontWeight: 600 },
  'solid-assistive':  { color: 'var(--semantic-label-neutral)', background: 'var(--semantic-fill-normal)', fontWeight: 500, backdropFilter: 'blur(32px)' },
  'outlined-primary': { color: 'var(--semantic-primary-normal)', background: 'transparent', boxShadow: 'inset 0 0 0 1px var(--semantic-line-normal-neutral)', fontWeight: 600 },
  'outlined-assistive': { color: 'var(--semantic-label-normal)', background: 'transparent', boxShadow: 'inset 0 0 0 1px var(--semantic-line-normal-neutral)', fontWeight: 500 },
};

export function Button({ size = 'medium', variant = 'solid', color = 'primary', leadingContent, trailingContent, fullWidth, disabled, children, onClick, style, ...rest }) {
  const key = `${variant}-${color}`;
  const disStyle = disabled ? { color: 'var(--semantic-label-assistive)', background: 'var(--semantic-interaction-disable)', boxShadow: 'none', cursor: 'default', backdropFilter: 'none' } : null;
  return (
    <button
      style={{
        ...buttonBase,
        ...buttonSizes[size],
        ...(buttonVariants[key] || buttonVariants['solid-primary']),
        ...(fullWidth ? { width: '100%' } : { width: 'fit-content' }),
        ...disStyle,
        ...style,
      }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...rest}
    >
      {leadingContent}
      <span>{children}</span>
      {trailingContent}
    </button>
  );
}

const chipSizes = {
  xsmall: { borderRadius: 6,  padding: '4px 7px',  gap: 2, fontSize: 12, lineHeight: '16px' },
  small:  { borderRadius: 8,  padding: '6px 8px',  gap: 2, fontSize: 14, lineHeight: '20px' },
  medium: { borderRadius: 8,  padding: '7px 11px', gap: 3, fontSize: 15, lineHeight: '22px' },
  large:  { borderRadius: 10, padding: '9px 12px', gap: 3, fontSize: 15, lineHeight: '22px' },
};

export function Chip({ variant = 'solid', size = 'medium', active, onClick, children, leadingContent, trailingContent, style, ...rest }) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    cursor: onClick ? 'pointer' : 'default',
    fontFamily: 'inherit',
    fontWeight: 500,
    color: 'var(--semantic-label-normal)',
    transition: 'background-color .3s ease, color .3s ease, box-shadow .3s ease',
    boxSizing: 'border-box',
    flexShrink: 0,
    ...chipSizes[size],
  };
  if (variant === 'solid') {
    Object.assign(base, active
      ? { background: 'var(--semantic-inverse-background)', color: 'var(--semantic-inverse-label)' }
      : { background: 'var(--semantic-fill-alternative)' }
    );
  } else {
    Object.assign(base, active
      ? { background: 'rgba(0,102,255,0.05)', boxShadow: 'inset 0 0 0 1px rgba(0,102,255,0.43)', color: 'var(--semantic-primary-normal)' }
      : { background: 'transparent', boxShadow: 'inset 0 0 0 1px var(--semantic-line-normal-neutral)' }
    );
  }
  return (
    <div role={onClick ? 'button' : undefined} onClick={onClick} style={{ ...base, ...style }} {...rest}>
      {leadingContent}
      <span style={{ padding: '0 2px' }}>{children}</span>
      {trailingContent}
    </div>
  );
}

export function TextField({ leadingContent, trailingContent, value, onChange, placeholder, invalid, disabled, type = 'text', style, width, ...rest }) {
  const [focus, setFocus] = useState(false);
  const wrapper = {
    display: 'flex', alignItems: 'center', borderRadius: 12, border: 'none',
    boxShadow: 'var(--semantic-shadow-xsmall)',
    background: disabled ? 'var(--semantic-fill-alternative)' : 'var(--semantic-background-transparent-normal)',
    backdropFilter: disabled ? 'none' : 'blur(32px)',
    width: width || '100%',
    transition: 'background-color .2s ease',
  };
  let ring = 'inset 0 0 0 1px var(--semantic-line-normal-neutral)';
  if (disabled) ring = 'inset 0 0 0 1px var(--semantic-line-normal-alternative)';
  else if (invalid) ring = focus ? 'inset 0 0 0 2px rgba(255,66,66,0.43)' : 'inset 0 0 0 1px rgba(255,66,66,0.28)';
  else if (focus) ring = 'inset 0 0 0 2px rgba(0,102,255,0.43)';
  return (
    <div style={{ ...wrapper, ...style }}>
      <div style={{ padding: 12, width: '100%', alignItems: 'center', cursor: 'text', position: 'relative', transition: 'box-shadow .2s ease', boxShadow: ring, borderRadius: 'inherit', display: 'flex', gap: 6 }}>
        {leadingContent && <span style={{ color: 'var(--semantic-label-alternative)', display: 'flex', flexShrink: 0 }}>{leadingContent}</span>}
        <input
          type={type}
          value={value || ''}
          onChange={e => onChange && onChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            padding: '0 4px', width: '100%', minHeight: 24, background: 'transparent',
            caretColor: 'var(--semantic-primary-normal)', outline: 'none', border: 'none',
            color: disabled ? 'var(--semantic-label-alternative)' : 'var(--semantic-label-normal)',
            fontSize: 16, lineHeight: '24px', fontFamily: 'inherit',
          }}
          {...rest}
        />
        {trailingContent}
      </div>
    </div>
  );
}

export function Avatar({ name, size = 40, gradient, src }) {
  const initials = name ? name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase() : '?';
  const grad = gradient ? `var(--brand-gradient-${gradient})` : 'var(--semantic-primary-normal)';
  return (
    <div style={{
      width: size, height: size, borderRadius: 999,
      background: src ? `url(${src}) center/cover` : grad,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.36,
      flexShrink: 0,
    }}>
      {!src && initials}
    </div>
  );
}

export function CompanyMark({ gradient = 'deep', size = 56, radius = 12 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: `var(--brand-gradient-${gradient})`,
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)',
      flexShrink: 0,
    }} />
  );
}

const badgeStyles = {
  blue:    { background: 'var(--atomic-blue-95)', color: 'var(--atomic-blue-45)' },
  green:   { background: 'var(--atomic-green-50)', color: '#fff' },
  red:     { background: 'var(--atomic-red-50)', color: '#fff' },
  violet:  { background: 'rgba(91,55,237,0.10)', color: 'var(--atomic-violet-45)' },
  orange:  { background: 'rgba(255,146,0,0.16)', color: 'var(--atomic-orange-39)' },
  pink:    { background: 'rgba(232,70,205,0.12)', color: 'var(--atomic-pink-46)' },
  neutral: { background: 'var(--semantic-fill-alternative)', color: 'var(--semantic-label-neutral)' },
};

export function Badge({ tone = 'blue', children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: 6,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', lineHeight: 1.4,
      ...badgeStyles[tone],
    }}>
      {children}
    </span>
  );
}

export function Switch({ checked, onChange }) {
  return (
    <div onClick={() => onChange && onChange(!checked)} style={{
      width: 40, height: 24, borderRadius: 999,
      background: checked ? 'var(--semantic-primary-normal)' : 'var(--semantic-interaction-inactive)',
      position: 'relative', transition: 'background 200ms ease', cursor: 'pointer', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 2, left: 2, width: 20, height: 20, background: '#fff', borderRadius: 999,
        transition: 'transform 200ms ease',
        transform: checked ? 'translateX(16px)' : 'translateX(0)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      }} />
    </div>
  );
}

export function Card({ children, style, hover, ...rest }) {
  const [h, setH] = useState(false);
  return (
    <div
      style={{
        background: 'var(--semantic-background-elevated-normal)',
        borderRadius: 16,
        padding: 20,
        boxShadow: h && hover ? 'var(--semantic-shadow-small)' : 'var(--semantic-shadow-xsmall), inset 0 0 0 1px var(--semantic-line-normal-neutral)',
        transition: 'box-shadow .3s ease',
        ...style,
      }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Divider({ vertical, style }) {
  return <div style={{
    background: 'var(--semantic-line-solid-neutral)',
    ...(vertical ? { width: 1, alignSelf: 'stretch' } : { height: 1, width: '100%' }),
    ...style,
  }} />;
}
