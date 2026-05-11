'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SEED_APPROVED, STORAGE_KEY, loadState, saveState } from '@/lib/data';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const router = useRouter();

  const [approved, setApproved] = useState(SEED_APPROVED);
  const [members, setMembers]   = useState({});
  const [session, setSession]   = useState(null);
  const [modal, setModal]       = useState(null);
  const [toast, setToast]       = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const s = loadState();
    if (s) {
      setApproved(s.approved);
      setMembers(s.members);
      setSession(s.session);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState({ approved, members, session });
  }, [hydrated, approved, members, session]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = useCallback((msg, kind = 'ok') => setToast({ msg, kind }), []);

  const signInWithEmail = useCallback((email, name) => {
    const e = email.trim().toLowerCase();
    if (!e) return;
    const approvedRec = approved[e];
    const memberRec = members[e];
    if (approvedRec) {
      setSession({ email: e, name: approvedRec.name, role: approvedRec.role, isGuest: false });
      setMembers((m) => ({ ...m, [e]: { name: approvedRec.name, phone: memberRec?.phone || '', lastSeen: Date.now() } }));
      showToast(`Welcome back, ${approvedRec.name.split(' ')[0]}`);
    } else {
      const displayName = memberRec?.name || name || e.split('@')[0];
      setSession({ email: e, name: displayName, role: 'member', isGuest: false });
      setMembers((m) => ({ ...m, [e]: { name: displayName, phone: memberRec?.phone || '', lastSeen: Date.now() } }));
      showToast(memberRec ? `Welcome back, ${displayName.split(' ')[0]}` : 'Account created');
    }
    router.push('/events');
  }, [approved, members, router, showToast]);

  const signInAsGuest = useCallback(() => {
    setSession({ email: null, name: 'Guest', role: 'guest', isGuest: true });
    showToast('Signed in as guest');
    router.push('/events');
  }, [router, showToast]);

  const signOut = useCallback(() => {
    setSession(null);
    router.push('/signin');
  }, [router]);

  const addApproved = useCallback((email, name, role) => {
    const e = email.trim().toLowerCase();
    if (!e || !name.trim()) return;
    setApproved((a) => ({ ...a, [e]: { name: name.trim(), role } }));
    showToast(`${name.trim()} granted ${role} access`);
  }, [showToast]);

  const updateApprovedRole = useCallback((email, role) => {
    setApproved((a) => ({ ...a, [email]: { ...a[email], role } }));
    showToast('Role updated');
  }, [showToast]);

  const revokeApproved = useCallback((email) => {
    setApproved((a) => {
      const next = { ...a };
      delete next[email];
      return next;
    });
    showToast('Access revoked');
  }, [showToast]);

  const switchPersona = useCallback((kind) => {
    if (kind === 'admin')     signInWithEmail('dan@grace.org');
    if (kind === 'driver')    signInWithEmail('marcus@grace.org');
    if (kind === 'member')    signInWithEmail('jake@grace.org', 'Jake Lee');
    if (kind === 'guest')     signInAsGuest();
    if (kind === 'signedout') signOut();
  }, [signInWithEmail, signInAsGuest, signOut]);

  const resetData = useCallback(() => {
    if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
    setApproved(SEED_APPROVED);
    setMembers({});
    setSession(null);
    showToast('Demo data reset');
    router.push('/signin');
  }, [router, showToast]);

  const value = {
    approved, members, session, modal, toast, hydrated,
    setMembers, setModal,
    signInWithEmail, signInAsGuest, signOut,
    addApproved, updateApprovedRole, revokeApproved,
    switchPersona, resetData, showToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
