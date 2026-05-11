'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Field, inputStyle, btnPrimary, btnGhost, Bullet, LookupHint, Divider } from '../ui';

export function SignInScreen() {
  const { approved, members, signInWithEmail, signInAsGuest } = useStore();
  const [email, setEmail] = useState('');
  const [step, setStep]   = useState('email');
  const [name, setName]   = useState('');
  const [error, setError] = useState('');

  function check() {
    const e = email.trim().toLowerCase();
    if (!e || !e.includes('@')) { setError('Enter a valid email'); return; }
    setError('');
    if (approved[e] || members[e]) {
      signInWithEmail(e);
    } else {
      setStep('name');
    }
  }

  const lookup = useMemo(() => {
    const e = email.trim().toLowerCase();
    if (!e) return null;
    if (approved[e]) return { kind: 'approved', rec: approved[e] };
    if (members[e])  return { kind: 'member',   rec: members[e] };
    return { kind: 'new' };
  }, [email, approved, members]);

  return (
    <div style={{
      height: '100vh',
      display: 'grid',
      gridTemplateColumns: '1.05fr 1fr',
      background: 'var(--bg)',
    }}>
      <div style={{
        background: 'linear-gradient(165deg, #26215C 0%, #3C3489 70%, #534AB7 130%)',
        color: 'white',
        padding: '56px 64px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 80% 110%, rgba(199,195,240,.25), transparent 55%), radial-gradient(circle at 10% 0%, rgba(127,119,221,.35), transparent 45%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '0.5px solid rgba(255,255,255,.2)',
          }}>
            <i className="ti ti-steering-wheel" style={{ fontSize: 20 }} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-.2px' }}>CL Rides</div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', maxWidth: 480 }}>
          <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: '-.8px', lineHeight: 1.1, marginBottom: 18 }}>
            Get to where you’re going, together.
          </div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,.7)', lineHeight: 1.6, marginBottom: 32 }}>
            Sign in with your email to keep your rides, contact info and history saved across devices. No password — we’ll recognise you next time.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, color: 'rgba(255,255,255,.85)', fontSize: 13 }}>
            <Bullet icon="ti-mail" text="Sign in with email — your profile stays saved" />
            <Bullet icon="ti-user-question" text="No account? Continue as a guest, no commitment" />
            <Bullet icon="ti-shield-check" text="Drivers are approved by your community admin" />
          </div>
        </div>

        <div style={{ position: 'relative', fontSize: 11, color: 'rgba(255,255,255,.45)' }}>
          Grace Community Church · v1.0
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ fontSize: 11, letterSpacing: '.8px', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 10 }}>
            {step === 'email' ? 'Sign in' : 'Welcome'}
          </div>
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-.5px', marginBottom: 8 }}>
            {step === 'email' ? 'Continue with email' : 'One more thing'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 28 }}>
            {step === 'email'
              ? 'We’ll recognise approved drivers and admins automatically.'
              : 'What should we call you?'}
          </div>

          {step === 'email' && (
            <>
              <Field label="Email">
                <div style={{ position: 'relative' }}>
                  <i className="ti ti-mail" style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 16, color: 'var(--text-3)',
                  }} />
                  <input
                    type="email"
                    autoFocus
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && check()}
                    placeholder="you@grace.org"
                    style={inputStyle({ padded: true })}
                  />
                </div>
              </Field>

              {error && <div style={{ fontSize: 12, color: 'var(--red-500)', marginTop: -12, marginBottom: 14 }}>{error}</div>}

              {lookup?.kind === 'approved' && (
                <LookupHint kind={lookup.rec.role} text={`Recognised as ${lookup.rec.name} · ${lookup.rec.role === 'admin' ? 'Admin' : 'Approved driver'}`} />
              )}
              {lookup?.kind === 'member' && (
                <LookupHint kind="member" text={`Welcome back, ${lookup.rec.name}`} />
              )}
              {lookup?.kind === 'new' && email.includes('@') && (
                <LookupHint kind="new" text="New here — we’ll create a rider account" />
              )}

              <button onClick={check} style={btnPrimary({ block: true, mt: 18 })}>
                Continue <i className="ti ti-arrow-right" style={{ fontSize: 14, verticalAlign: -2, marginLeft: 4 }} />
              </button>

              <Divider label="or" />

              <button onClick={signInAsGuest} style={btnGhost({ block: true })}>
                <i className="ti ti-user" style={{ fontSize: 15, verticalAlign: -2, marginRight: 6 }} />
                Continue as guest
              </button>

              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 18, lineHeight: 1.6 }}>
                Guests can sign up for rides, but need to re-enter contact details each time. Drivers must be approved by an admin — <a style={{ color: 'var(--purple-600)', textDecoration: 'none' }} href="#">how to get approved</a>.
              </div>
            </>
          )}

          {step === 'name' && (
            <>
              <div style={{
                background: 'var(--purple-100)', border: '0.5px solid var(--purple-200)',
                borderRadius: 'var(--r-md)', padding: '10px 12px', marginBottom: 18,
                fontSize: 12, color: 'var(--purple-700)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <i className="ti ti-sparkles" style={{ fontSize: 15 }} />
                Creating a rider account for <span className="mono" style={{ fontWeight: 500 }}>{email.trim().toLowerCase()}</span>
              </div>
              <Field label="Your name">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && name.trim() && signInWithEmail(email, name)}
                  placeholder="e.g. Jake Lee"
                  style={inputStyle()}
                />
              </Field>
              <button
                onClick={() => name.trim() && signInWithEmail(email, name)}
                disabled={!name.trim()}
                style={btnPrimary({ block: true, mt: 8, disabled: !name.trim() })}
              >
                Create rider account
              </button>
              <button onClick={() => { setStep('email'); setName(''); }} style={{ ...btnGhost({ block: true }), marginTop: 10 }}>
                Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
