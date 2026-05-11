const { useState, useEffect, useMemo, useRef } = React;

/* ============================================================
   DATA — seed approved emails & events
   ============================================================ */

const SEED_APPROVED = {
  "dan@grace.org":    { name: "Pastor Dan",   role: "admin"  },
  "marcus@grace.org": { name: "Marcus Tate",  role: "driver" },
  "sofia@grace.org":  { name: "Sofia Reyes",  role: "driver" },
  "ellis@grace.org":  { name: "Ellis Park",   role: "driver" },
};

const EVENTS = [
  {
    id: "sun-svc",
    name: "Sunday service",
    date: "May 11, 2026",
    time: "10:00 AM",
    duration: "1.5 hours",
    location: "Grace Community Church",
    attending: 14,
    color: "#7F77DD",
    drivers: [
      { id:"mt", name:"Marcus Tate",   seatsTotal:4, seatsTaken:2 },
      { id:"sr", name:"Sofia Reyes",   seatsTotal:3, seatsTaken:3 },
    ],
  },
  {
    id: "bible-study",
    name: "Bible study",
    date: "May 14, 2026",
    time: "7:00 PM",
    duration: "1 hour",
    location: "Tate residence",
    attending: 8,
    color: "#1D9E75",
    drivers: [
      { id:"ep", name:"Ellis Park",    seatsTotal:4, seatsTaken:1 },
    ],
  },
  {
    id: "youth-retreat",
    name: "Youth retreat",
    date: "May 16, 2026",
    time: "9:00 AM",
    duration: "All day",
    location: "Camp Hollowbrook",
    attending: 22,
    color: "#D85A30",
    drivers: [
      { id:"mt", name:"Marcus Tate",   seatsTotal:4, seatsTaken:0 },
      { id:"sr", name:"Sofia Reyes",   seatsTotal:3, seatsTaken:1 },
      { id:"ep", name:"Ellis Park",    seatsTotal:4, seatsTaken:2 },
    ],
  },
];

/* ============================================================
   PERSISTENCE
   ============================================================ */

const STORAGE_KEY = "cl_rides_state_v1";

function loadState(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
function saveState(s){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

/* ============================================================
   APP
   ============================================================ */

function App(){
  // Persistent: approved emails registry, user accounts, current session
  const initial = loadState() || {
    approved: SEED_APPROVED,
    members: {}, // email -> { name, phone, lastSeen }
    session: null, // { email|null, name, role, isGuest }
  };

  const [approved, setApproved] = useState(initial.approved);
  const [members, setMembers]   = useState(initial.members);
  const [session, setSession]   = useState(initial.session);

  const [screen, setScreen] = useState(session ? "events" : "signin");
  const [selectedEventId, setSelectedEventId] = useState("sun-svc");
  const [modal, setModal] = useState(null); // {type:'rider'|'driver'|'addemail', ...}
  const [toast, setToast] = useState(null);

  // Persist whenever core state changes
  useEffect(()=>{
    saveState({ approved, members, session });
  }, [approved, members, session]);

  // Toast auto-dismiss
  useEffect(()=>{
    if(!toast) return;
    const t = setTimeout(()=> setToast(null), 2800);
    return ()=> clearTimeout(t);
  }, [toast]);

  const showToast = (msg, kind="ok") => setToast({ msg, kind });

  /* ----- auth actions ----- */

  function signInWithEmail(email, name){
    const e = email.trim().toLowerCase();
    if(!e) return;
    const approvedRec = approved[e];
    const memberRec = members[e];
    if(approvedRec){
      // Admin/driver login
      const sess = { email:e, name: approvedRec.name, role: approvedRec.role, isGuest:false };
      setSession(sess);
      setMembers(m => ({ ...m, [e]: { name: approvedRec.name, phone: memberRec?.phone || "", lastSeen: Date.now() }}));
      setScreen("events");
      showToast(`Welcome back, ${approvedRec.name.split(" ")[0]}`);
    } else {
      // New or returning rider-member
      const displayName = memberRec?.name || name || e.split("@")[0];
      const sess = { email:e, name: displayName, role: "member", isGuest:false };
      setSession(sess);
      setMembers(m => ({ ...m, [e]: { name: displayName, phone: memberRec?.phone || "", lastSeen: Date.now() }}));
      setScreen("events");
      showToast(memberRec ? `Welcome back, ${displayName.split(" ")[0]}` : "Account created");
    }
  }

  function signInAsGuest(){
    setSession({ email:null, name:"Guest", role:"guest", isGuest:true });
    setScreen("events");
    showToast("Signed in as guest");
  }

  function signOut(){
    setSession(null);
    setScreen("signin");
  }

  /* ----- admin actions ----- */

  function addApproved(email, name, role){
    const e = email.trim().toLowerCase();
    if(!e || !name.trim()) return;
    setApproved(a => ({ ...a, [e]: { name: name.trim(), role }}));
    showToast(`${name.trim()} granted ${role} access`);
  }
  function updateApprovedRole(email, role){
    setApproved(a => ({ ...a, [email]: { ...a[email], role }}));
    showToast(`Role updated`);
  }
  function revokeApproved(email){
    const next = { ...approved }; delete next[email];
    setApproved(next);
    showToast("Access revoked");
  }

  /* ----- demo personas (tweaks) ----- */

  function switchPersona(kind){
    if(kind === "admin")  signInWithEmail("dan@grace.org");
    if(kind === "driver") signInWithEmail("marcus@grace.org");
    if(kind === "member") signInWithEmail("jake@grace.org", "Jake Lee");
    if(kind === "guest")  signInAsGuest();
    if(kind === "signedout") signOut();
  }

  function resetData(){
    localStorage.removeItem(STORAGE_KEY);
    setApproved(SEED_APPROVED);
    setMembers({});
    setSession(null);
    setScreen("signin");
    showToast("Demo data reset");
  }

  /* ----- render ----- */

  return (
    <React.Fragment>
      {screen === "signin" && (
        <SignInScreen
          approved={approved}
          members={members}
          onSignIn={signInWithEmail}
          onGuest={signInAsGuest}
        />
      )}
      {screen !== "signin" && session && (
        <AppShell
          session={session}
          approved={approved}
          members={members}
          screen={screen}
          setScreen={setScreen}
          events={EVENTS}
          selectedEventId={selectedEventId}
          setSelectedEventId={setSelectedEventId}
          onOpenRider={(ev)=> setModal({ type:"rider", event:ev })}
          onOpenDriver={(ev)=> setModal({ type:"driver", event:ev })}
          onOpenAddEmail={()=> setModal({ type:"addemail" })}
          onUpdateRole={updateApprovedRole}
          onRevoke={revokeApproved}
          onSignOut={signOut}
        />
      )}

      {modal?.type === "rider" && (
        <RiderModal
          event={modal.event}
          session={session}
          members={members}
          setMembers={setMembers}
          onClose={()=> setModal(null)}
          onDone={()=> { setModal(null); showToast("You're signed up as a rider"); }}
        />
      )}
      {modal?.type === "driver" && (
        <DriverModal
          event={modal.event}
          session={session}
          onClose={()=> setModal(null)}
          onDone={()=> { setModal(null); showToast("Your offer to drive is posted"); }}
        />
      )}
      {modal?.type === "addemail" && (
        <AddEmailModal
          onClose={()=> setModal(null)}
          onSubmit={(email,name,role)=> { addApproved(email,name,role); setModal(null); }}
        />
      )}

      <Toast toast={toast} />

      <Tweaks
        session={session}
        onPersona={switchPersona}
        onReset={resetData}
      />
    </React.Fragment>
  );
}

/* ============================================================
   SIGN IN SCREEN
   ============================================================ */

function SignInScreen({ approved, members, onSignIn, onGuest }){
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("email"); // 'email' | 'name'
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function check(){
    const e = email.trim().toLowerCase();
    if(!e || !e.includes("@")){ setError("Enter a valid email"); return; }
    setError("");
    if(approved[e] || members[e]){
      onSignIn(e);
    } else {
      setStep("name");
    }
  }

  const lookup = useMemo(()=>{
    const e = email.trim().toLowerCase();
    if(!e) return null;
    if(approved[e]) return { kind:"approved", rec: approved[e] };
    if(members[e])  return { kind:"member",   rec: members[e] };
    return { kind:"new" };
  }, [email, approved, members]);

  return (
    <div style={{
      height:"100vh",
      display:"grid",
      gridTemplateColumns:"1.05fr 1fr",
      background:"var(--bg)",
    }}>
      {/* Left — brand panel */}
      <div style={{
        background:"linear-gradient(165deg, #26215C 0%, #3C3489 70%, #534AB7 130%)",
        color:"white",
        padding:"56px 64px",
        display:"flex",
        flexDirection:"column",
        position:"relative",
        overflow:"hidden",
      }}>
        {/* decorative */}
        <div aria-hidden style={{
          position:"absolute", inset:0,
          backgroundImage:"radial-gradient(circle at 80% 110%, rgba(199,195,240,.25), transparent 55%), radial-gradient(circle at 10% 0%, rgba(127,119,221,.35), transparent 45%)",
          pointerEvents:"none",
        }}/>
        <div style={{position:"relative", display:"flex", alignItems:"center", gap:10}}>
          <div style={{
            width:36, height:36, borderRadius:10,
            background:"rgba(255,255,255,.12)",
            display:"flex", alignItems:"center", justifyContent:"center",
            border:"0.5px solid rgba(255,255,255,.2)",
          }}>
            <i className="ti ti-steering-wheel" style={{fontSize:20}}/>
          </div>
          <div style={{fontSize:17, fontWeight:600, letterSpacing:"-.2px"}}>CL Rides</div>
        </div>

        <div style={{flex:1, display:"flex", flexDirection:"column", justifyContent:"center", position:"relative", maxWidth:480}}>
          <div style={{fontSize:44, fontWeight:600, letterSpacing:"-.8px", lineHeight:1.1, marginBottom:18}}>
            Get to where you’re going, together.
          </div>
          <div style={{fontSize:15, color:"rgba(255,255,255,.7)", lineHeight:1.6, marginBottom:32}}>
            Sign in with your email to keep your rides, contact info and history saved across devices. No password — we’ll recognise you next time.
          </div>

          <div style={{display:"flex", flexDirection:"column", gap:12, color:"rgba(255,255,255,.85)", fontSize:13}}>
            <Bullet icon="ti-mail" text="Sign in with email — your profile stays saved" />
            <Bullet icon="ti-user-question" text="No account? Continue as a guest, no commitment" />
            <Bullet icon="ti-shield-check" text="Drivers are approved by your community admin" />
          </div>
        </div>

        <div style={{position:"relative", fontSize:11, color:"rgba(255,255,255,.45)"}}>
          Grace Community Church · v1.0
        </div>
      </div>

      {/* Right — auth panel */}
      <div style={{display:"flex", alignItems:"center", justifyContent:"center", padding:32}}>
        <div style={{width:"100%", maxWidth:380}}>
          <div style={{fontSize:11, letterSpacing:".8px", color:"var(--text-3)", textTransform:"uppercase", marginBottom:10}}>
            {step === "email" ? "Sign in" : "Welcome"}
          </div>
          <div style={{fontSize:26, fontWeight:600, letterSpacing:"-.5px", marginBottom:8}}>
            {step === "email" ? "Continue with email" : "One more thing"}
          </div>
          <div style={{fontSize:13, color:"var(--text-2)", marginBottom:28}}>
            {step === "email"
              ? "We’ll recognise approved drivers and admins automatically."
              : "What should we call you?"}
          </div>

          {step === "email" && (
            <React.Fragment>
              <Field label="Email">
                <div style={{position:"relative"}}>
                  <i className="ti ti-mail" style={{
                    position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
                    fontSize:16, color:"var(--text-3)"
                  }}/>
                  <input
                    type="email"
                    autoFocus
                    value={email}
                    onChange={(e)=> { setEmail(e.target.value); setError(""); }}
                    onKeyDown={(e)=> e.key==="Enter" && check()}
                    placeholder="you@grace.org"
                    style={inputStyle({padded:true})}
                  />
                </div>
              </Field>

              {error && <div style={{fontSize:12, color:"var(--red-500)", marginTop:-12, marginBottom:14}}>{error}</div>}

              {lookup?.kind === "approved" && (
                <LookupHint
                  kind={lookup.rec.role}
                  text={`Recognised as ${lookup.rec.name} · ${lookup.rec.role === "admin" ? "Admin" : "Approved driver"}`}
                />
              )}
              {lookup?.kind === "member" && (
                <LookupHint
                  kind="member"
                  text={`Welcome back, ${lookup.rec.name}`}
                />
              )}
              {lookup?.kind === "new" && email.includes("@") && (
                <LookupHint
                  kind="new"
                  text="New here — we’ll create a rider account"
                />
              )}

              <button onClick={check} style={btnPrimary({block:true, mt:18})}>
                Continue <i className="ti ti-arrow-right" style={{fontSize:14, verticalAlign:-2, marginLeft:4}}/>
              </button>

              <Divider label="or" />

              <button onClick={onGuest} style={btnGhost({block:true})}>
                <i className="ti ti-user" style={{fontSize:15, verticalAlign:-2, marginRight:6}}/>
                Continue as guest
              </button>

              <div style={{fontSize:11, color:"var(--text-3)", marginTop:18, lineHeight:1.6}}>
                Guests can sign up for rides, but need to re-enter contact details each time. Drivers must be approved by an admin — <a style={{color:"var(--purple-600)", textDecoration:"none"}} href="#">how to get approved</a>.
              </div>
            </React.Fragment>
          )}

          {step === "name" && (
            <React.Fragment>
              <div style={{
                background:"var(--purple-100)", border:"0.5px solid var(--purple-200)",
                borderRadius:"var(--r-md)", padding:"10px 12px", marginBottom:18,
                fontSize:12, color:"var(--purple-700)",
                display:"flex", alignItems:"center", gap:8,
              }}>
                <i className="ti ti-sparkles" style={{fontSize:15}}/>
                Creating a rider account for <span className="mono" style={{fontWeight:500}}>{email.trim().toLowerCase()}</span>
              </div>
              <Field label="Your name">
                <input
                  autoFocus
                  value={name}
                  onChange={(e)=> setName(e.target.value)}
                  onKeyDown={(e)=> e.key==="Enter" && name.trim() && onSignIn(email, name)}
                  placeholder="e.g. Jake Lee"
                  style={inputStyle()}
                />
              </Field>
              <button
                onClick={()=> name.trim() && onSignIn(email, name)}
                disabled={!name.trim()}
                style={btnPrimary({block:true, mt:8, disabled:!name.trim()})}
              >
                Create rider account
              </button>
              <button onClick={()=> { setStep("email"); setName(""); }} style={{
                ...btnGhost({block:true}), marginTop:10,
              }}>
                Back
              </button>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
}

function Bullet({icon,text}){
  return (
    <div style={{display:"flex", alignItems:"center", gap:10}}>
      <div style={{
        width:24, height:24, borderRadius:6,
        background:"rgba(255,255,255,.1)",
        display:"flex", alignItems:"center", justifyContent:"center",
        border:"0.5px solid rgba(255,255,255,.15)",
        flexShrink:0,
      }}>
        <i className={`ti ${icon}`} style={{fontSize:13}}/>
      </div>
      {text}
    </div>
  );
}

function LookupHint({kind,text}){
  const map = {
    admin:    { bg:"var(--purple-100)", fg:"var(--purple-700)", icon:"ti-crown" },
    driver:   { bg:"var(--purple-100)", fg:"var(--purple-700)", icon:"ti-steering-wheel" },
    member:   { bg:"var(--green-100)",  fg:"var(--green-700)",  icon:"ti-user-check" },
    new:      { bg:"var(--surface-2)",  fg:"var(--text-2)",     icon:"ti-user-plus" },
  };
  const s = map[kind] || map.new;
  return (
    <div style={{
      background:s.bg, color:s.fg,
      padding:"8px 12px", borderRadius:"var(--r-md)",
      fontSize:12, fontWeight:500,
      display:"flex", alignItems:"center", gap:8,
      marginTop:-6, marginBottom:4,
    }}>
      <i className={`ti ${s.icon}`} style={{fontSize:15}}/>
      {text}
    </div>
  );
}

/* ============================================================
   APP SHELL — sidebar + main area
   ============================================================ */

function AppShell({
  session, approved, members,
  screen, setScreen, events,
  selectedEventId, setSelectedEventId,
  onOpenRider, onOpenDriver, onOpenAddEmail,
  onUpdateRole, onRevoke, onSignOut,
}){
  const canDrive = session.role === "driver" || session.role === "admin";
  const isAdmin  = session.role === "admin";
  const isGuest  = session.isGuest;

  return (
    <div style={{display:"flex", height:"100vh", background:"var(--bg)"}}>
      <Sidebar
        session={session}
        canDrive={canDrive}
        isAdmin={isAdmin}
        screen={screen}
        setScreen={setScreen}
        onSignOut={onSignOut}
      />
      <div style={{flex:1, display:"flex", flexDirection:"column", minWidth:0}}>
        {screen === "events" && (
          <EventsScreen
            session={session}
            canDrive={canDrive}
            isGuest={isGuest}
            events={events}
            selectedEventId={selectedEventId}
            setSelectedEventId={setSelectedEventId}
            onOpenRider={onOpenRider}
            onOpenDriver={onOpenDriver}
          />
        )}
        {screen === "admin" && (
          <AdminScreen
            approved={approved}
            members={members}
            onAdd={onOpenAddEmail}
            onUpdateRole={onUpdateRole}
            onRevoke={onRevoke}
          />
        )}
        {screen === "myrides" && (
          <EmptyScreen
            icon="ti-car"
            title="My rides"
            body="Rides you've signed up for or offered will appear here."
          />
        )}
        {screen === "driving" && (
          <EmptyScreen
            icon="ti-steering-wheel"
            title="Driving"
            body="Trips you've offered to drive. Manage seats and riders."
          />
        )}
      </div>
    </div>
  );
}

function Sidebar({session, canDrive, isAdmin, screen, setScreen, onSignOut}){
  const initials = (session.name || "G").split(" ").map(s=>s[0]).join("").slice(0,2).toUpperCase();
  const roleLabel = session.isGuest
    ? "Guest"
    : session.role === "admin"  ? "Admin"
    : session.role === "driver" ? "Approved driver"
    : "Member";

  return (
    <div style={{
      width:240, flexShrink:0,
      display:"flex", flexDirection:"column",
      borderRight:"0.5px solid var(--border-1)",
      background:"var(--surface)",
    }}>
      {/* Top dark cap */}
      <div style={{background:"#26215C", padding:"22px 18px 18px", color:"white"}}>
        <div style={{display:"flex", alignItems:"center", gap:9, marginBottom:6}}>
          <div style={{
            width:28, height:28, borderRadius:8,
            background:"rgba(255,255,255,.12)",
            display:"flex", alignItems:"center", justifyContent:"center",
            border:"0.5px solid rgba(255,255,255,.18)",
          }}>
            <i className="ti ti-steering-wheel" style={{fontSize:16}}/>
          </div>
          <div style={{fontSize:15, fontWeight:600, letterSpacing:"-.2px"}}>CL Rides</div>
        </div>
        <div style={{fontSize:11, color:"rgba(255,255,255,.55)"}}>Grace Community Church</div>

        <div style={{
          display:"flex", alignItems:"center", gap:9,
          marginTop:16, paddingTop:14,
          borderTop:"0.5px solid rgba(255,255,255,.12)",
        }}>
          <div style={{
            width:30, height:30, borderRadius:"50%",
            background: session.isGuest ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.16)",
            color:"white",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:10, fontWeight:600,
            border: session.isGuest ? "0.5px dashed rgba(255,255,255,.3)" : "none",
          }}>
            {session.isGuest ? <i className="ti ti-user" style={{fontSize:14}}/> : initials}
          </div>
          <div style={{minWidth:0, flex:1}}>
            <div style={{fontSize:12, color:"rgba(255,255,255,.9)", fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
              {session.name}
            </div>
            <div style={{fontSize:10, color:"rgba(255,255,255,.45)", display:"flex", alignItems:"center", gap:4}}>
              {session.role === "admin" && <i className="ti ti-crown" style={{fontSize:11}}/>}
              {session.role === "driver" && <i className="ti ti-steering-wheel" style={{fontSize:11}}/>}
              {roleLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{flex:1, padding:"12px 10px", display:"flex", flexDirection:"column"}}>
        <NavSection label="Main"/>
        <NavItem icon="ti-calendar-event" label="Events" badge="3" active={screen==="events"} onClick={()=>setScreen("events")}/>
        <NavItem icon="ti-car"             label="My rides" active={screen==="myrides"} onClick={()=>setScreen("myrides")} disabled={session.isGuest}/>
        {canDrive && (
          <NavItem icon="ti-steering-wheel" label="Driving" active={screen==="driving"} onClick={()=>setScreen("driving")}/>
        )}

        {isAdmin && (
          <React.Fragment>
            <NavSection label="Admin"/>
            <NavItem icon="ti-user-shield" label="Driver access" badge={null} active={screen==="admin"} onClick={()=>setScreen("admin")} accent/>
          </React.Fragment>
        )}

        <NavSection label="Community"/>
        <NavItem icon="ti-users" label="Members" disabled={session.isGuest}/>
        <NavItem icon="ti-bell"  label="Notifications" badge="2" badgeColor="var(--red-500)" disabled={session.isGuest}/>
      </div>

      {/* Bottom */}
      <div style={{padding:"10px", borderTop:"0.5px solid var(--border-1)"}}>
        {session.isGuest && (
          <div style={{
            padding:"10px 11px",
            background:"var(--purple-100)",
            borderRadius:"var(--r-md)",
            marginBottom:8,
            fontSize:11, color:"var(--purple-700)", lineHeight:1.45,
          }}>
            <div style={{fontWeight:600, marginBottom:2}}>You're browsing as guest</div>
            Sign in with email to save your profile and history.
          </div>
        )}
        <NavItem icon="ti-settings" label="Settings"/>
        <NavItem icon="ti-logout"   label={session.isGuest ? "Exit guest mode" : "Sign out"} onClick={onSignOut}/>
      </div>
    </div>
  );
}

function NavSection({label}){
  return (
    <div style={{
      fontSize:10, color:"var(--text-3)",
      padding:"12px 10px 5px",
      letterSpacing:".8px",
      textTransform:"uppercase",
      fontWeight:500,
    }}>{label}</div>
  );
}

function NavItem({icon, label, badge, badgeColor, active, accent, disabled, onClick}){
  const base = {
    display:"flex", alignItems:"center", gap:10,
    padding:"8px 11px", borderRadius:"var(--r-md)",
    fontSize:13, color:"var(--text-2)",
    cursor: disabled ? "not-allowed" : "pointer",
    marginBottom:1, width:"100%", textAlign:"left",
    opacity: disabled ? .45 : 1,
  };
  const activeStyle = active ? {
    background:"var(--purple-100)", color:"var(--purple-700)", fontWeight:500,
  } : {};
  return (
    <button style={{...base, ...activeStyle}} onClick={disabled ? undefined : onClick}>
      <i className={`ti ${icon}`} style={{fontSize:16}}/>
      <span>{label}</span>
      {accent && !active && <span style={{
        marginLeft:"auto", fontSize:9, fontWeight:600,
        background:"var(--purple-100)", color:"var(--purple-700)",
        padding:"2px 7px", borderRadius:20, letterSpacing:".4px",
      }}>ADMIN</span>}
      {badge && (
        <span style={{
          marginLeft:"auto",
          background: badgeColor || "var(--purple-600)",
          color:"white", fontSize:9, fontWeight:600,
          padding:"2px 7px", borderRadius:20,
        }}>{badge}</span>
      )}
    </button>
  );
}

/* ============================================================
   EVENTS SCREEN
   ============================================================ */

function EventsScreen({session, canDrive, isGuest, events, selectedEventId, setSelectedEventId, onOpenRider, onOpenDriver}){
  const event = events.find(e => e.id === selectedEventId) || events[0];
  return (
    <React.Fragment>
      <Topbar
        crumbs={["Events", "May 2026"]}
        right={<button style={btnPrimary({})}>
          <i className="ti ti-plus" style={{fontSize:13, verticalAlign:-1, marginRight:4}}/>
          Add event
        </button>}
      />
      <div style={{flex:1, display:"flex", minHeight:0}}>
        {/* Calendar + list */}
        <div style={{flex:1, padding:"22px 26px", overflow:"auto", background:"var(--surface)", borderRight:"0.5px solid var(--border-1)"}}>
          <CalHeader />
          <CalGrid />
          <EventList events={events} selectedId={selectedEventId} onSelect={setSelectedEventId}/>
        </div>
        {/* Detail */}
        <div style={{width:340, padding:"22px 22px 30px", overflow:"auto", background:"var(--surface)"}}>
          <EventDetail
            event={event}
            session={session}
            canDrive={canDrive}
            isGuest={isGuest}
            onOpenRider={()=> onOpenRider(event)}
            onOpenDriver={()=> onOpenDriver(event)}
          />
        </div>
      </div>
    </React.Fragment>
  );
}

function Topbar({crumbs, right}){
  return (
    <div style={{
      height:54, padding:"0 24px",
      borderBottom:"0.5px solid var(--border-1)",
      background:"var(--surface)",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      flexShrink:0,
    }}>
      <div style={{fontSize:13, color:"var(--text-2)", display:"flex", alignItems:"center", gap:6}}>
        {crumbs.map((c,i)=>(
          <React.Fragment key={i}>
            {i>0 && <i className="ti ti-chevron-right" style={{fontSize:11, color:"var(--text-3)"}}/>}
            <span style={{color: i===crumbs.length-1 ? "var(--text-1)" : "var(--text-2)", fontWeight: i===crumbs.length-1 ? 500 : 400}}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      <div style={{display:"flex", alignItems:"center", gap:8}}>
        <IconBtn icon="ti-search"/>
        {right}
      </div>
    </div>
  );
}

function IconBtn({icon, onClick}){
  return (
    <button onClick={onClick} style={{
      width:32, height:32, borderRadius:"var(--r-md)",
      border:"0.5px solid var(--border-1)",
      background:"var(--surface)",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      <i className={`ti ${icon}`} style={{fontSize:14, color:"var(--text-2)"}}/>
    </button>
  );
}

function CalHeader(){
  return (
    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16}}>
      <div style={{fontSize:16, fontWeight:600, letterSpacing:"-.2px"}}>May 2026</div>
      <div style={{display:"flex", gap:4}}>
        <IconBtn icon="ti-chevron-left"/>
        <IconBtn icon="ti-chevron-right"/>
      </div>
    </div>
  );
}

function CalGrid(){
  const labels = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  // 5-week May 2026 (starts Friday May 1)
  const days = [
    [null,null,null,null,1,2,3],
    [4,5,6,7,8,9,10],
    [11,12,13,14,15,16,17],
    [18,19,20,21,22,23,24],
    [25,26,27,28,29,30,31],
  ].flat();
  const has = new Set([1,4,7,11,14,16,18,22,26]);
  const today = 10;
  const sel = 11;
  return (
    <div style={{display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:4, marginBottom:24}}>
      {labels.map(l => <div key={l} style={{textAlign:"center", fontSize:11, color:"var(--text-3)", padding:"6px 0"}}>{l}</div>)}
      {days.map((d,i) => {
        if(d === null) return <div key={i} style={{height:38}}/>;
        const isToday = d === today;
        const isSel = d === sel;
        const hasEv = has.has(d);
        return (
          <div key={i} style={{
            height:38, borderRadius:"var(--r-md)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:13, position:"relative", cursor:"pointer",
            background: isSel ? "var(--purple-600)" : isToday ? "var(--purple-100)" : "transparent",
            color: isSel ? "white" : isToday ? "var(--purple-700)" : "var(--text-2)",
            fontWeight: (isToday||isSel) ? 500 : 400,
          }}>
            {d}
            {hasEv && (
              <div style={{
                width:4, height:4, borderRadius:"50%",
                background: isSel ? "rgba(255,255,255,.7)" : "var(--purple-500)",
                position:"absolute", bottom:5,
              }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

function EventList({events, selectedId, onSelect}){
  return (
    <div>
      <div style={{
        fontSize:11, color:"var(--text-3)", marginBottom:10,
        display:"flex", justifyContent:"space-between",
        letterSpacing:".4px", textTransform:"uppercase", fontWeight:500,
      }}>
        <span>Upcoming · Sunday, May 11</span>
        <span style={{color:"var(--purple-600)", cursor:"pointer"}}>See all</span>
      </div>
      {events.map(ev => {
        const isSel = ev.id === selectedId;
        return (
          <button key={ev.id} onClick={()=> onSelect(ev.id)} style={{
            display:"flex", alignItems:"center", gap:12,
            padding:"12px 14px",
            border: isSel ? "0.5px solid var(--purple-200)" : "0.5px solid var(--border-1)",
            background: isSel ? "var(--purple-100)" : "var(--surface)",
            borderRadius:"var(--r-md)",
            marginBottom:6, width:"100%", textAlign:"left",
            transition:"all .12s",
          }}>
            <div style={{width:3, height:38, borderRadius:4, background:ev.color, flexShrink:0}}/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:13, fontWeight:500}}>{ev.name}</div>
              <div style={{fontSize:11, color:"var(--text-2)", marginTop:2}}>{ev.date.replace(", 2026","")} · {ev.time}</div>
            </div>
            <i className="ti ti-chevron-right" style={{fontSize:14, color:"var(--text-3)"}}/>
          </button>
        );
      })}
    </div>
  );
}

function EventDetail({event, session, canDrive, isGuest, onOpenRider, onOpenDriver}){
  const totalSeats = event.drivers.reduce((s,d)=> s + d.seatsTotal, 0);
  const takenSeats = event.drivers.reduce((s,d)=> s + d.seatsTaken, 0);
  const openSeats  = totalSeats - takenSeats;
  const pct = totalSeats === 0 ? 0 : Math.round((takenSeats/totalSeats)*100);

  return (
    <div>
      <div style={{
        fontSize:10, letterSpacing:".6px", color:"var(--text-3)",
        textTransform:"uppercase", fontWeight:500, marginBottom:12,
      }}>Event details</div>
      <div style={{fontSize:19, fontWeight:600, letterSpacing:"-.3px", marginBottom:4}}>{event.name}</div>
      <div style={{fontSize:12, color:"var(--text-2)", marginBottom:18, display:"flex", alignItems:"center", gap:6}}>
        <i className="ti ti-calendar" style={{fontSize:14, color:"var(--purple-500)"}}/>
        {event.date} · {event.time}
      </div>

      <Section title="Location & info">
        <MetaRow icon="ti-map-pin"  text={event.location}/>
        <MetaRow icon="ti-clock"    text={`Approx. ${event.duration}`}/>
        <MetaRow icon="ti-users"    text={`${event.attending} members attending`}/>
      </Section>

      <Divider />

      <Section title="Drivers">
        {event.drivers.map(d => {
          const isFull = d.seatsTaken >= d.seatsTotal;
          const open = d.seatsTotal - d.seatsTaken;
          return (
            <div key={d.id} style={{display:"flex", alignItems:"center", gap:9, marginBottom:9}}>
              <div style={{
                width:28, height:28, borderRadius:"50%",
                background:"var(--purple-100)", color:"var(--purple-700)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:10, fontWeight:600,
              }}>{d.name.split(" ").map(s=>s[0]).join("").slice(0,2)}</div>
              <div style={{fontSize:12, fontWeight:500, flex:1}}>{d.name.split(" ")[0]} {d.name.split(" ")[1]?.[0]}.</div>
              <Pill kind={isFull ? "full" : "open"}>{isFull ? "Full" : `${open} open`}</Pill>
            </div>
          );
        })}
      </Section>

      <Divider />

      <Section title="Seat availability">
        <div style={{height:6, borderRadius:6, background:"var(--surface-2)", marginBottom:6, overflow:"hidden"}}>
          <div style={{height:"100%", width:`${pct}%`, background:"var(--purple-500)"}}/>
        </div>
        <div style={{fontSize:11, color:"var(--text-3)", marginBottom:14}}>
          {takenSeats} of {totalSeats} seats filled · {openSeats} open
        </div>
      </Section>

      {/* Actions */}
      <div style={{display:"flex", flexDirection:"column", gap:8}}>
        <button onClick={onOpenRider} style={btnPrimary({block:true})} disabled={openSeats===0}>
          <i className="ti ti-user-plus" style={{fontSize:14, verticalAlign:-2, marginRight:6}}/>
          {openSeats===0 ? "All seats taken" : "Sign up as rider"}
        </button>

        {canDrive ? (
          <button onClick={onOpenDriver} style={btnGhost({block:true})}>
            <i className="ti ti-steering-wheel" style={{fontSize:14, verticalAlign:-2, marginRight:6}}/>
            Offer to drive
          </button>
        ) : (
          <DriverLockedCard isGuest={isGuest} />
        )}
      </div>
    </div>
  );
}

function DriverLockedCard({isGuest}){
  return (
    <div style={{
      border:"0.5px dashed var(--border-2)",
      borderRadius:"var(--r-md)",
      padding:"11px 13px",
      background:"var(--surface-2)",
      display:"flex", gap:10,
    }}>
      <div style={{
        width:28, height:28, borderRadius:8,
        background:"var(--surface)", border:"0.5px solid var(--border-1)",
        display:"flex", alignItems:"center", justifyContent:"center",
        flexShrink:0,
      }}>
        <i className="ti ti-lock" style={{fontSize:14, color:"var(--text-3)"}}/>
      </div>
      <div style={{fontSize:11.5, color:"var(--text-2)", lineHeight:1.5}}>
        <div style={{fontWeight:600, color:"var(--text-1)", marginBottom:2, fontSize:12}}>Driving is admin-approved</div>
        {isGuest
          ? "Sign in with email and ask your admin to grant driver access."
          : "Ask your admin to add you as an approved driver."}
        <a href="#" style={{display:"block", marginTop:6, color:"var(--purple-600)", textDecoration:"none", fontWeight:500}}>
          Request access <i className="ti ti-arrow-right" style={{fontSize:11, verticalAlign:-1}}/>
        </a>
      </div>
    </div>
  );
}

function Section({title, children}){
  return (
    <div style={{marginBottom:16}}>
      <div style={{
        fontSize:11, color:"var(--text-3)",
        letterSpacing:".4px", textTransform:"uppercase",
        fontWeight:500, marginBottom:9,
      }}>{title}</div>
      {children}
    </div>
  );
}
function MetaRow({icon,text}){
  return (
    <div style={{display:"flex", alignItems:"center", gap:9, fontSize:12.5, color:"var(--text-2)", marginBottom:7}}>
      <i className={`ti ${icon}`} style={{fontSize:15, color:"var(--purple-500)"}}/>
      <span>{text}</span>
    </div>
  );
}
function Pill({kind, children}){
  const map = {
    open: {bg:"var(--green-100)", fg:"var(--green-700)"},
    full: {bg:"var(--red-100)",   fg:"var(--red-700)"},
    amber:{bg:"var(--amber-100)", fg:"var(--amber-700)"},
    purple:{bg:"var(--purple-100)", fg:"var(--purple-700)"},
    neutral:{bg:"var(--surface-2)", fg:"var(--text-2)"},
  };
  const s = map[kind] || map.neutral;
  return <span style={{background:s.bg, color:s.fg, fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:20, letterSpacing:".2px"}}>{children}</span>;
}
function Divider({label}){
  if(!label) return <div style={{height:"0.5px", background:"var(--border-1)", margin:"14px 0"}}/>;
  return (
    <div style={{display:"flex", alignItems:"center", gap:10, margin:"20px 0 14px"}}>
      <div style={{flex:1, height:"0.5px", background:"var(--border-1)"}}/>
      <div style={{fontSize:11, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:".5px"}}>{label}</div>
      <div style={{flex:1, height:"0.5px", background:"var(--border-1)"}}/>
    </div>
  );
}

/* ============================================================
   ADMIN SCREEN — driver access management
   ============================================================ */

function AdminScreen({approved, members, onAdd, onUpdateRole, onRevoke}){
  const [filter, setFilter] = useState("all");
  const entries = Object.entries(approved);
  const memberCount = Object.keys(members).length;
  const driverCount = entries.filter(([,v])=> v.role === "driver").length;
  const adminCount  = entries.filter(([,v])=> v.role === "admin").length;

  const visible = entries.filter(([,v]) => filter === "all" || v.role === filter);

  return (
    <React.Fragment>
      <Topbar
        crumbs={["Admin", "Driver access"]}
        right={<button style={btnPrimary({})} onClick={onAdd}>
          <i className="ti ti-plus" style={{fontSize:13, verticalAlign:-1, marginRight:4}}/>
          Add email
        </button>}
      />
      <div style={{flex:1, overflow:"auto", padding:"24px 28px", background:"var(--bg)"}}>
        <div style={{maxWidth:880, margin:"0 auto"}}>
          {/* Header */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:22, fontWeight:600, letterSpacing:"-.4px", marginBottom:4}}>Driver access</div>
            <div style={{fontSize:13, color:"var(--text-2)", maxWidth:560}}>
              Anyone can sign up as a rider, but offering to drive is restricted. Add an email here to let that person sign in as an approved driver.
            </div>
          </div>

          {/* Stats */}
          <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12, marginBottom:20}}>
            <Stat label="Approved drivers" value={driverCount} icon="ti-steering-wheel"/>
            <Stat label="Admins"            value={adminCount}  icon="ti-crown"/>
            <Stat label="Rider members"     value={memberCount} icon="ti-users"/>
          </div>

          {/* Filter row */}
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            marginBottom:12,
          }}>
            <div style={{display:"flex", gap:4, background:"var(--surface)", border:"0.5px solid var(--border-1)", borderRadius:"var(--r-md)", padding:3}}>
              {[
                {k:"all",    l:`All (${entries.length})`},
                {k:"driver", l:`Drivers (${driverCount})`},
                {k:"admin",  l:`Admins (${adminCount})`},
              ].map(t => (
                <button key={t.k} onClick={()=> setFilter(t.k)} style={{
                  padding:"5px 12px", fontSize:12, fontWeight:500, borderRadius:6,
                  background: filter===t.k ? "var(--purple-100)" : "transparent",
                  color: filter===t.k ? "var(--purple-700)" : "var(--text-2)",
                }}>{t.l}</button>
              ))}
            </div>
            <div style={{fontSize:11, color:"var(--text-3)"}}>
              <i className="ti ti-info-circle" style={{fontSize:13, verticalAlign:-2, marginRight:4}}/>
              Riders don't need to be added — they self-serve.
            </div>
          </div>

          {/* Table */}
          <div style={{background:"var(--surface)", border:"0.5px solid var(--border-1)", borderRadius:"var(--r-lg)", overflow:"hidden"}}>
            <div style={{
              display:"grid", gridTemplateColumns:"1.4fr 1.6fr .9fr .6fr",
              padding:"11px 18px",
              fontSize:11, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:".5px", fontWeight:500,
              borderBottom:"0.5px solid var(--border-1)",
              background:"var(--surface-2)",
            }}>
              <div>Name</div>
              <div>Email</div>
              <div>Role</div>
              <div></div>
            </div>
            {visible.length === 0 && (
              <div style={{padding:32, textAlign:"center", color:"var(--text-3)", fontSize:13}}>
                No entries match this filter.
              </div>
            )}
            {visible.map(([email, rec]) => (
              <AdminRow
                key={email}
                email={email}
                rec={rec}
                onRoleChange={(role)=> onUpdateRole(email, role)}
                onRevoke={()=> onRevoke(email)}
              />
            ))}
          </div>

          <div style={{
            marginTop:18, padding:"14px 18px",
            background:"var(--surface)", border:"0.5px solid var(--border-1)", borderRadius:"var(--r-lg)",
            display:"flex", gap:14, alignItems:"flex-start",
          }}>
            <div style={{
              width:36, height:36, borderRadius:10,
              background:"var(--purple-100)", color:"var(--purple-700)",
              display:"flex", alignItems:"center", justifyContent:"center",
              flexShrink:0,
            }}>
              <i className="ti ti-shield-lock" style={{fontSize:18}}/>
            </div>
            <div style={{fontSize:12.5, color:"var(--text-2)", lineHeight:1.55}}>
              <div style={{fontWeight:600, color:"var(--text-1)", marginBottom:3}}>How permissions work</div>
              When someone signs in with an email on this list, they're automatically given the role you set. Emails not on this list become rider-members. Guests don't need to sign in at all, but their info isn't saved.
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

function Stat({label, value, icon}){
  return (
    <div style={{
      background:"var(--surface)", border:"0.5px solid var(--border-1)",
      borderRadius:"var(--r-lg)", padding:"14px 16px",
      display:"flex", alignItems:"center", gap:12,
    }}>
      <div style={{
        width:36, height:36, borderRadius:10,
        background:"var(--purple-100)", color:"var(--purple-700)",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <i className={`ti ${icon}`} style={{fontSize:18}}/>
      </div>
      <div>
        <div style={{fontSize:22, fontWeight:600, letterSpacing:"-.4px", lineHeight:1}}>{value}</div>
        <div style={{fontSize:11, color:"var(--text-3)", marginTop:3, letterSpacing:".3px", textTransform:"uppercase"}}>{label}</div>
      </div>
    </div>
  );
}

function AdminRow({email, rec, onRoleChange, onRevoke}){
  const [confirm, setConfirm] = useState(false);
  return (
    <div style={{
      display:"grid", gridTemplateColumns:"1.4fr 1.6fr .9fr .6fr",
      alignItems:"center",
      padding:"13px 18px",
      borderBottom:"0.5px solid var(--border-1)",
      fontSize:13,
    }}>
      <div style={{display:"flex", alignItems:"center", gap:10}}>
        <div style={{
          width:30, height:30, borderRadius:"50%",
          background:"var(--purple-100)", color:"var(--purple-700)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:10, fontWeight:600,
        }}>{rec.name.split(" ").map(s=>s[0]).join("").slice(0,2)}</div>
        <div style={{fontWeight:500}}>{rec.name}</div>
      </div>
      <div className="mono" style={{fontSize:12, color:"var(--text-2)"}}>{email}</div>
      <div>
        <select value={rec.role} onChange={(e)=> onRoleChange(e.target.value)} style={{
          fontSize:12, fontWeight:500,
          padding:"4px 10px",
          background: rec.role === "admin" ? "var(--purple-100)" : "var(--green-100)",
          color: rec.role === "admin" ? "var(--purple-700)" : "var(--green-700)",
          border:"none", borderRadius:20,
          appearance:"none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath d='M2 4l3 3 3-3' stroke='currentColor' stroke-width='1.4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat:"no-repeat",
          backgroundPosition:"right 8px center",
          paddingRight:24,
          cursor:"pointer",
        }}>
          <option value="driver">Driver</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div style={{textAlign:"right"}}>
        {confirm ? (
          <div style={{display:"inline-flex", gap:5}}>
            <button onClick={onRevoke} style={{
              fontSize:11, fontWeight:500, padding:"5px 10px", borderRadius:6,
              background:"var(--red-500)", color:"white",
            }}>Confirm</button>
            <button onClick={()=> setConfirm(false)} style={{
              fontSize:11, fontWeight:500, padding:"5px 10px", borderRadius:6,
              border:"0.5px solid var(--border-1)",
            }}>Cancel</button>
          </div>
        ) : (
          <button onClick={()=> setConfirm(true)} style={{
            fontSize:11, fontWeight:500, padding:"5px 10px", borderRadius:6,
            color:"var(--text-2)", border:"0.5px solid var(--border-1)",
          }}>Revoke</button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   MODALS
   ============================================================ */

function ModalShell({title, subtitle, onClose, children, footer, width=440}){
  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(20,18,38,.42)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:200, padding:24, animation:"fadeIn .14s ease",
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        width,
        background:"var(--surface)", borderRadius:"var(--r-xl)",
        boxShadow:"var(--shadow-lg)",
        overflow:"hidden",
      }}>
        <div style={{padding:"22px 24px 14px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12}}>
          <div>
            <div style={{fontSize:17, fontWeight:600, letterSpacing:"-.2px"}}>{title}</div>
            {subtitle && <div style={{fontSize:12.5, color:"var(--text-2)", marginTop:3}}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{
            width:30, height:30, borderRadius:8,
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"var(--text-3)",
          }}>
            <i className="ti ti-x" style={{fontSize:17}}/>
          </button>
        </div>
        <div style={{padding:"4px 24px 18px"}}>{children}</div>
        {footer && (
          <div style={{padding:"14px 24px", background:"var(--surface-2)", borderTop:"0.5px solid var(--border-1)"}}>{footer}</div>
        )}
      </div>
    </div>
  );
}

function RiderModal({event, session, members, setMembers, onClose, onDone}){
  const isGuest = session.isGuest;
  const memberRec = !isGuest && session.email ? members[session.email] : null;

  const [name, setName]   = useState(memberRec?.name  || (!isGuest ? session.name : ""));
  const [phone, setPhone] = useState(memberRec?.phone || "");
  const [riders, setRiders] = useState(1);
  const [driverId, setDriverId] = useState(event.drivers.find(d => d.seatsTaken < d.seatsTotal)?.id || event.drivers[0].id);
  const [save, setSave] = useState(!isGuest);

  function submit(){
    if(!isGuest && save && session.email){
      setMembers(m => ({ ...m, [session.email]: { name, phone, lastSeen: Date.now() }}));
    }
    onDone();
  }

  const valid = name.trim() && phone.trim();
  const driver = event.drivers.find(d => d.id === driverId);

  return (
    <ModalShell
      title={`Sign up — ${event.name}`}
      subtitle={`${event.date} · ${event.time}`}
      onClose={onClose}
      footer={
        <div style={{display:"flex", gap:8, justifyContent:"space-between", alignItems:"center"}}>
          <div style={{fontSize:11.5, color:"var(--text-3)"}}>
            {isGuest ? "Sign in to skip this next time." : save ? "Your info will be saved to your profile." : "Your info won't be saved."}
          </div>
          <div style={{display:"flex", gap:8}}>
            <button onClick={onClose} style={btnGhost({})}>Cancel</button>
            <button onClick={submit} disabled={!valid} style={btnPrimary({disabled:!valid})}>
              <i className="ti ti-check" style={{fontSize:14, verticalAlign:-2, marginRight:5}}/>
              Confirm sign-up
            </button>
          </div>
        </div>
      }
    >
      {isGuest && (
        <div style={{
          background:"var(--amber-100)", color:"var(--amber-700)",
          padding:"10px 12px", borderRadius:"var(--r-md)",
          fontSize:12, marginBottom:14,
          display:"flex", alignItems:"flex-start", gap:8,
        }}>
          <i className="ti ti-info-circle" style={{fontSize:15, flexShrink:0, marginTop:1}}/>
          <span>You're signing up as a guest. Your contact info won't be saved — you'll need to re-enter it next time.</span>
        </div>
      )}

      <Field label="Full name">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Jordan Kim" style={inputStyle()}/>
      </Field>
      <Field label="Phone (so your driver can reach you)">
        <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="(555) 123-4567" style={inputStyle()}/>
      </Field>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
        <Field label="Number of riders">
          <select value={riders} onChange={e=> setRiders(+e.target.value)} style={inputStyle()}>
            {[1,2,3,4].map(n => <option key={n} value={n}>{n} {n===1?"person":"people"}</option>)}
          </select>
        </Field>
        <Field label="Preferred driver">
          <select value={driverId} onChange={e=> setDriverId(e.target.value)} style={inputStyle()}>
            {event.drivers.map(d => {
              const open = d.seatsTotal - d.seatsTaken;
              return <option key={d.id} value={d.id} disabled={open===0}>{d.name} {open===0 ? "(full)" : `(${open} open)`}</option>;
            })}
          </select>
        </Field>
      </div>

      {driver && (
        <div style={{
          marginTop:4, padding:"10px 12px",
          background:"var(--purple-100)",
          borderRadius:"var(--r-md)",
          fontSize:12, color:"var(--purple-700)",
          display:"flex", alignItems:"center", gap:8,
        }}>
          <i className="ti ti-car" style={{fontSize:15}}/>
          {driver.name} will pick you up — they'll get your number after you confirm.
        </div>
      )}

      {!isGuest && (
        <label style={{
          display:"flex", alignItems:"center", gap:8,
          marginTop:14, fontSize:12, color:"var(--text-2)",
          cursor:"pointer",
        }}>
          <input type="checkbox" checked={save} onChange={e=> setSave(e.target.checked)} style={{accentColor:"var(--purple-600)"}}/>
          Save these details to my profile for next time
        </label>
      )}
    </ModalShell>
  );
}

function DriverModal({event, session, onClose, onDone}){
  const [seats, setSeats] = useState(3);
  const [vehicle, setVehicle] = useState("");
  const [pickup, setPickup] = useState("");

  return (
    <ModalShell
      title={`Offer to drive — ${event.name}`}
      subtitle={`${event.date} · ${event.time}`}
      onClose={onClose}
      footer={
        <div style={{display:"flex", gap:8, justifyContent:"flex-end"}}>
          <button onClick={onClose} style={btnGhost({})}>Cancel</button>
          <button onClick={onDone} style={btnPrimary({})}>
            <i className="ti ti-steering-wheel" style={{fontSize:14, verticalAlign:-2, marginRight:5}}/>
            Post offer
          </button>
        </div>
      }
    >
      <div style={{
        background:"var(--purple-100)", color:"var(--purple-700)",
        padding:"10px 12px", borderRadius:"var(--r-md)",
        fontSize:12, marginBottom:14, display:"flex", alignItems:"center", gap:8,
      }}>
        <i className="ti ti-shield-check" style={{fontSize:15}}/>
        You're signed in as an approved driver ({session.name}).
      </div>

      <Field label="Available seats">
        <select value={seats} onChange={e=> setSeats(+e.target.value)} style={inputStyle()}>
          {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} seat{n===1?"":"s"}</option>)}
        </select>
      </Field>
      <Field label="Vehicle (optional)">
        <input value={vehicle} onChange={e=> setVehicle(e.target.value)} placeholder="e.g. Blue Honda CR-V" style={inputStyle()}/>
      </Field>
      <Field label="Pickup area (optional)">
        <input value={pickup} onChange={e=> setPickup(e.target.value)} placeholder="e.g. North side, near Maple Ave" style={inputStyle()}/>
      </Field>
    </ModalShell>
  );
}

function AddEmailModal({onClose, onSubmit}){
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("driver");

  const valid = email.trim() && email.includes("@") && name.trim();

  return (
    <ModalShell
      title="Grant access"
      subtitle="Add an email to give that person driver or admin permissions when they sign in."
      onClose={onClose}
      footer={
        <div style={{display:"flex", gap:8, justifyContent:"flex-end"}}>
          <button onClick={onClose} style={btnGhost({})}>Cancel</button>
          <button onClick={()=> valid && onSubmit(email, name, role)} disabled={!valid} style={btnPrimary({disabled:!valid})}>
            Add to list
          </button>
        </div>
      }
    >
      <Field label="Email">
        <input autoFocus value={email} onChange={e=> setEmail(e.target.value)} placeholder="newdriver@grace.org" style={inputStyle()}/>
      </Field>
      <Field label="Name (for the directory)">
        <input value={name} onChange={e=> setName(e.target.value)} placeholder="e.g. Avery Okafor" style={inputStyle()}/>
      </Field>
      <Field label="Role">
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
          <RoleCard
            active={role==="driver"} onClick={()=> setRole("driver")}
            icon="ti-steering-wheel" title="Driver"
            body="Can offer to drive on any event."
          />
          <RoleCard
            active={role==="admin"} onClick={()=> setRole("admin")}
            icon="ti-crown" title="Admin"
            body="Driver + can manage this list."
          />
        </div>
      </Field>
    </ModalShell>
  );
}

function RoleCard({active, onClick, icon, title, body}){
  return (
    <button onClick={onClick} style={{
      textAlign:"left", padding:"11px 13px", borderRadius:"var(--r-md)",
      border: active ? "1.5px solid var(--purple-600)" : "0.5px solid var(--border-1)",
      background: active ? "var(--purple-100)" : "var(--surface)",
      cursor:"pointer",
    }}>
      <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:4}}>
        <i className={`ti ${icon}`} style={{fontSize:15, color: active ? "var(--purple-700)" : "var(--text-2)"}}/>
        <div style={{fontSize:13, fontWeight:600, color: active ? "var(--purple-700)" : "var(--text-1)"}}>{title}</div>
      </div>
      <div style={{fontSize:11.5, color:"var(--text-2)", lineHeight:1.45}}>{body}</div>
    </button>
  );
}

/* ============================================================
   EMPTY STATE
   ============================================================ */

function EmptyScreen({icon, title, body}){
  return (
    <React.Fragment>
      <Topbar crumbs={[title]} />
      <div style={{flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:32}}>
        <div style={{textAlign:"center", maxWidth:320}}>
          <div style={{
            width:56, height:56, borderRadius:14,
            background:"var(--purple-100)", color:"var(--purple-700)",
            display:"inline-flex", alignItems:"center", justifyContent:"center",
            marginBottom:14,
          }}>
            <i className={`ti ${icon}`} style={{fontSize:24}}/>
          </div>
          <div style={{fontSize:17, fontWeight:600, marginBottom:6}}>{title}</div>
          <div style={{fontSize:13, color:"var(--text-2)", lineHeight:1.5}}>{body}</div>
        </div>
      </div>
    </React.Fragment>
  );
}

/* ============================================================
   TOAST
   ============================================================ */

function Toast({toast}){
  if(!toast) return null;
  return (
    <div style={{
      position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
      background:"var(--text-1)", color:"white",
      padding:"10px 16px", borderRadius:"var(--r-md)",
      fontSize:13, fontWeight:500,
      boxShadow:"var(--shadow-lg)",
      zIndex:300,
      display:"flex", alignItems:"center", gap:8,
      animation:"slideUp .2s ease",
    }}>
      <i className="ti ti-check" style={{fontSize:15, color:"var(--purple-500)"}}/>
      {toast.msg}
    </div>
  );
}

/* ============================================================
   FORM HELPERS
   ============================================================ */

function Field({label, children}){
  return (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:11.5, fontWeight:500, color:"var(--text-2)", marginBottom:6}}>{label}</div>
      {children}
    </div>
  );
}
function inputStyle({padded}={}){
  return {
    width:"100%",
    padding: padded ? "10px 12px 10px 36px" : "10px 12px",
    fontSize:13.5,
    border:"0.5px solid var(--border-2)",
    borderRadius:"var(--r-md)",
    background:"var(--surface)",
    outline:"none",
  };
}
function btnPrimary({block, mt, disabled}){
  return {
    background: disabled ? "var(--border-2)" : "var(--purple-600)",
    color:"white",
    fontWeight:500, fontSize:13,
    padding:"9px 16px",
    borderRadius:"var(--r-md)",
    cursor: disabled ? "not-allowed" : "pointer",
    width: block ? "100%" : "auto",
    marginTop: mt || 0,
    display:"inline-flex", alignItems:"center", justifyContent:"center",
  };
}
function btnGhost({block}){
  return {
    background:"var(--surface)",
    color:"var(--text-2)",
    fontWeight:500, fontSize:13,
    padding:"9px 16px",
    border:"0.5px solid var(--border-1)",
    borderRadius:"var(--r-md)",
    cursor:"pointer",
    width: block ? "100%" : "auto",
    display:"inline-flex", alignItems:"center", justifyContent:"center",
  };
}

/* ============================================================
   TWEAKS — persona switcher (demo only)
   ============================================================ */

function Tweaks({session, onPersona, onReset}){
  const { TweaksPanel, TweakSection, TweakSelect, TweakButton } = window;

  const currentPersona =
    !session                     ? "signedout" :
    session.isGuest              ? "guest"     :
    session.role === "admin"     ? "admin"     :
    session.role === "driver"    ? "driver"    :
                                   "member";

  return (
    <TweaksPanel title="Demo controls">
      <TweakSection label="Persona">
        <TweakSelect
          label="Sign in as"
          value={currentPersona}
          onChange={onPersona}
          options={["signedout","guest","member","driver","admin"]}
        />
        <div style={{fontSize:11, color:"#8D8BA3", marginTop:8, lineHeight:1.5}}>
          Admin/driver personas come from the seeded approved-email list. Member is created from <span style={{fontFamily:"'JetBrains Mono',monospace"}}>jake@grace.org</span>.
        </div>
      </TweakSection>

      <TweakSection label="Demo data">
        <TweakButton label="Reset to seed data" onClick={onReset} secondary />
      </TweakSection>
    </TweaksPanel>
  );
}

/* ============================================================
   MOUNT
   ============================================================ */

const css = `
@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
@keyframes slideUp { from { opacity:0; transform: translate(-50%, 8px) } to { opacity:1; transform: translate(-50%, 0) } }
button:hover:not(:disabled) { filter: brightness(.97) }
input:focus, select:focus { border-color: var(--purple-500) !important; box-shadow: 0 0 0 3px rgba(127,119,221,.15) }
`;
const styleEl = document.createElement("style");
styleEl.textContent = css;
document.head.appendChild(styleEl);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
