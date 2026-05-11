'use client';

import React, { useState } from 'react';
import { useStore } from '../store';
import { Topbar, Stat, btnPrimary } from '../ui';

export function AdminScreen() {
  const { approved, members, setModal, updateApprovedRole, revokeApproved } = useStore();
  const [filter, setFilter] = useState('all');

  const entries     = Object.entries(approved);
  const memberCount = Object.keys(members).length;
  const driverCount = entries.filter(([, v]) => v.role === 'driver').length;
  const adminCount  = entries.filter(([, v]) => v.role === 'admin').length;
  const visible     = entries.filter(([, v]) => filter === 'all' || v.role === filter);

  return (
    <>
      <Topbar
        crumbs={['Admin', 'Driver access']}
        right={
          <button style={btnPrimary({})} onClick={() => setModal({ type: 'addemail' })}>
            <i className="ti ti-plus" style={{ fontSize: 13, verticalAlign: -1, marginRight: 4 }} />
            Add email
          </button>
        }
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-.4px', marginBottom: 4 }}>Driver access</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 560 }}>
              Anyone can sign up as a rider, but offering to drive is restricted. Add an email here to let that person sign in as an approved driver.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            <Stat label="Approved drivers" value={driverCount} icon="ti-steering-wheel" />
            <Stat label="Admins"            value={adminCount}  icon="ti-crown" />
            <Stat label="Rider members"     value={memberCount} icon="ti-users" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', border: '0.5px solid var(--border-1)', borderRadius: 'var(--r-md)', padding: 3 }}>
              {[
                { k: 'all',    l: `All (${entries.length})` },
                { k: 'driver', l: `Drivers (${driverCount})` },
                { k: 'admin',  l: `Admins (${adminCount})` },
              ].map((t) => (
                <button key={t.k} onClick={() => setFilter(t.k)} style={{
                  padding: '5px 12px', fontSize: 12, fontWeight: 500, borderRadius: 6,
                  background: filter === t.k ? 'var(--purple-100)' : 'transparent',
                  color:      filter === t.k ? 'var(--purple-700)' : 'var(--text-2)',
                }}>{t.l}</button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
              <i className="ti ti-info-circle" style={{ fontSize: 13, verticalAlign: -2, marginRight: 4 }} />
              Riders don&apos;t need to be added — they self-serve.
            </div>
          </div>

          <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border-1)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1.4fr 1.6fr .9fr .6fr',
              padding: '11px 18px',
              fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 500,
              borderBottom: '0.5px solid var(--border-1)',
              background: 'var(--surface-2)',
            }}>
              <div>Name</div>
              <div>Email</div>
              <div>Role</div>
              <div></div>
            </div>
            {visible.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                No entries match this filter.
              </div>
            )}
            {visible.map(([email, rec]) => (
              <AdminRow
                key={email}
                email={email}
                rec={rec}
                onRoleChange={(role) => updateApprovedRole(email, role)}
                onRevoke={() => revokeApproved(email)}
              />
            ))}
          </div>

          <div style={{
            marginTop: 18, padding: '14px 18px',
            background: 'var(--surface)', border: '0.5px solid var(--border-1)', borderRadius: 'var(--r-lg)',
            display: 'flex', gap: 14, alignItems: 'flex-start',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--purple-100)', color: 'var(--purple-700)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <i className="ti ti-shield-lock" style={{ fontSize: 18 }} />
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.55 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-1)', marginBottom: 3 }}>How permissions work</div>
              When someone signs in with an email on this list, they&apos;re automatically given the role you set. Emails not on this list become rider-members. Guests don&apos;t need to sign in at all, but their info isn&apos;t saved.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function AdminRow({ email, rec, onRoleChange, onRevoke }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1.4fr 1.6fr .9fr .6fr',
      alignItems: 'center',
      padding: '13px 18px',
      borderBottom: '0.5px solid var(--border-1)',
      fontSize: 13,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'var(--purple-100)', color: 'var(--purple-700)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 600,
        }}>{rec.name.split(' ').map((s) => s[0]).join('').slice(0, 2)}</div>
        <div style={{ fontWeight: 500 }}>{rec.name}</div>
      </div>
      <div className="mono" style={{ fontSize: 12, color: 'var(--text-2)' }}>{email}</div>
      <div>
        <select value={rec.role} onChange={(e) => onRoleChange(e.target.value)} style={{
          fontSize: 12, fontWeight: 500,
          padding: '4px 10px',
          background: rec.role === 'admin' ? 'var(--purple-100)' : 'var(--green-100)',
          color:      rec.role === 'admin' ? 'var(--purple-700)' : 'var(--green-700)',
          border: 'none', borderRadius: 20,
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath d='M2 4l3 3 3-3' stroke='currentColor' stroke-width='1.4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
          paddingRight: 24,
          cursor: 'pointer',
        }}>
          <option value="driver">Driver</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div style={{ textAlign: 'right' }}>
        {confirm ? (
          <div style={{ display: 'inline-flex', gap: 5 }}>
            <button onClick={onRevoke} style={{
              fontSize: 11, fontWeight: 500, padding: '5px 10px', borderRadius: 6,
              background: 'var(--red-500)', color: 'white',
            }}>Confirm</button>
            <button onClick={() => setConfirm(false)} style={{
              fontSize: 11, fontWeight: 500, padding: '5px 10px', borderRadius: 6,
              border: '0.5px solid var(--border-1)',
            }}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setConfirm(true)} style={{
            fontSize: 11, fontWeight: 500, padding: '5px 10px', borderRadius: 6,
            color: 'var(--text-2)', border: '0.5px solid var(--border-1)',
          }}>Revoke</button>
        )}
      </div>
    </div>
  );
}
