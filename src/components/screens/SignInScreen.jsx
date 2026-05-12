'use client';

import React, { useState } from 'react';
import { useStore } from '../store';
import { EVENTS } from '@/lib/data';

export function SignInScreen() {
  const { signInWithEmail, signInAsGuest } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function handleSignIn() {
    const e = email.trim().toLowerCase();
    if (!e || !e.includes('@')) { setError('Enter a valid email'); return; }
    setError('');
    signInWithEmail(e);
  }

  function handleRegister() {
    const e = email.trim().toLowerCase();
    if (!e || !e.includes('@')) { setError('Enter a valid email'); return; }
    if (!name.trim()) { setError('Enter your name'); return; }
    setError('');
    signInWithEmail(e, name);
  }

  function openModal(step = 'signin') {
    setModalStep(step);
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  return (
    <div style={{ background: '#26215C', height: '100vh', overflowY: 'auto', fontFamily: 'var(--font-inter, system-ui, sans-serif)', position: 'relative' }}>

      {/* Navbar */}
      <nav style={{ height: 66, minHeight: 66, maxHeight: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px 0 40px', borderBottom: '0.5px solid rgba(255,255,255,.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(255,255,255,.12)', border: '0.5px solid rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-car" style={{ color: 'white', fontSize: 14 }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'white' }}>CL Rides</span>
        </div>
        <button
          onClick={() => openModal('signin')}
          style={{
            height: 44,
            padding: '0 18px',
            background: 'rgba(255,255,255,.12)',
            border: '0.5px solid rgba(255,255,255,.2)',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 800,
            color: 'white',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
          }}
        >
          <i className="ti ti-user" style={{ fontSize: 14 }} />
          Log in
        </button>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '64px 40px 44px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.1)', border: '0.5px solid rgba(255,255,255,.2)', borderRadius: 20, padding: '5px 14px', fontSize: 11, color: 'rgba(255,255,255,.7)', marginBottom: 22 }}>
          <i className="ti ti-building-church" style={{ fontSize: 12 }} />
          Lighthouse Bible Church · College Life
        </div>
        <div style={{ fontSize: 38, fontWeight: 500, color: 'white', lineHeight: 1.2, marginBottom: 14 }}>
          Welcome. We&apos;re glad<br />you&apos;re here.
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', lineHeight: 1.7, maxWidth: 400, margin: '0 auto 36px' }}>
          CL Rides connects College Life members so nobody misses out on an event because of transportation. Find a seat — we&apos;ll get you there.
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <button
            onClick={signInAsGuest}
            style={{ padding: '14px 32px', background: 'white', color: '#26215C', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 9, boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}
          >
            <i className="ti ti-search" style={{ fontSize: 17 }} />
            First time at Lighthouse? Browse events &amp; find a ride
          </button>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', lineHeight: 1.7 }}>
          First time? Browse events and find a ride as a guest — no account needed.
          <br />
          <button
            onClick={() => openModal('register')}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', padding: 0, marginTop: 4 }}
          >
            Register for an account to save your info
          </button>
        </div>
      </div>

      {/* Events section */}
      <div style={{ padding: '52px 40px 0' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', letterSpacing: '.5px', marginBottom: 14, textAlign: 'center' }}>UPCOMING EVENTS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, maxWidth: 680, margin: '0 auto' }}>
          {EVENTS.map((ev) => (
            <div key={ev.id} style={{ background: 'rgba(255,255,255,.07)', border: '0.5px solid rgba(255,255,255,.12)', borderRadius: 12, padding: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: ev.color, marginBottom: 10 }} />
              <div style={{ fontSize: 13, fontWeight: 500, color: 'white', marginBottom: 6 }}>{ev.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                <i className="ti ti-calendar" style={{ fontSize: 12 }} />
                {ev.date} · {ev.time}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <i className="ti ti-map-pin" style={{ fontSize: 12 }} />
                {ev.location}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '36px 40px', textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,.2)', marginTop: 36, borderTop: '0.5px solid rgba(255,255,255,.07)' }}>
        Lighthouse Bible Church · College Life · CL Rides v1.0
      </div>

      {/* Login / Register modal */}
      {modalOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
        >
          <div style={{ background: 'white', borderRadius: 16, padding: 28, width: 340, boxShadow: '0 24px 64px rgba(0,0,0,.3)' }}>

            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#1A1726' }}>
                {modalStep === 'signin' ? 'Welcome back' : 'Create an account'}
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#aaa', lineHeight: 1, padding: 0 }}>
                <i className="ti ti-x" />
              </button>
            </div>
            <div style={{ fontSize: 12, color: '#52506A', marginBottom: 22, lineHeight: 1.55 }}>
              {modalStep === 'signin'
                ? 'Sign in to keep your rides and contact info saved.'
                : 'Register to save your ride history and contact details.'}
            </div>

            {/* Name field (register only) */}
            {modalStep === 'register' && (
              <>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#52506A', marginBottom: 5 }}>Full name</div>
                <div style={{ position: 'relative', marginBottom: 14 }}>
                  <i className="ti ti-user" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: '#aaa', pointerEvents: 'none' }} />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(''); }}
                    style={{ width: '100%', padding: '9px 10px 9px 32px', border: '0.5px solid #D9D7CF', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </>
            )}

            {/* Email field */}
            <div style={{ fontSize: 12, fontWeight: 500, color: '#52506A', marginBottom: 5 }}>Email address</div>
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <i className="ti ti-mail" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: '#aaa', pointerEvents: 'none' }} />
              <input
                autoFocus={modalStep === 'signin'}
                type="email"
                placeholder="you@grace.org"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && (modalStep === 'signin' ? handleSignIn() : handleRegister())}
                style={{ width: '100%', padding: '9px 10px 9px 32px', border: '0.5px solid #D9D7CF', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Password field */}
            <div style={{ fontSize: 12, fontWeight: 500, color: '#52506A', marginBottom: 5 }}>Password</div>
            <div style={{ position: 'relative', marginBottom: error ? 8 : 20 }}>
              <i className="ti ti-lock" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: '#aaa', pointerEvents: 'none' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (modalStep === 'signin' ? handleSignIn() : handleRegister())}
                style={{ width: '100%', padding: '9px 10px 9px 32px', border: '0.5px solid #D9D7CF', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {error && <div style={{ fontSize: 12, color: '#D85A30', marginBottom: 10 }}>{error}</div>}

            {/* Primary action */}
            <button
              onClick={modalStep === 'signin' ? handleSignIn : handleRegister}
              style={{ width: '100%', padding: 10, background: '#534AB7', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', marginBottom: 12 }}
            >
              {modalStep === 'signin' ? 'Sign in' : 'Create account'}
              <i className="ti ti-arrow-right" style={{ fontSize: 12, verticalAlign: -1, marginLeft: 4 }} />
            </button>

            {/* Toggle between sign in / register */}
            <div style={{ textAlign: 'center' }}>
              {modalStep === 'signin' ? (
                <button
                  onClick={() => { setModalStep('register'); setError(''); setPassword(''); }}
                  style={{ background: 'none', border: 'none', fontSize: 12, color: '#534AB7', cursor: 'pointer' }}
                >
                  Don&apos;t have an account? Register here
                </button>
              ) : (
                <button
                  onClick={() => { setModalStep('signin'); setError(''); setName(''); }}
                  style={{ background: 'none', border: 'none', fontSize: 12, color: '#534AB7', cursor: 'pointer' }}
                >
                  Already have an account? Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
