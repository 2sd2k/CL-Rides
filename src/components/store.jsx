'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SEED_APPROVED, SEED_NOTIFICATIONS, STORAGE_KEY, loadState, saveState } from '@/lib/data';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const router = useRouter();

  const [approved, setApproved] = useState(SEED_APPROVED);
  const [members, setMembers]   = useState({});
  const [rides, setRides]       = useState([]);
  const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS);
  const [notificationOwners, setNotificationOwners] = useState([]);
  const [session, setSession]   = useState(null);
  const [modal, setModal]       = useState(null);
  const [toast, setToast]       = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const s = loadState();
    const t = setTimeout(() => {
      if (s) {
        setApproved(s.approved);
        setMembers(s.members);
        setRides(s.rides || []);
        setNotifications(s.notifications || SEED_NOTIFICATIONS);
        setNotificationOwners(s.notificationOwners || []);
        setSession(s.session);
      }
      setHydrated(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (hydrated) saveState({ approved, members, rides, notifications, notificationOwners, session });
  }, [hydrated, approved, members, rides, notifications, notificationOwners, session]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = useCallback((msg, kind = 'ok') => setToast({ msg, kind }), []);

  const initializeNotificationOwner = useCallback((ownerKey) => {
    if (!ownerKey || notificationOwners.includes(ownerKey)) return;
    setNotifications((current) => current.map((notification) => {
      if (notification.scope !== 'all' || notification.readBy?.includes(ownerKey)) return notification;
      return { ...notification, readBy: [...(notification.readBy || []), ownerKey] };
    }));
    setNotificationOwners((current) => [...current, ownerKey]);
  }, [notificationOwners]);

  const signInWithEmail = useCallback((email, name) => {
    const e = email.trim().toLowerCase();
    if (!e) return;
    const approvedRec = approved[e];
    const memberRec = members[e];
    const isFirstAccountOpen = !memberRec;
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
    if (isFirstAccountOpen) initializeNotificationOwner(e);
    router.push('/events');
  }, [approved, members, router, showToast, initializeNotificationOwner]);

  const signInAsGuest = useCallback(() => {
    setSession({ email: null, name: 'Guest', role: 'guest', isGuest: true });
    initializeNotificationOwner('guest');
    showToast('Signed in as guest');
    router.push('/events');
  }, [router, showToast, initializeNotificationOwner]);

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

  const getSessionRideKey = useCallback(() => {
    if (!session) return null;
    return session.email || 'guest';
  }, [session]);

  const addRideSignup = useCallback(({ event, rider }) => {
    const ownerKey = getSessionRideKey();
    if (!ownerKey) return;
    setRides((current) => [
      {
        id: `${event.id}-${Date.now()}`,
        ownerKey,
        eventId: event.id,
        eventName: event.name,
        date: event.date,
        dateISO: event.dateISO,
        time: event.time,
        location: event.location,
        color: event.color,
        riderName: rider.name,
        phone: rider.phone,
        pickup: rider.pickup,
        riderCount: rider.riders,
        driverName: null,
        createdAt: Date.now(),
      },
      ...current,
    ]);
  }, [getSessionRideKey]);

  const markNotificationsRead = useCallback((ids) => {
    const ownerKey = getSessionRideKey();
    if (!ownerKey || ids.length === 0) return;
    setNotifications((current) => current.map((notification) => {
      if (!ids.includes(notification.id) || notification.readBy?.includes(ownerKey)) return notification;
      return { ...notification, readBy: [...(notification.readBy || []), ownerKey] };
    }));
  }, [getSessionRideKey]);

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
    setRides([]);
    setNotifications(SEED_NOTIFICATIONS);
    setNotificationOwners([]);
    setSession(null);
    showToast('Demo data reset');
    router.push('/signin');
  }, [router, showToast]);

  const value = {
    approved, members, rides, notifications, notificationOwners, session, modal, toast, hydrated,
    setMembers, setModal, addRideSignup, getSessionRideKey, markNotificationsRead,
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
