'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/components/store';
import { Topbar, Pill } from '@/components/ui';

const roleMeta = {
  admin: { label: 'Admin', pill: 'purple', icon: 'ti-crown' },
  driver: { label: 'Driver', pill: 'open', icon: 'ti-steering-wheel' },
  rider: { label: 'Rider', pill: 'neutral', icon: 'ti-user' },
};

function getInitials(name, email) {
  const source = name || email || 'Member';
  return source.split(/[ @.]+/).filter(Boolean).map((s) => s[0]).join('').slice(0, 2).toUpperCase();
}

function getRole(email, approved) {
  return approved[email]?.role || 'rider';
}

export default function MembersPage() {
  const { approved, members, session, hydrated } = useStore();
  const [query, setQuery] = useState('');

  const memberRows = useMemo(() => {
    const emails = new Set([...Object.keys(members), ...Object.keys(approved)]);
    return [...emails]
      .map((email) => {
        const role = getRole(email, approved);
        const name = members[email]?.name || approved[email]?.name || email.split('@')[0];
        return { email, name, role };
      })
      .sort((a, b) => {
        const roleOrder = { admin: 0, driver: 1, rider: 2 };
        return roleOrder[a.role] - roleOrder[b.role] || a.name.localeCompare(b.name);
      });
  }, [approved, members]);

  const visibleMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return memberRows;
    return memberRows.filter((member) => {
      const roleLabel = roleMeta[member.role]?.label || member.role;
      return [
        member.name,
        member.email,
        member.role,
        roleLabel,
      ].some((value) => value.toLowerCase().includes(q));
    });
  }, [memberRows, query]);

  if (!hydrated || !session || session.isGuest) return null;

  return (
    <>
      <Topbar crumbs={['Community', 'Members']} />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.4px', marginBottom: 4 }}>Members</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
              People with accounts or approved access in CL Rides.
            </div>
          </div>

          <div style={{ position: 'relative', marginBottom: 14 }}>
            <i className="ti ti-search" style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 16,
              color: 'var(--text-3)',
              pointerEvents: 'none',
            }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search members by name, email, or role"
              style={{
                width: '100%',
                height: 42,
                padding: '0 14px 0 40px',
                borderRadius: 'var(--r-md)',
                border: '0.5px solid var(--border-1)',
                background: 'var(--surface)',
                boxShadow: 'var(--shadow-sm)',
                fontSize: 13,
                color: 'var(--text-1)',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border-1)', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1.5fr .7fr',
              padding: '11px 18px',
              fontSize: 11,
              color: 'var(--text-3)',
              textTransform: 'uppercase',
              letterSpacing: '.5px',
              fontWeight: 700,
              borderBottom: '0.5px solid var(--border-1)',
              background: 'var(--surface-2)',
            }}>
              <div>Name</div>
              <div>Email</div>
              <div>Role</div>
            </div>
            {visibleMembers.length === 0 && (
              <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                No members found
              </div>
            )}
            {visibleMembers.map((member) => (
              <MemberRow key={member.email} member={member} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function MemberRow({ member }) {
  const meta = roleMeta[member.role] || roleMeta.rider;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.4fr 1.5fr .7fr',
      alignItems: 'center',
      padding: '14px 18px',
      borderBottom: '0.5px solid var(--border-1)',
      fontSize: 13,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: member.role === 'rider' ? 'var(--surface-2)' : 'var(--purple-100)',
          color: member.role === 'rider' ? 'var(--text-2)' : 'var(--purple-700)',
          border: '0.5px solid var(--border-1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 800,
          flexShrink: 0,
        }}>
          {getInitials(member.name, member.email)}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name}</div>
        </div>
      </div>
      <div className="mono" style={{ fontSize: 12, color: 'var(--text-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.email}</div>
      <div>
        <Pill kind={meta.pill}>
          <i className={`ti ${meta.icon}`} style={{ fontSize: 11, verticalAlign: -1, marginRight: 4 }} />
          {meta.label}
        </Pill>
      </div>
    </div>
  );
}
