'use client';

import React, { useState } from 'react';
import { useStore } from './store';
import { Field, inputStyle, btnPrimary, btnGhost, RoleCard } from './ui';

export function ModalShell({ title, subtitle, onClose, children, footer, width = 440 }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(20,18,38,.42)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: 24, animation: 'fadeIn .14s ease',
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width,
        background: 'var(--surface)', borderRadius: 'var(--r-xl)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '22px 24px 14px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-.2px' }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 3 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-3)',
          }}>
            <i className="ti ti-x" style={{ fontSize: 17 }} />
          </button>
        </div>
        <div style={{ padding: '4px 24px 18px' }}>{children}</div>
        {footer && (
          <div style={{ padding: '14px 24px', background: 'var(--surface-2)', borderTop: '0.5px solid var(--border-1)' }}>{footer}</div>
        )}
      </div>
    </div>
  );
}

export function RiderModal({ event, onClose, onDone }) {
  const { session, members, setMembers, addRideSignup } = useStore();
  const isGuest = session.isGuest;
  const memberRec = !isGuest && session.email ? members[session.email] : null;

  const [name, setName]     = useState(memberRec?.name  || (!isGuest ? session.name : ''));
  const [phone, setPhone]   = useState(memberRec?.phone || '');
  const [pickup, setPickup] = useState('');
  const [riders, setRiders] = useState(1);
  const [save, setSave]     = useState(!isGuest);

  function submit() {
    if (!isGuest && save && session.email) {
      setMembers((m) => ({ ...m, [session.email]: { name, phone, lastSeen: Date.now() } }));
    }
    addRideSignup({ event, rider: { name, phone, pickup, riders } });
    onDone();
  }

  const valid = name.trim() && phone.trim() && pickup.trim();

  return (
    <ModalShell
      title={`Sign up — ${event.name}`}
      subtitle={`${event.date} · ${event.time}`}
      onClose={onClose}
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>
            {isGuest ? 'Sign in to skip this next time.' : save ? 'Your info will be saved to your profile.' : "Your info won't be saved."}
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={onClose} style={btnGhost({})}>Cancel</button>
            <button onClick={submit} disabled={!valid} style={btnPrimary({ disabled: !valid })}>
              <i className="ti ti-check" style={{ fontSize: 14, verticalAlign: -2, marginRight: 5 }} />
              Confirm sign-up
            </button>
          </div>
        </div>
      }
    >
      {isGuest && (
        <div style={{
          background: 'var(--amber-100)', color: 'var(--amber-700)',
          padding: '10px 12px', borderRadius: 'var(--r-md)',
          fontSize: 12, marginBottom: 14,
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <i className="ti ti-info-circle" style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }} />
          <span>You&apos;re signing up as a guest. Your contact info won&apos;t be saved — you&apos;ll need to re-enter it next time.</span>
        </div>
      )}

      <Field label="Full name">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jordan Kim" style={inputStyle()} />
      </Field>
      <Field label="Phone (so your driver can reach you)">
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" style={inputStyle()} />
      </Field>
      <Field label="Pickup location">
        <input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="e.g. Dorm lobby, north entrance" style={inputStyle()} />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
        <Field label="Number of riders">
          <select value={riders} onChange={(e) => setRiders(+e.target.value)} style={inputStyle()}>
            {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>)}
          </select>
        </Field>
      </div>

      {!isGuest && (
        <label style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginTop: 14, fontSize: 12, color: 'var(--text-2)',
          cursor: 'pointer',
        }}>
          <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} style={{ accentColor: 'var(--purple-600)' }} />
          Save these details to my profile for next time
        </label>
      )}
    </ModalShell>
  );
}

export function DriverModal({ event, onClose, onDone }) {
  const { session } = useStore();
  const [seats, setSeats]     = useState(3);
  const [vehicle, setVehicle] = useState('');
  const [pickup, setPickup]   = useState('');

  return (
    <ModalShell
      title={`Offer to drive — ${event.name}`}
      subtitle={`${event.date} · ${event.time}`}
      onClose={onClose}
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btnGhost({})}>Cancel</button>
          <button onClick={onDone} style={btnPrimary({})}>
            <i className="ti ti-steering-wheel" style={{ fontSize: 14, verticalAlign: -2, marginRight: 5 }} />
            Post offer
          </button>
        </div>
      }
    >
      <div style={{
        background: 'var(--purple-100)', color: 'var(--purple-700)',
        padding: '10px 12px', borderRadius: 'var(--r-md)',
        fontSize: 12, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <i className="ti ti-shield-check" style={{ fontSize: 15 }} />
        You&apos;re signed in as an approved driver ({session.name}).
      </div>

      <Field label="Available seats">
        <select value={seats} onChange={(e) => setSeats(+e.target.value)} style={inputStyle()}>
          {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} seat{n === 1 ? '' : 's'}</option>)}
        </select>
      </Field>
      <Field label="Vehicle (optional)">
        <input value={vehicle} onChange={(e) => setVehicle(e.target.value)} placeholder="e.g. Blue Honda CR-V" style={inputStyle()} />
      </Field>
      <Field label="Pickup area (optional)">
        <input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="e.g. North side, near Maple Ave" style={inputStyle()} />
      </Field>
    </ModalShell>
  );
}

export function AddEmailModal({ onClose, onSubmit }) {
  const [email, setEmail] = useState('');
  const [name, setName]   = useState('');
  const [role, setRole]   = useState('driver');

  const valid = email.trim() && email.includes('@') && name.trim();

  return (
    <ModalShell
      title="Grant access"
      subtitle="Add an email to give that person driver or admin permissions when they sign in."
      onClose={onClose}
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btnGhost({})}>Cancel</button>
          <button onClick={() => valid && onSubmit(email, name, role)} disabled={!valid} style={btnPrimary({ disabled: !valid })}>
            Add to list
          </button>
        </div>
      }
    >
      <Field label="Email">
        <input autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="newdriver@grace.org" style={inputStyle()} />
      </Field>
      <Field label="Name (for the directory)">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Avery Okafor" style={inputStyle()} />
      </Field>
      <Field label="Role">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <RoleCard active={role === 'driver'} onClick={() => setRole('driver')} icon="ti-steering-wheel" title="Driver" body="Can offer to drive on any event." />
          <RoleCard active={role === 'admin'}  onClick={() => setRole('admin')}  icon="ti-crown"          title="Admin"  body="Driver + can manage this list." />
        </div>
      </Field>
    </ModalShell>
  );
}

export function ModalOutlet() {
  const { modal, setModal, addApproved, showToast } = useStore();
  if (!modal) return null;
  if (modal.type === 'rider') {
    return (
      <RiderModal
        event={modal.event}
        onClose={() => setModal(null)}
        onDone={() => { setModal(null); showToast("You're signed up as a rider"); }}
      />
    );
  }
  if (modal.type === 'driver') {
    return (
      <DriverModal
        event={modal.event}
        onClose={() => setModal(null)}
        onDone={() => { setModal(null); showToast('Your offer to drive is posted'); }}
      />
    );
  }
  if (modal.type === 'addemail') {
    return (
      <AddEmailModal
        onClose={() => setModal(null)}
        onSubmit={(email, name, role) => { addApproved(email, name, role); setModal(null); }}
      />
    );
  }
  return null;
}
