'use client';

import { useState, useEffect, useRef } from 'react';

interface Props {
  value: string; // 'YYYY-MM-DD' or ''
  onChange: (v: string) => void;
  inputStyle?: React.CSSProperties;
}

export default function DateInput({ value, onChange, inputStyle }: Props) {
  const [y, setY] = useState(value.slice(0, 4));
  const [m, setM] = useState(value.slice(5, 7));
  const [d, setD] = useState(value.slice(8, 10));
  const mRef = useRef<HTMLInputElement>(null);
  const dRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) { setY(''); setM(''); setD(''); }
  }, [value]);

  function emit(ny: string, nm: string, nd: string) {
    if (ny.length === 4 && nm.length >= 1 && nd.length >= 1) {
      onChange(`${ny}-${nm.padStart(2, '0')}-${nd.padStart(2, '0')}`);
    } else {
      onChange('');
    }
  }

  const base: React.CSSProperties = {
    background: 'none', border: 'none', outline: 'none', padding: 0,
    ...inputStyle,
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
      <input
        type="text"
        inputMode="numeric"
        placeholder="YYYY"
        maxLength={4}
        value={y}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '').slice(0, 4);
          setY(v);
          emit(v, m, d);
          if (v.length === 4) mRef.current?.focus();
        }}
        style={{ ...base, width: 44 }}
      />
      <span style={{ color: '#C8B89A', userSelect: 'none', fontWeight: 700 }}>-</span>
      <input
        ref={mRef}
        type="text"
        inputMode="numeric"
        placeholder="MM"
        maxLength={2}
        value={m}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '').slice(0, 2);
          setM(v);
          emit(y, v, d);
          if (v.length === 2) dRef.current?.focus();
        }}
        style={{ ...base, width: 28, textAlign: 'center' }}
      />
      <span style={{ color: '#C8B89A', userSelect: 'none', fontWeight: 700 }}>-</span>
      <input
        ref={dRef}
        type="text"
        inputMode="numeric"
        placeholder="DD"
        maxLength={2}
        value={d}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '').slice(0, 2);
          setD(v);
          emit(y, m, v);
        }}
        style={{ ...base, width: 28, textAlign: 'center' }}
      />
    </div>
  );
}
