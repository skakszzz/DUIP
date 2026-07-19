'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState<string[]>(Array(8).fill(''));
  const [loading, setLoading] = useState(false); // sendOtp 전용
  const [verifyState, setVerifyState] = useState<'idle' | 'checking' | 'ok'>('idle');
  const [err, setErr] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const rainRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const verifyingRef = useRef(false); // 중복 호출 방지

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // 빗방울 생성
  useEffect(() => {
    const rain = rainRef.current;
    if (!rain) return;
    for (let i = 0; i < 16; i++) {
      const d = document.createElement('div');
      d.className = 'login-drop';
      const h = 14 + Math.random() * 22;
      d.style.height = h + 'px';
      d.style.left = (Math.random() * 100) + '%';
      d.style.animationDuration = (1.1 + Math.random() * 1.1) + 's';
      d.style.animationDelay = (-Math.random() * 2) + 's';
      d.style.transform = 'rotate(8deg)';
      rain.appendChild(d);
    }
    return () => { rain.innerHTML = ''; };
  }, []);

  // 꽃잎 생성
  useEffect(() => {
    const sky = skyRef.current;
    if (!sky) return;
    const colors = ['#9CB87E', '#8BAA6F', '#C9DDB4'];
    const items: HTMLElement[] = [];
    for (let i = 0; i < 5; i++) {
      const p = document.createElement('div');
      p.className = 'login-petal';
      p.style.left = (10 + Math.random() * 80) + '%';
      p.style.animationDuration = (7 + Math.random() * 5) + 's';
      p.style.animationDelay = (2 + Math.random() * 6) + 's';
      const c = colors[i % colors.length];
      p.innerHTML = `<svg viewBox="0 0 12 12" width="12" height="12"><path d="M11 10C5 11 1 7 1 2 7 1 11 5 11 10Z" fill="${c}"/></svg>`;
      sky.appendChild(p);
      items.push(p);
    }
    return () => items.forEach(p => p.remove());
  }, []);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!validEmail || loading) return;
    setLoading(true); setErr(null);
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) { setErr('메일 발송에 실패했어요. 다시 시도해 주세요.'); return; }
    setStep(2);
    setTimeout(() => codeRefs.current[0]?.focus(), 120);
  }

  async function verify(codeArr = code) {
    if (verifyingRef.current) return; // 중복 호출 차단
    const token = codeArr.join('');
    if (token.length < 8) return;
    verifyingRef.current = true;
    setVerifyState('checking'); setErr(null);
    const { error } = await createClient().auth.verifyOtp({ email: email.trim(), token, type: 'email' });
    if (error) {
      verifyingRef.current = false;
      setVerifyState('idle');
      setErr('코드가 올바르지 않아요. 이메일을 다시 확인해 주세요.');
      return;
    }
    setVerifyState('ok');
    const redirectTo = new URLSearchParams(window.location.search).get('redirect') ?? '/workspaces';
    setTimeout(() => router.replace(redirectTo), 600);
  }

  function onCodeChange(i: number, v: string) {
    const d = v.replace(/[^0-9]/g, '').slice(0, 1);
    const next = [...code]; next[i] = d; setCode(next);
    if (d && i < 7) codeRefs.current[i + 1]?.focus();
    if (d && i === 7 && next.every(c => c)) setTimeout(() => verify(next), 80);
  }

  function onCodeKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !code[i] && i > 0) codeRefs.current[i - 1]?.focus();
  }

  function onCodePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const t = (e.clipboardData.getData('text') || '').replace(/[^0-9]/g, '').slice(0, 8);
    const next = Array(8).fill('');
    t.split('').forEach((ch, i) => { next[i] = ch; });
    setCode(next);
    codeRefs.current[Math.min(t.length, 7)]?.focus();
    if (t.length === 8) setTimeout(() => verify(next), 80);
  }

  async function handleResend() {
    await createClient().auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  }

  const isKakao = typeof navigator !== 'undefined' && navigator.userAgent.includes('KAKAOTALK');

  return (
    <div style={{ minHeight: '100svh', background: '#E7DCC6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        position: 'relative', width: '100%', maxWidth: 440,
        height: '100svh', maxHeight: 900,
        background: '#FBF6EE', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(74,46,22,0.18)',
        borderRadius: 'clamp(0px, calc((100vw - 440px) * 999), 36px)',
      }}>

        {/* ── 카카오 인앱브라우저 안내 배너 ── */}
        {isKakao && (
          <div style={{
            background: '#F2E7A0', color: '#5C3A1F',
            fontSize: 12.5, fontWeight: 600, lineHeight: 1.55,
            paddingTop: 'calc(10px + env(safe-area-inset-top, 0px))',
            paddingLeft: 16, paddingRight: 16, paddingBottom: 10,
            textAlign: 'center',
          }}>
            카카오톡 브라우저에서는 설치와 로그인이 안 될 수 있어요.<br/>
            오른쪽 아래 ⋯ 메뉴에서 <b>{"'다른 브라우저로 열기'"}</b>를 눌러주세요.
          </div>
        )}

        {/* ── 하늘 씬 ── */}
        <div ref={skyRef} style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
          {/* 하늘 그라데이션 */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#FBF7EE 0%,#FCF3E2 46%,#FBEFD9 100%)' }}/>

          {/* 태양 광채 */}
          <div style={{
            position: 'absolute', left: -30, top: 36, width: 190, height: 190, borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 40%,rgba(255,246,214,.95) 0%,rgba(251,233,188,.5) 42%,rgba(251,233,188,0) 72%)',
            animation: 'loginSunPulse 6s ease-in-out infinite',
          }}/>
          <div style={{
            position: 'absolute', left: 18, top: 74, width: 58, height: 58, borderRadius: '50%',
            background: 'radial-gradient(circle at 42% 40%,#FFF4D2,#FAE3A6)',
            boxShadow: '0 0 30px rgba(250,224,160,0.6)',
            animation: 'loginSunCore 6s ease-in-out infinite',
          }}/>

          {/* 구름 */}
          <div style={{
            position: 'absolute', left: 120, top: 60, width: 80, height: 26,
            opacity: 0.7, animation: 'loginDrift 26s linear infinite', animationDelay: '-4s',
          }}>
            {[{w:50,h:24,l:0,t:6},{w:34,h:34,l:26,t:0},{w:30,h:22,l:50,t:8}].map((b,i) => (
              <div key={i} style={{ position:'absolute', width:b.w, height:b.h, left:b.l, top:b.t, borderRadius:'50%', background:'#fff' }}/>
            ))}
          </div>

          {/* 무지개 */}
          <div style={{
            position: 'absolute', right: -70, top: 30, width: 480, height: 460,
            opacity: 0, filter: 'blur(3px)',
            background: 'conic-gradient(from 0deg at 34% 82%,rgba(0,0,0,0) 24deg,#E2725B 30deg,#E8A04C 41deg,#E6C744 52deg,#7FB05A 63deg,#5C9BD6 74deg,#9B7BC9 85deg,rgba(0,0,0,0) 91deg)',
            WebkitMaskImage: 'radial-gradient(circle at 34% 82%,transparent 0,transparent 70px,#000 175px,#000 100%)',
            maskImage: 'radial-gradient(circle at 34% 82%,transparent 0,transparent 70px,#000 175px,#000 100%)',
            animation: 'loginRainbowBreathe 12s ease-in-out 1.2s infinite',
            pointerEvents: 'none',
          }}/>

          {/* 비 */}
          <div ref={rainRef} style={{ position:'absolute', right:0, top:0, width:'46%', height:'64%', pointerEvents:'none', overflow:'hidden' }}/>

          {/* 자라나는 새싹 */}
          <div style={{ position:'absolute', left:'50%', bottom:-2, transform:'translateX(-50%)', width:200, height:230 }}>
            <div style={{
              position:'absolute', left:'50%', bottom:22, transform:'translateX(-50%)',
              transformOrigin:'bottom center', width:120, height:200,
              animation:'loginSway 4.2s ease-in-out 2s infinite',
            }}>
              {/* 줄기 */}
              <div style={{
                position:'absolute', left:'50%', bottom:0,
                transform:'translateX(-50%) scaleY(0)', transformOrigin:'bottom center',
                width:5, height:120, borderRadius:3,
                background:'linear-gradient(180deg,#8BAA6F,#6E915A)',
                animation:'loginGrowStem 1s cubic-bezier(.22,.9,.3,1) .35s forwards',
              }}/>
              {/* 왼쪽 잎 */}
              <svg style={{
                position:'absolute', left:-2, bottom:74, width:62, height:46,
                opacity:0, transformOrigin:'bottom right',
                transform:'scale(0) rotate(20deg)',
                animation:'loginUnfurlL .9s cubic-bezier(.22,.9,.3,1) 1.15s forwards',
              }} viewBox="0 0 62 46" fill="none">
                <path d="M60 44 C30 46 2 32 3 8 C30 6 58 18 60 44 Z" fill="#8BAA6F"/>
                <path d="M60 44 C40 40 18 28 8 12" stroke="#6E915A" strokeWidth="1.5" fill="none" opacity="0.6"/>
              </svg>
              {/* 오른쪽 잎 */}
              <svg style={{
                position:'absolute', right:-2, bottom:86, width:62, height:46,
                opacity:0, transformOrigin:'bottom left',
                transform:'scale(0) rotate(-20deg)',
                animation:'loginUnfurlR .9s cubic-bezier(.22,.9,.3,1) 1.4s forwards',
              }} viewBox="0 0 62 46" fill="none">
                <path d="M2 44 C32 46 60 32 59 8 C32 6 4 18 2 44 Z" fill="#9CB87E"/>
                <path d="M2 44 C22 40 44 28 54 12" stroke="#6E915A" strokeWidth="1.5" fill="none" opacity="0.6"/>
              </svg>
              {/* 반짝임 */}
              {([
                {w:7,h:7,l:2, b:120,d:'2.4s'},
                {w:5,h:5,r:6, b:140,d:'3s'},
                {w:6,h:6,l:54,b:170,d:'2.7s'},
              ] as {w:number;h:number;l?:number;r?:number;b:number;d:string}[]).map((s,i) => (
                <div key={i} style={{
                  position:'absolute', borderRadius:'50%', background:'#FBE9BC', opacity:0,
                  boxShadow:'0 0 8px rgba(251,233,188,0.9)',
                  width:s.w, height:s.h, bottom:s.b,
                  ...(s.l !== undefined ? {left:s.l} : {right:s.r}),
                  animation:`loginTwinkle 3.4s ease-in-out ${s.d} infinite`,
                }}/>
              ))}
            </div>
            {/* 흙 */}
            <div style={{
              position:'absolute', left:'50%', bottom:0, transform:'translateX(-50%)',
              width:150, height:34, borderRadius:'50% / 70%',
              background:'radial-gradient(ellipse at 50% 30%,#7A5733 0%,#5E4124 70%,#4A3119 100%)',
              boxShadow:'0 6px 14px rgba(74,46,22,0.22)',
            }}>
              <div style={{
                position:'absolute', left:'50%', top:5, transform:'translateX(-50%)',
                width:120, height:14, borderRadius:'50%',
                background:'rgba(36,22,10,0.45)',
              }}/>
            </div>
          </div>
        </div>

        {/* ── 인증 카드 ── */}
        <div style={{
          position:'relative', background:'#FFFCF7',
          borderRadius:'38px 38px 0 0', padding:'30px 26px calc(26px + env(safe-area-inset-bottom))',
          boxShadow:'0 -16px 40px rgba(74,46,22,0.10)', zIndex:5,
        }}>
          {/* 뒤로가기 (step 2) */}
          {step === 2 && (
            <button onClick={() => { setStep(1); setCode(Array(8).fill('')); setErr(null); }}
              style={{ position:'absolute', left:22, top:26, width:34, height:34, borderRadius:'50%', background:'none', border:'none', cursor:'pointer', display:'grid', placeItems:'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5C3A1F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
          )}

          {/* 브랜드 */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:9, marginBottom:4 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 21c0-5 3-8 8-8-.3 5-3 8-8 8Z" fill="#7B5530"/>
              <path d="M12 21c-5 0-8-3-8-8 5 .3 8 3 8 8Z" fill="#7C9466"/>
              <path d="M12 21V11" stroke="#34200E" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize:21, color:'#5C3A1F', letterSpacing:'0.12em' }}>두잎</span>
          </div>

          {/* STEP 1: 이메일 */}
          {step === 1 && (
            <div style={{ animation:'loginStepIn .5s ease both' }}>
              <p style={{ textAlign:'center', fontSize:11, color:'#B09779', letterSpacing:'0.28em', margin:'14px 0 8px' }}>DO · IF</p>
              <h1 style={{ textAlign:'center', fontSize:24, color:'#2A1B0E', lineHeight:1.34, letterSpacing:'-0.01em', margin:'0 0 8px' }}>
                오늘부터,<br/>둘이 함께 키워요
              </h1>
              <p style={{ textAlign:'center', fontSize:13.5, color:'#8A7359', lineHeight:1.6, margin:'0 0 22px' }}>
                메일 주소만 알려주세요.<br/>
                <b style={{ color:'#7B5530' }}>비밀번호 없이</b>, 코드 하나로 시작해요.
              </p>
              <form onSubmit={sendOtp}>
                <div style={{
                  background:'#FBF6EE', borderRadius:18, padding:'15px 18px',
                  boxShadow:'inset 0 0 0 1.5px #EADFC7',
                  display:'flex', alignItems:'center', gap:10, marginBottom:14,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9A7553" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/>
                  </svg>
                  <input
                    type="email" required autoComplete="email"
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="이메일 주소"
                    style={{ flex:1, border:'none', outline:'none', background:'none', fontFamily:'inherit', fontSize:16, color:'#2A1B0E', letterSpacing:'-0.01em' }}
                  />
                </div>
                {err && <p style={{ textAlign:'center', fontSize:13, color:'#C77C6A', marginBottom:10 }}>{err}</p>}
                <button type="submit" disabled={!validEmail || loading} style={{
                  width:'100%', height:54, border:'none', borderRadius:9999,
                  background:'#5C3A1F', color:'#FBF6EE', fontFamily:'inherit',
                  fontSize:16, letterSpacing:'0.02em', cursor:'pointer',
                  boxShadow:'0 12px 26px rgba(74,46,22,0.26)',
                  opacity:(!validEmail || loading) ? 0.45 : 1, transition:'opacity .2s',
                }}>
                  {loading ? '전송 중…' : '인증 메일 보내기'}
                </button>
              </form>
              <p style={{ textAlign:'center', fontSize:11, color:'#B09779', marginTop:18, lineHeight:1.7 }}>
                계속 진행하면 두잎의 이용약관과<br/>개인정보 처리방침에 동의하게 돼요.
              </p>
            </div>
          )}

          {/* STEP 2: 코드 입력 */}
          {step === 2 && (
            <div style={{ animation:'loginStepIn .5s ease both' }}>
              <p style={{ textAlign:'center', fontSize:11, color:'#B09779', letterSpacing:'0.28em', margin:'14px 0 8px' }}>코드 입력</p>
              <h1 style={{ textAlign:'center', fontSize:24, color:'#2A1B0E', lineHeight:1.34, letterSpacing:'-0.01em', margin:'0 0 8px' }}>
                메일함을<br/>확인해 주세요
              </h1>
              <p style={{ textAlign:'center', fontSize:13.5, color:'#8A7359', lineHeight:1.6, margin:'0 0 22px' }}>
                <b style={{ color:'#7B5530' }}>{email}</b>로<br/>
                보낸 8자리 코드를 입력해요.
              </p>

              {/* 8칸 코드 입력 */}
              <div style={{ display:'flex', gap:6, justifyContent:'center', marginBottom:22 }}>
                {code.map((v, i) => (
                  <input
                    key={i}
                    ref={el => { codeRefs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={1} value={v}
                    onChange={e => onCodeChange(i, e.target.value)}
                    onKeyDown={e => onCodeKey(i, e)}
                    onPaste={onCodePaste}
                    style={{
                      width:36, height:52, textAlign:'center',
                      fontFamily:"'Gowun Dodum',monospace", fontSize:21, color:'#2A1B0E',
                      border:'none', borderRadius:14, background:'#FBF6EE', outline:'none',
                      boxShadow: v ? 'inset 0 0 0 1.5px #7C9466' : 'inset 0 0 0 1.5px #EADFC7',
                      transition:'.2s',
                    }}
                  />
                ))}
              </div>

              {err && <p style={{ textAlign:'center', fontSize:13, color:'#C77C6A', marginBottom:10 }}>{err}</p>}

              <button
                onClick={() => verify()}
                disabled={!code.every(c => c) || verifyState !== 'idle'}
                style={{
                  width:'100%', height:54, border:'none', borderRadius:9999,
                  background: verifyState === 'ok' ? '#7C9466' : '#5C3A1F',
                  color:'#FBF6EE', fontFamily:'inherit',
                  fontSize:16, letterSpacing:'0.02em', cursor:'pointer',
                  boxShadow:'0 12px 26px rgba(74,46,22,0.26)',
                  opacity:(!code.every(c => c) || verifyState === 'checking') ? 0.55 : 1,
                  transition:'all .3s',
                }}
              >
                {verifyState === 'checking' && '확인 중이에요…'}
                {verifyState === 'ok'       && '확인되었어요 🌿'}
                {verifyState === 'idle'     && '두잎 시작하기'}
              </button>

              <p style={{ textAlign:'center', marginTop:18, fontSize:13, color:'#8A7359' }}>
                메일이 오지 않았나요?{' '}
                <button onClick={handleResend} style={{
                  background:'none', border:'none', fontFamily:'inherit', fontSize:13,
                  color:'#7B5530', cursor:'pointer',
                  textDecorationLine:'underline', textUnderlineOffset:'3px', padding:0,
                }}>
                  {resent ? '코드를 다시 보냈어요 ✓' : '코드 다시 받기'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
