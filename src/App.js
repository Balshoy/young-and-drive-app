import React from 'react';
import { useState, useEffect, useCallback } from "react";

const SB_URL = "https://oywuyqmuhjxdjpjhnevt.supabase.co";
const SB_KEY = "sb_publishable_1uKDWu3XdnkHnID6US2S7w_84hO45GJ";

const sbFetch = async (path, opts = {}, token = null) => {
  const headers = { "apikey": SB_KEY, "Content-Type": "application/json", "Prefer": "return=representation", ...(token ? { "Authorization": "Bearer " + token } : {}), ...(opts.headers || {}) };
  const res = await fetch(SB_URL + path, { ...opts, headers });
  const text = await res.text();
  try { return { data: text ? JSON.parse(text) : null, ok: res.ok }; } catch { return { data: text, ok: res.ok }; }
};

const authPost = (ep, body) => sbFetch("/auth/v1" + ep, { method: "POST", body: JSON.stringify(body) });
const dbGet = (t, q = "", token = null) => sbFetch("/rest/v1/" + t + "?" + q, {}, token);
const dbPost = (t, body, token) => sbFetch("/rest/v1/" + t, { method: "POST", body: JSON.stringify(body) }, token);
const dbDelete = (t, q, token) => sbFetch("/rest/v1/" + t + "?" + q, { method: "DELETE" }, token);

const C = { bg:"#0f0f0f", surface:"#1a1a1a", card:"#222", border:"#2e2e2e", accent:"#e8420a", text:"#f0f0f0", muted:"#888" };
const TAGS = { Tuning:"#e8420a", "Actualités":"#1976d2", "Meet Up":"#2e7d32", Circuit:"#7b1fa2", Électrique:"#0097a7" };
const CATS = ["Toutes","Tuning","Actualités","Électrique","Circuit","Meet Up"];
const inp = { width:"100%", padding:"10px 12px", background:C.surface, border:"1px solid "+C.border, borderRadius:8, color:C.text, fontSize:14, boxSizing:"border-box", outline:"none" };
const btn = (bg="#333", color=C.text) => ({ padding:"10px 16px", borderRadius:8, border:"none", cursor:"pointer", background:bg, color, fontWeight:600, fontSize:14 });
const timeAgo = ts => { const d=(Date.now()-new Date(ts))/1000; if(d<60) return "à l'instant"; if(d<3600) return "il y a "+Math.floor(d/60)+"min"; if(d<86400) return "il y a "+Math.floor(d/3600)+"h"; return "il y a "+Math.floor(d/86400)+"j"; };

function Avatar({ name="?", size=36 }) {
  return <div style={{width:size,height:size,borderRadius:"50%",background:"#2a1a14",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.36,fontWeight:700,color:C.accent,flexShrink:0}}>{name.substring(0,2).toUpperCase()}</div>;
}
function Tag({ label }) {
  const col = TAGS[label]||C.accent;
  return <span style={{background:col+"22",color:col,fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20}}>{label}</span>;
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false); const [msg, setMsg] = useState(null);
  const submit = async () => {
    setMsg(null); setLoading(true);
    if (mode === "signup") {
      const { ok, data } = await authPost("/signup", { email, password: pw });
      if (!ok) setMsg({ err: data?.msg || "Erreur inscription" });
      else setMsg({ ok: "Compte créé ! Tu peux te connecter." });
    } else {
      const { ok, data } = await authPost("/token?grant_type=password", { email, password: pw });
      if (!ok) setMsg({ err: "Email ou mot de passe incorrect" });
      else onAuth(data);
    }
    setLoading(false);
  };
  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"system-ui,sans-serif"}}>
      <div style={{marginBottom:28,textAlign:"center"}}>
        <div style={{width:56,height:56,background:C.accent,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:28,color:"#fff",margin:"0 auto 12px"}}>Y</div>
        <div style={{fontWeight:700,fontSize:24,color:C.text}}>Young<span style={{color:C.accent}}>&amp;Drive</span></div>
        <div style={{fontSize:13,color:C.muted,marginTop:4}}>La communauté des passionnés auto</div>
      </div>
      <div style={{width:"100%",maxWidth:380,background:C.card,borderRadius:16,border:"1px solid "+C.border,padding:28}}>
        <div style={{display:"flex",gap:4,marginBottom:22,background:C.surface,borderRadius:10,padding:4}}>
          {["login","signup"].map(m=><button key={m} onClick={()=>setMode(m)} style={{...btn(mode===m?C.accent:"transparent",mode===m?"#fff":C.muted),flex:1,padding:"8px",borderRadius:8,fontSize:13}}>{m==="login"?"Connexion":"Inscription"}</button>)}
        </div>
        <div style={{marginBottom:12}}><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>Email</label><input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="ton@email.com" /></div>
        <div style={{marginBottom:18}}><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>Mot de passe</label><input style={inp} type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&submit()} /></div>
        {msg?.err && <div style={{background:"#3a1111",border:"1px solid #7a2222",borderRadius:8,padding:"8px 12px",fontSize:13,color:"#ff8080",marginBottom:14}}>{msg.err}</div>}
        {msg?.ok  && <div style={{background:"#1a3a1a",border:"1px solid #2a7a2a",borderRadius:8,padding:"8px 12px",fontSize:13,color:"#80ff80",marginBottom:14}}>{msg.ok}</div>}
        <button onClick={submit} disabled={loading} style={{...btn(C.accent,"#fff"),width:"100%",opacity:loading?0.6:1}}>{loading?"...":(mode==="login"?"Se connecter":"Créer mon compte")}</button>
      </div>
    </div>
  );
}

function Feed({ session }) {
  const [posts, setPosts] = useState([]); const [cat, setCat] = useState("Toutes");
  const [content, setContent] = useState(""); const [tag, setTag] = useState("Tuning"); const [posting, setPosting] = useState(false);
  const token = session?.access_token;
  const load = useCallback(async () => {
    let q = "select=*,profiles(username)&order=created_at.desc&limit=30";
    if (cat !== "Toutes") q += "&tag=eq."+encodeURIComponent(cat);
    const { data } = await dbGet("posts", q, token);
    setPosts(Array.isArray(data) ? data : []);
  }, [cat, token]);
  useEffect(() => { load(); }, [load]);
  const post = async () => {
    if (!content.trim()) return; setPosting(true);
    await dbPost("posts", { user_id: session.user.id, content, tag }, token);
    setContent(""); await load(); setPosting(false);
  };
  return (
    <div>
      <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:14,marginBottom:16}}>
        <div style={{display:"flex",gap:10,marginBottom:10}}>
          <Avatar name={session.user.email} size={36} />
          <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Partage ton build, ton avis..." rows={2} style={{flex:1,background:"transparent",border:"none",outline:"none",color:C.text,fontSize:14,resize:"none",fontFamily:"system-ui"}} />
        </div>
        {content && <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <select value={tag} onChange={e=>setTag(e.target.value)} style={{background:C.surface,border:"1px solid "+C.border,borderRadius:8,color:C.text,padding:"5px 8px",fontSize:12}}>
            {Object.keys(TAGS).map(t=><option key={t}>{t}</option>)}
          </select>
          <button onClick={post} disabled={posting} style={{...btn(C.accent,"#fff"),marginLeft:"auto",padding:"6px 16px",fontSize:13}}>{posting?"...":"Poster"}</button>
        </div>}
      </div>
      <div style={{display:"flex",gap:8,overflowX:"auto",marginBottom:14,paddingBottom:4}}>
        {CATS.map(c=><button key={c} onClick={()=>setCat(c)} style={{...btn(cat===c?C.accent:C.card,cat===c?"#fff":C.muted),flexShrink:0,padding:"5px 14px",borderRadius:20,fontSize:12}}>{c}</button>)}
      </div>
      {posts.length===0 ? <div style={{textAlign:"center",color:C.muted,padding:40}}>Aucun post — sois le premier 🔥</div> :
        posts.map(p=>(
          <div key={p.id} style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:"14px 16px",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <Avatar name={p.profiles?.username||"?"} size={32} />
              <div><div style={{fontSize:13,fontWeight:600,color:C.text}}>{p.profiles?.username||"Pilote"}</div><div style={{fontSize:11,color:C.muted}}>{timeAgo(p.created_at)}</div></div>
              <div style={{marginLeft:"auto"}}><Tag label={p.tag||"Tuning"} /></div>
            </div>
            <div style={{fontSize:15,color:C.text,lineHeight:1.5}}>{p.content}</div>
          </div>
        ))
      }
    </div>
  );
}

function MeetUp({ session }) {
  const [events, setEvents] = useState([]); const [counts, setCounts] = useState({}); const [joined, setJoined] = useState({});
  const [form, setForm] = useState({title:"",location:"",event_date:"",max_attendees:"50"}); const [showForm, setShowForm] = useState(false); const [saving, setSaving] = useState(false);
  const token = session?.access_token; const uid = session?.user?.id;
  const load = async () => {
    const { data: evs } = await dbGet("events","select=*,profiles(username)&order=event_date",token);
    setEvents(Array.isArray(evs)?evs:[]);
    const { data: att } = await dbGet("event_attendees","select=event_id,user_id",token);
    const c={},j={};
    (att||[]).forEach(a=>{ c[a.event_id]=(c[a.event_id]||0)+1; if(a.user_id===uid) j[a.event_id]=true; });
    setCounts(c); setJoined(j);
  };
  useEffect(()=>{ load(); },[]);
  const toggle = async (eid) => { if(joined[eid]) await dbDelete("event_attendees","event_id=eq."+eid+"&user_id=eq."+uid,token); else await dbPost("event_attendees",{event_id:eid,user_id:uid},token); await load(); };
  const create = async () => { if(!form.title||!form.location||!form.event_date) return; setSaving(true); await dbPost("events",{...form,user_id:uid,max_attendees:parseInt(form.max_attendees)},token); setShowForm(false); setForm({title:"",location:"",event_date:"",max_attendees:"50"}); await load(); setSaving(false); };
  return (
    <div>
      <div style={{background:"#1a1a2a",border:"1px solid #2a2a4a",borderRadius:14,padding:16,marginBottom:16,textAlign:"center"}}>
        <div style={{fontSize:13,color:"#7986cb",marginBottom:4}}>📍 Events à venir</div>
        <div style={{fontSize:22,fontWeight:700,color:C.text}}>{events.length} événement{events.length!==1?"s":""}</div>
      </div>
      {events.map(ev=>{ const cnt=counts[ev.id]||0,pct=Math.min(Math.round(cnt/ev.max_attendees*100),100); return (
        <div key={ev.id} style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:"14px 16px",marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <div><div style={{fontWeight:600,fontSize:15,color:C.text}}>{ev.title}</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>📍 {ev.location}</div></div>
            <div style={{background:"#1a2a1a",borderRadius:8,padding:"4px 10px",fontSize:12,fontWeight:700,color:"#4caf50",flexShrink:0}}>{new Date(ev.event_date).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}</div>
          </div>
          <div style={{margin:"8px 0"}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginBottom:4}}><span>{cnt} inscrits</span><span>{ev.max_attendees} places</span></div><div style={{height:4,background:C.border,borderRadius:4}}><div style={{height:4,width:pct+"%",background:C.accent,borderRadius:4}}/></div></div>
          <button onClick={()=>toggle(ev.id)} style={{...btn(joined[ev.id]?"#2a2a2a":C.accent,joined[ev.id]?C.muted:"#fff"),width:"100%",fontSize:13}}>{joined[ev.id]?"✓ Inscrit(e)":"Je participe"}</button>
        </div>
      );})}
      {!showForm?<button onClick={()=>setShowForm(true)} style={{width:"100%",padding:"12px",borderRadius:12,background:"transparent",border:"1.5px dashed "+C.border,color:C.muted,fontSize:14,cursor:"pointer"}}>+ Créer un événement</button>
      :<div style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:16,marginTop:8}}>
        <div style={{fontWeight:600,fontSize:15,marginBottom:12,color:C.text}}>Nouvel événement</div>
        {[["Titre","title","text","Ex: Meet Up Lyon"],["Lieu","location","text","Ex: Parking"],["Date","event_date","date",""],["Places max","max_attendees","number","50"]].map(([lbl,k,t,ph])=>(
          <div key={k} style={{marginBottom:10}}><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:4}}>{lbl}</label><input type={t} style={inp} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={ph}/></div>
        ))}
        <div style={{display:"flex",gap:8}}><button onClick={()=>setShowForm(false)} style={{...btn(),flex:1}}>Annuler</button><button onClick={create} disabled={saving} style={{...btn(C.accent,"#fff"),flex:2}}>{saving?"...":"Créer"}</button></div>
      </div>}
    </div>
  );
}

function Profil({ session, onLogout }) {
  const [vehicles, setVehicles] = useState([]); const [postCount, setPostCount] = useState(0); const [newV, setNewV] = useState("");
  const token = session?.access_token; const uid = session?.user?.id;
  const username = session?.user?.email?.split("@")[0];
  useEffect(()=>{ dbGet("vehicles","user_id=eq."+uid+"&select=*",token).then(({data})=>setVehicles(Array.isArray(data)?data:[])); dbGet("posts","user_id=eq."+uid+"&select=id",token).then(({data})=>setPostCount(Array.isArray(data)?data.length:0)); },[]);
  const addV = async () => { if(!newV.trim()) return; await dbPost("vehicles",{user_id:uid,name:newV},token); const {data}=await dbGet("vehicles","user_id=eq."+uid+"&select=*",token); setVehicles(Array.isArray(data)?data:[]); setNewV(""); };
  return (
    <div>
      <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:20,textAlign:"center",marginBottom:14}}>
        <Avatar name={username} size={64}/>
        <div style={{fontWeight:700,fontSize:18,marginTop:10,color:C.text}}>{username}</div>
        <div style={{fontSize:13,color:C.muted}}>{session.user.email}</div>
        <div style={{display:"flex",justifyContent:"center",gap:24,marginTop:14,borderTop:"1px solid "+C.border,paddingTop:14}}>
          <div><div style={{fontWeight:700,fontSize:18,color:C.accent}}>{postCount}</div><div style={{fontSize:11,color:C.muted}}>Posts</div></div>
          <div><div style={{fontWeight:700,fontSize:18,color:C.accent}}>{vehicles.length}</div><div style={{fontSize:11,color:C.muted}}>Véhicules</div></div>
        </div>
      </div>
      <div style={{fontWeight:600,fontSize:15,marginBottom:10,color:C.text}}>Mon Garage</div>
      {vehicles.map(v=><div key={v.id} style={{background:C.card,border:"1px solid "+C.border,borderRadius:12,padding:"12px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:22}}>🚗</span><span style={{fontWeight:500,fontSize:14,color:C.text}}>{v.name}</span></div>)}
      <div style={{display:"flex",gap:8,marginBottom:16}}><input style={{...inp,flex:1}} value={newV} onChange={e=>setNewV(e.target.value)} placeholder="Ex: Golf R Stage 2" onKeyDown={e=>e.key==="Enter"&&addV()}/><button onClick={addV} style={{...btn(C.accent,"#fff"),padding:"10px 14px"}}>+</button></div>
      <button onClick={onLogout} style={{...btn(),width:"100%",color:C.muted}}>Se déconnecter</button>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null); const [tab, setTab] = useState("feed");
  const nav = [
    {id:"feed",label:"Feed",icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>},
    {id:"meetup",label:"Meet Up",icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>},
    {id:"profil",label:"Profil",icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>},
  ];
  if (!session) return <AuthScreen onAuth={setSession}/>;
  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"system-ui,sans-serif",color:C.text,maxWidth:480,margin:"0 auto"}}>
      <div style={{background:C.surface,borderBottom:"1px solid "+C.border,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:32,height:32,background:C.accent,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16,color:"#fff"}}>Y</div>
          <span style={{fontWeight:700,fontSize:18,letterSpacing:-0.5}}>Young<span style={{color:C.accent}}>&amp;Drive</span></span>
        </div>
        <Avatar name={session.user.email.split("@")[0]} size={30}/>
      </div>
      <div style={{padding:"16px 14px 80px"}}>
        {tab==="feed" && <Feed session={session}/>}
        {tab==="meetup" && <MeetUp session={session}/>}
        {tab==="profil" && <Profil session={session} onLogout={()=>setSession(null)}/>}
      </div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:C.surface,borderTop:"1px solid "+C.border,display:"flex",justifyContent:"space-around",padding:"10px 0 14px"}}>
        {nav.map(n=><button key={n.id} onClick={()=>setTab(n.id)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,color:tab===n.id?C.accent:C.muted,fontSize:10,fontWeight:tab===n.id?600:400}}>{n.icon}{n.label}</button>)}
      </div>
    </div>
  );
}