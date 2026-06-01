import React, { useState, useEffect, useCallback } from 'react';
const SB_URL='https://oywuyqmuhjxdjpjhnevt.supabase.co',SB_KEY='sb_publishable_1uKDWu3XdnkHnID6US2S7w_84hO45GJ';
const sbFetch=async(p,o={},t=null)=>{const h={'apikey':SB_KEY,'Content-Type':'application/json','Prefer':'return=representation',...(t?{'Authorization':'Bearer '+t}:{}),...(o.headers||{})};const r=await fetch(SB_URL+p,{...o,headers:h});const tx=await r.text();try{return{data:tx?JSON.parse(tx):null,ok:r.ok}}catch{return{data:tx,ok:r.ok}}};
const authPost=(ep,b)=>sbFetch('/auth/v1'+ep,{method:'POST',body:JSON.stringify(b)});
const dbGet=(t,q='',tk=null)=>sbFetch('/rest/v1/'+t+'?'+q,{},tk);
const dbPost=(t,b,tk)=>sbFetch('/rest/v1/'+t,{method:'POST',body:JSON.stringify(b)},tk);
const dbDelete=(t,q,tk)=>sbFetch('/rest/v1/'+t+'?'+q,{method:'DELETE'},tk);
const C={bg:'#0d0d0d',surface:'#141414',card:'#1c1c1c',border:'#272727',accent:'#e8420a',text:'#f0f0f0',muted:'#666'};
const TAGS={Tuning:'#e8420a',Actualites:'#1976d2',MeetUp:'#2e7d32',Circuit:'#7b1fa2',Electrique:'#0097a7'};
const CATS=['Toutes','Tuning','Actualites','Electrique','Circuit','MeetUp'];
const ago=ts=>{const d=(Date.now()-new Date(ts))/1e3;if(d<60)return'maintenant';if(d<3600)return~~(d/60)+'min';if(d<86400)return~~(d/3600)+'h';return~~(d/86400)+'j'};
function Av({name,size=32}){return <div style={{width:size,height:size,borderRadius:'50%',background:'#2a1a14',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.38,fontWeight:700,color:C.accent,flexShrink:0}}>{(name||'?').substring(0,2).toUpperCase()}</div>}
function Tag({label}){const col=TAGS[label]||C.accent;return <span style={{background:col+'22',color:col,fontSize:11,fontWeight:600,padding:'2px 10px',borderRadius:20}}>{label}</span>}
function AuthScreen({onAuth}){
  const [mode,setMode]=useState('login'),[email,setEmail]=useState(''),[pw,setPw]=useState(''),[loading,setLoading]=useState(false),[msg,setMsg]=useState(null);
  const inp={width:'100%',padding:'10px 14px',background:C.surface,border:'1px solid '+C.border,borderRadius:8,color:C.text,fontSize:14,outline:'none',boxSizing:'border-box'};
  const submit=async()=>{setMsg(null);setLoading(true);if(mode==='signup'){const{ok,data}=await authPost('/signup',{email,password:pw});if(!ok)setMsg({err:(data&&data.msg)||'Erreur'});else setMsg({ok:'Compte cree!'});}else{const{ok,data}=await authPost('/token?grant_type=password',{email,password:pw});if(!ok)setMsg({err:'Identifiants incorrects'});else onAuth(data);}setLoading(false)};
  return(<div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'system-ui'}}>
    <div style={{display:'flex',gap:80,alignItems:'center',maxWidth:900,width:'100%',padding:'0 40px'}}>
      <div style={{flex:1}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
          <div style={{width:52,height:52,background:C.accent,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:26,color:'#fff'}}>Y</div>
          <div style={{fontWeight:800,fontSize:32,color:C.text}}>Young<span style={{color:C.accent}}>&amp;Drive</span></div>
        </div>
        <p style={{fontSize:16,color:C.muted,lineHeight:1.7,marginBottom:24}}>La communaute des passionnes automobile.</p>
        {['Poste tes builds et avis','Organise des Meet Up','Gere ton garage virtuel'].map(f=><div key={f} style={{fontSize:14,color:'#444',border:'1px solid '+C.border,borderRadius:10,padding:'10px 16px',marginBottom:10}}>{f}</div>)}
      </div>
      <div style={{width:380,background:C.card,borderRadius:16,border:'1px solid '+C.border,padding:32}}>
        <h2 style={{fontWeight:700,fontSize:22,marginBottom:24,color:C.text}}>{mode==='login'?'Connexion':'Inscription'}</h2>
        <div style={{display:'flex',gap:4,marginBottom:24,background:C.surface,borderRadius:10,padding:4}}>
          {['login','signup'].map(m=><button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:'8px',borderRadius:7,border:'none',cursor:'pointer',background:mode===m?C.accent:'transparent',color:mode===m?'#fff':C.muted,fontWeight:600,fontSize:13}}>{m==='login'?'Connexion':'Inscription'}</button>)}
        </div>
        <div style={{marginBottom:12}}><label style={{fontSize:12,color:C.muted,display:'block',marginBottom:5}}>Email</label><input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="ton@email.com"/></div>
        <div style={{marginBottom:18}}><label style={{fontSize:12,color:C.muted,display:'block',marginBottom:5}}>Mot de passe</label><input style={inp} type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}/></div>
        {msg&&msg.err&&<div style={{background:'#3a1111',borderRadius:8,padding:'8px 12px',fontSize:13,color:'#ff8080',marginBottom:12}}>{msg.err}</div>}
        {msg&&msg.ok&&<div style={{background:'#1a3a1a',borderRadius:8,padding:'8px 12px',fontSize:13,color:'#80ff80',marginBottom:12}}>{msg.ok}</div>}
        <button onClick={submit} disabled={loading} style={{width:'100%',padding:'11px',borderRadius:9,border:'none',cursor:'pointer',background:C.accent,color:'#fff',fontWeight:700,fontSize:15,opacity:loading?0.6:1}}>{loading?'...':(mode==='login'?'Se connecter':'Creer mon compte')}</button>
      </div>
    </div>
  </div>)
}
function Feed({session}){
  const [posts,setPosts]=useState([]),[cat,setCat]=useState('Toutes'),[content,setContent]=useState(''),[tag,setTag]=useState('Tuning'),[posting,setPosting]=useState(false);
  const tk=session&&session.access_token;
  const load=useCallback(async()=>{let q='select=*,profiles(username)&order=created_at.desc&limit=30';if(cat!=='Toutes')q+='&tag=eq.'+encodeURIComponent(cat);const{data}=await dbGet('posts',q,tk);setPosts(Array.isArray(data)?data:[])},[cat,tk]);
  useEffect(()=>{load()},[load]);
  const pub=async()=>{if(!content.trim())return;setPosting(true);await dbPost('posts',{user_id:session.user.id,content,tag},tk);setContent('');await load();setPosting(false)};
  return(<div style={{display:'flex',gap:24}}>
    <div style={{flex:1,minWidth:0}}>
      <div style={{background:C.card,border:'1px solid '+C.border,borderRadius:12,padding:20,marginBottom:20}}>
        <div style={{display:'flex',gap:12,marginBottom:content?12:0}}><Av name={session.user.email} size={38}/><textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Partage ton build, ton avis..." rows={content?3:1} style={{flex:1,background:C.surface,border:'1px solid '+C.border,borderRadius:8,color:C.text,fontSize:14,padding:'10px 14px',resize:'none',outline:'none',fontFamily:'system-ui'}}/></div>
        {content&&<div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
          <select value={tag} onChange={e=>setTag(e.target.value)} style={{background:C.surface,border:'1px solid '+C.border,borderRadius:8,color:C.text,padding:'6px 10px',fontSize:13}}>{Object.keys(TAGS).map(t=><option key={t}>{t}</option>)}</select>
          <button onClick={()=>setContent('')} style={{background:'transparent',border:'1px solid '+C.border,borderRadius:8,color:C.muted,padding:'6px 14px',fontSize:13,cursor:'pointer'}}>Annuler</button>
          <button onClick={pub} disabled={posting} style={{background:C.accent,border:'none',borderRadius:8,color:'#fff',padding:'6px 18px',fontSize:13,fontWeight:600,cursor:'pointer'}}>{posting?'...':'Publier'}</button>
        </div>}
      </div>
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>{CATS.map(c=><button key={c} onClick={()=>setCat(c)} style={{padding:'5px 16px',borderRadius:20,border:'1px solid '+(cat===c?C.accent:C.border),background:cat===c?C.accent+'22':'transparent',color:cat===c?C.accent:C.muted,fontSize:13,cursor:'pointer'}}>{c}</button>)}</div>
      {posts.length===0?<div style={{textAlign:'center',color:C.muted,padding:60,background:C.card,borderRadius:12,border:'1px solid '+C.border}}>Aucun post - sois le premier !</div>:posts.map(p=><div key={p.id} style={{background:C.card,border:'1px solid '+C.border,borderRadius:12,padding:20,marginBottom:12}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}><Av name={(p.profiles&&p.profiles.username)||'?'} size={36}/><div><div style={{fontWeight:600,fontSize:14,color:C.text}}>{(p.profiles&&p.profiles.username)||'Pilote'}</div><div style={{fontSize:12,color:C.muted}}>{ago(p.created_at)}</div></div><div style={{marginLeft:'auto'}}><Tag label={p.tag||'Tuning'}/></div></div>
        <p style={{fontSize:15,color:C.text,lineHeight:1.6,margin:0}}>{p.content}</p>
      </div>)}
    </div>
    <div style={{width:260,flexShrink:0}}><div style={{background:C.card,border:'1px solid '+C.border,borderRadius:12,padding:16}}><div style={{fontWeight:600,fontSize:14,marginBottom:12,color:C.text}}>Tendances</div>{['Golf R','Supra MK4','Alpine A290','Civic Type R','AMG GT'].map((t,i)=><div key={t} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:i<4?'1px solid '+C.border:'none'}}><span style={{fontSize:12,color:C.muted,width:16}}>#{i+1}</span><span style={{fontSize:13,color:C.text}}>{t}</span></div>)}</div></div>
  </div>)
}
function MeetUp({session}){
  const [events,setEvents]=useState([]),[counts,setCounts]=useState({}),[joined,setJoined]=useState({}),[showForm,setShowForm]=useState(false),[form,setForm]=useState({title:'',location:'',event_date:'',max_attendees:'50'}),[saving,setSaving]=useState(false);
  const tk=session&&session.access_token,uid=session&&session.user&&session.user.id;
  const load=async()=>{const r1=await dbGet('events','select=*,profiles(username)&order=event_date',tk);setEvents(Array.isArray(r1.data)?r1.data:[]);const r2=await dbGet('event_attendees','select=event_id,user_id',tk);const c={},j={};(r2.data||[]).forEach(a=>{c[a.event_id]=(c[a.event_id]||0)+1;if(a.user_id===uid)j[a.event_id]=true});setCounts(c);setJoined(j)};
  useEffect(()=>{load()},[]);
  const toggle=async eid=>{if(joined[eid])await dbDelete('event_attendees','event_id=eq.'+eid+'&user_id=eq.'+uid,tk);else await dbPost('event_attendees',{event_id:eid,user_id:uid},tk);await load()};
  const create=async()=>{if(!form.title||!form.location||!form.event_date)return;setSaving(true);await dbPost('events',{...form,user_id:uid,max_attendees:parseInt(form.max_attendees)},tk);setShowForm(false);setForm({title:'',location:'',event_date:'',max_attendees:'50'});await load();setSaving(false)};
  const inp={width:'100%',padding:'9px 12px',background:C.surface,border:'1px solid '+C.border,borderRadius:8,color:C.text,fontSize:14,boxSizing:'border-box',outline:'none'};
  return(<div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
      <div><h2 style={{fontWeight:700,fontSize:22,color:C.text,margin:0}}>Meet Up</h2><p style={{color:C.muted,fontSize:14,margin:'4px 0 0'}}>Rejoins les rassemblements</p></div>
      <button onClick={()=>setShowForm(!showForm)} style={{background:C.accent,border:'none',borderRadius:9,color:'#fff',padding:'9px 20px',fontWeight:600,fontSize:14,cursor:'pointer'}}>+ Creer un event</button>
    </div>
    {showForm&&<div style={{background:C.card,border:'1px solid '+C.border,borderRadius:12,padding:24,marginBottom:24}}>
      <h3 style={{fontWeight:600,fontSize:16,color:C.text,margin:'0 0 16px'}}>Nouvel evenement</h3>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>{[['Titre','title','text'],['Lieu','location','text'],['Date','event_date','date'],['Places','max_attendees','number']].map(([l,k,t])=><div key={k}><label style={{fontSize:12,color:C.muted,display:'block',marginBottom:5}}>{l}</label><input type={t} style={inp} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>)}</div>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}><button onClick={()=>setShowForm(false)} style={{background:'transparent',border:'1px solid '+C.border,borderRadius:8,color:C.muted,padding:'8px 20px',cursor:'pointer',fontSize:14}}>Annuler</button><button onClick={create} disabled={saving} style={{background:C.accent,border:'none',borderRadius:8,color:'#fff',padding:'8px 20px',fontWeight:600,cursor:'pointer',fontSize:14}}>{saving?'...':'Creer'}</button></div>
    </div>}
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16}}>{events.map(ev=>{const cnt=counts[ev.id]||0,pct=Math.min(~~(cnt/ev.max_attendees*100),100);return(<div key={ev.id} style={{background:C.card,border:'1px solid '+C.border,borderRadius:12,padding:20}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}><div><div style={{fontWeight:600,fontSize:16,color:C.text}}>{ev.title}</div><div style={{fontSize:13,color:C.muted,marginTop:3}}>📍 {ev.location}</div></div><div style={{background:'#1a2a1a',borderRadius:8,padding:'5px 12px',fontSize:12,fontWeight:700,color:'#4caf50',flexShrink:0}}>{new Date(ev.event_date).toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}</div></div>
      <div style={{marginBottom:14}}><div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:C.muted,marginBottom:5}}><span>{cnt} inscrits</span><span>{ev.max_attendees} places</span></div><div style={{height:5,background:C.border,borderRadius:3}}><div style={{height:5,width:pct+'%',background:C.accent,borderRadius:3}}/></div></div>
      <button onClick={()=>toggle(ev.id)} style={{width:'100%',padding:'9px',borderRadius:8,border:'1px solid '+(joined[ev.id]?C.border:C.accent),background:joined[ev.id]?'transparent':C.accent,color:joined[ev.id]?C.muted:'#fff',fontWeight:600,fontSize:13,cursor:'pointer'}}>{joined[ev.id]?'Inscrit':'Je participe'}</button>
    </div>)})}</div>
  </div>)
}
function Profil({session,onLogout}){
  const [vehicles,setVehicles]=useState([]),[postCount,setPostCount]=useState(0),[newV,setNewV]=useState('');
  const tk=session&&session.access_token,uid=session&&session.user&&session.user.id,username=session&&session.user&&session.user.email&&session.user.email.split('@')[0];
  useEffect(()=>{dbGet('vehicles','user_id=eq.'+uid+'&select=*',tk).then(r=>setVehicles(Array.isArray(r.data)?r.data:[]));dbGet('posts','user_id=eq.'+uid+'&select=id',tk).then(r=>setPostCount(Array.isArray(r.data)?r.data.length:0))},[]);
  const addV=async()=>{if(!newV.trim())return;await dbPost('vehicles',{user_id:uid,name:newV},tk);const r=await dbGet('vehicles','user_id=eq.'+uid+'&select=*',tk);setVehicles(Array.isArray(r.data)?r.data:[]);setNewV('')};
  return(<div style={{display:'flex',gap:24,alignItems:'flex-start'}}>
    <div style={{width:280,flexShrink:0}}>
      <div style={{background:C.card,border:'1px solid '+C.border,borderRadius:12,padding:24,textAlign:'center',marginBottom:16}}>
        <Av name={username} size={72}/>
        <div style={{fontWeight:700,fontSize:20,color:C.text,marginTop:12}}>{username}</div>
        <div style={{fontSize:13,color:C.muted,marginTop:4}}>{session.user.email}</div>
        <div style={{display:'flex',justifyContent:'center',gap:24,marginTop:20,paddingTop:20,borderTop:'1px solid '+C.border}}>
          <div><div style={{fontWeight:700,fontSize:22,color:C.accent}}>{postCount}</div><div style={{fontSize:12,color:C.muted}}>Posts</div></div>
          <div><div style={{fontWeight:700,fontSize:22,color:C.accent}}>{vehicles.length}</div><div style={{fontSize:12,color:C.muted}}>Vehicules</div></div>
        </div>
      </div>
      <button onClick={onLogout} style={{width:'100%',padding:'10px',borderRadius:9,border:'1px solid '+C.border,background:'transparent',color:C.muted,fontSize:14,cursor:'pointer'}}>Se deconnecter</button>
    </div>
    <div style={{flex:1}}>
      <h2 style={{fontWeight:700,fontSize:22,color:C.text,margin:'0 0 20px'}}>Mon Garage</h2>
      <div style={{display:'flex',gap:10,marginBottom:20}}><input style={{flex:1,padding:'9px 12px',background:C.surface,border:'1px solid '+C.border,borderRadius:8,color:C.text,fontSize:14,outline:'none'}} value={newV} onChange={e=>setNewV(e.target.value)} placeholder="Ex: Golf R Stage 2" onKeyDown={e=>e.key==='Enter'&&addV()}/><button onClick={addV} style={{background:C.accent,border:'none',borderRadius:8,color:'#fff',padding:'9px 18px',fontWeight:600,cursor:'pointer',fontSize:14}}>+ Ajouter</button></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:14}}>
        {vehicles.length===0?<div style={{color:C.muted,fontSize:14}}>Ajoute ta premiere voiture !</div>:vehicles.map(v=><div key={v.id} style={{background:C.card,border:'1px solid '+C.border,borderRadius:12,padding:20,display:'flex',alignItems:'center',gap:14}}><div style={{width:44,height:44,background:C.surface,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>🚗</div><div style={{fontWeight:600,fontSize:14,color:C.text}}>{v.name}</div></div>)}
      </div>
    </div>
  </div>)
}
export default function App(){
  const [session,setSession]=useState(null),[tab,setTab]=useState('feed');
  const username=session&&session.user&&session.user.email&&session.user.email.split('@')[0];
  const nav=[{id:'feed',label:'Feed'},{id:'meetup',label:'Meet Up'},{id:'profil',label:'Mon profil'}];
  if(!session)return <AuthScreen onAuth={setSession}/>;
  return(<div style={{background:C.bg,minHeight:'100vh',fontFamily:'system-ui,sans-serif',color:C.text}}>
    <div style={{background:C.surface,borderBottom:'1px solid '+C.border,position:'sticky',top:0,zIndex:100}}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 32px',display:'flex',alignItems:'center',height:56}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginRight:40}}><div style={{width:30,height:30,background:C.accent,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:15,color:'#fff'}}>Y</div><span style={{fontWeight:700,fontSize:17}}>Young<span style={{color:C.accent}}>&amp;Drive</span></span></div>
        <div style={{display:'flex',gap:4,flex:1}}>{nav.map(n=><button key={n.id} onClick={()=>setTab(n.id)} style={{background:tab===n.id?C.card:'transparent',border:'none',cursor:'pointer',padding:'6px 14px',borderRadius:8,color:tab===n.id?C.text:C.muted,fontWeight:tab===n.id?600:400,fontSize:14}}>{n.label}</button>)}</div>
        <div style={{display:'flex',alignItems:'center',gap:10}}><span style={{fontSize:13,color:C.muted}}>{username}</span><Av name={username} size={30}/></div>
      </div>
    </div>
    <div style={{maxWidth:1200,margin:'0 auto',padding:'32px'}}>
      {tab==='feed'&&<Feed session={session}/>}
      {tab==='meetup'&&<MeetUp session={session}/>}
      {tab==='profil'&&<Profil session={session} onLogout={()=>setSession(null)}/>}
    </div>
  </div>)
}