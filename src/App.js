import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iaxkrltfhzpnfnhfmplx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlheGtybHRmaHpwbmZuaGZtcGx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NzU3OTAsImV4cCI6MjA2MzI1MTc5MH0.7x-6e0GkxnZXbBxYBWMNqfQijSYQ8-zKUFxJWeDmPqY';

const C = {
  bg:'#0d1117',surface:'#161b22',card:'#1c2128',
  border:'#30363d',text:'#e6edf3',muted:'#8b949e',
  accent:'#238636',accentHover:'#2ea043'
};

const BANNED = ['merde','putain','connard','connasse','salope','pute','bite','con','cul',
  'enculé','enculer','fdp','ntm','pd','batard','bâtard','nique','niquer',
  'fuck','shit','bitch','bastard','cunt','dick','fag','nigger','pussy','slut','whore',
  'asshole','motherfucker','fucker','retard'];

function hasBanned(str){
  const s=str.toLowerCase().replace(/[^a-z0-9]/g,'');
  return BANNED.some(w=>s.includes(w.replace(/[^a-z0-9]/g,'')));
}

const inp={padding:'9px 12px',background:'#161b22',border:'1px solid #30363d',borderRadius:8,color:'#e6edf3',fontSize:14,outline:'none',width:'100%',boxSizing:'border-box'};

async function dbGet(table,query,token){
  const r=await fetch(SUPABASE_URL+'/rest/v1/'+table+'?'+query,{
    headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+(token||SUPABASE_KEY),'Content-Type':'application/json'}
  });
  return{data:await r.json(),ok:r.ok};
}
async function dbPost(table,body,token){
  const r=await fetch(SUPABASE_URL+'/rest/v1/'+table,{
    method:'POST',
    headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+(token||SUPABASE_KEY),'Content-Type':'application/json','Prefer':'return=representation'},
    body:JSON.stringify(body)
  });
  return{data:await r.json(),ok:r.ok};
}
async function dbPatch(table,query,body,token){
  const r=await fetch(SUPABASE_URL+'/rest/v1/'+table+'?'+query,{
    method:'PATCH',
    headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+(token||SUPABASE_KEY),'Content-Type':'application/json','Prefer':'return=representation'},
    body:JSON.stringify(body)
  });
  return{data:await r.json(),ok:r.ok};
}

function Av({name,size=36}){
  const i=(name||'?').slice(0,2).toUpperCase();
  const cols=['#238636','#1f6feb','#a371f7','#f78166','#ffa657'];
  const c=cols[(name||'').charCodeAt(0)%cols.length];
  return <div style={{width:size,height:size,borderRadius:'50%',background:c,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:size*0.35,color:'#fff',flexShrink:0}}>{i}</div>;
}

function AuthScreen({onAuth}){
  const [email,setEmail]=useState('');
  const [pwd,setPwd]=useState('');
  const [mode,setMode]=useState('login');
  const [err,setErr]=useState('');
  const [loading,setLoading]=useState(false);
  const submit=async()=>{
    setErr('');setLoading(true);
    try{
      const ep=mode==='login'?'/auth/v1/token?grant_type=password':'/auth/v1/signup';
      const r=await fetch(SUPABASE_URL+ep,{method:'POST',headers:{'apikey':SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password:pwd})});
      const d=await r.json();
      if(!r.ok){setErr(d.error_description||d.msg||'Erreur');}
      else{onAuth(d);}
    }catch(e){setErr('Erreur réseau');}
    setLoading(false);
  };
  return(
    <div style={{minHeight:'100vh',background:'#0d1117',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#161b22',border:'1px solid #30363d',borderRadius:16,padding:40,width:360}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{width:48,height:48,background:'#238636',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:22,color:'#fff',margin:'0 auto 12px'}}>Y</div>
          <h1 style={{fontSize:22,fontWeight:700,color:'#e6edf3',margin:0}}>Young<span style={{color:'#238636'}}>&Drive</span></h1>
          <p style={{color:'#8b949e',fontSize:13,marginTop:6}}>Le forum auto des jeunes conducteurs</p>
        </div>
        <div style={{display:'flex',gap:8,marginBottom:24}}>
          {['login','signup'].map(m=><button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:'8px',borderRadius:8,border:'1px solid #30363d',background:mode===m?'#238636':'transparent',color:mode===m?'#fff':'#8b949e',fontWeight:600,fontSize:13,cursor:'pointer'}}>{m==='login'?'Connexion':'Inscription'}</button>)}
        </div>
        {[['Email','email',setEmail],['Mot de passe','password',setPwd]].map(([l,t,set])=>(
          <div key={t} style={{marginBottom:14}}>
            <label style={{fontSize:12,color:'#8b949e',display:'block',marginBottom:5}}>{l}</label>
            <input type={t} style={inp} onKeyDown={e=>e.key==='Enter'&&submit()} onChange={e=>set(e.target.value)}/>
          </div>
        ))}
        {err&&<div style={{color:'#f85149',fontSize:13,marginBottom:12}}>{err}</div>}
        <button onClick={submit} disabled={loading} style={{width:'100%',padding:'10px',borderRadius:9,border:'none',background:'#238636',color:'#fff',fontWeight:700,fontSize:15,cursor:'pointer',marginTop:4}}>
          {loading?'...':(mode==='login'?'Se connecter':'Créer mon compte')}
        </button>
      </div>
    </div>
  );
}

function Feed({session}){
  const [posts,setPosts]=useState([]);
  const [text,setText]=useState('');
  const [saving,setSaving]=useState(false);
  const tk=session?.access_token,uid=session?.user?.id;
  const load=useCallback(async()=>{
    const r=await dbGet('posts','select=*,profiles(username)&order=created_at.desc',tk);
    setPosts(Array.isArray(r.data)?r.data:[]);
  },[tk]);
  useEffect(()=>{load();},[load]);
  const post=async()=>{
    if(!text.trim())return;
    setSaving(true);
    await dbPost('posts',{content:text,user_id:uid},tk);
    setText('');await load();setSaving(false);
  };
  return(
    <div>
      <div style={{background:C.card,border:'1px solid '+C.border,borderRadius:12,padding:20,marginBottom:20}}>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Partage quelque chose..." style={{...inp,resize:'none',height:80,fontFamily:'inherit'}}/>
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:10}}>
          <button onClick={post} disabled={saving} style={{background:C.accent,border:'none',borderRadius:8,color:'#fff',padding:'8px 20px',fontWeight:600,cursor:'pointer',fontSize:14}}>{saving?'...':'Publier'}</button>
        </div>
      </div>
      {posts.map(p=>{
        const uname=p.profiles?.username||p.user_id?.slice(0,8);
        return(
          <div key={p.id} style={{background:C.card,border:'1px solid '+C.border,borderRadius:12,padding:20,marginBottom:14}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
              <Av name={uname} size={36}/>
              <div>
                <div style={{fontWeight:600,fontSize:14,color:C.text}}>{uname}</div>
                <div style={{fontSize:12,color:C.muted}}>{new Date(p.created_at).toLocaleDateString('fr-FR')}</div>
              </div>
            </div>
            <p style={{color:C.text,fontSize:14,lineHeight:1.6,margin:0}}>{p.content}</p>
          </div>
        );
      })}
    </div>
  );
}

function MeetUp({session}){
  const [events,setEvents]=useState([]);
  const [joined,setJoined]=useState({});
  const [counts,setCounts]=useState({});
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({title:'',location:'',event_date:'',max_attendees:''});
  const [saving,setSaving]=useState(false);
  const tk=session?.access_token,uid=session?.user?.id;
  const load=useCallback(async()=>{
    const r=await dbGet('events','select=*&order=event_date.asc',tk);
    const evs=Array.isArray(r.data)?r.data:[];
    setEvents(evs);
    const jr=await dbGet('event_attendees','user_id=eq.'+uid+'&select=event_id',tk);
    const jmap={};(Array.isArray(jr.data)?jr.data:[]).forEach(x=>{jmap[x.event_id]=true});
    setJoined(jmap);
    const cmap={};
    await Promise.all(evs.map(async ev=>{
      const cr=await dbGet('event_attendees','event_id=eq.'+ev.id+'&select=id',tk);
      cmap[ev.id]=Array.isArray(cr.data)?cr.data.length:0;
    }));
    setCounts(cmap);
  },[tk,uid]);
  useEffect(()=>{load();},[load]);
  const toggle=async(eid)=>{
    if(joined[eid]){
      await fetch(SUPABASE_URL+'/rest/v1/event_attendees?event_id=eq.'+eid+'&user_id=eq.'+uid,{method:'DELETE',headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+tk}});
    }else{
      await dbPost('event_attendees',{event_id:eid,user_id:uid},tk);
    }
    await load();
  };
  const create=async()=>{
    if(!form.title.trim())return;
    setSaving(true);
    await dbPost('events',{...form,max_attendees:parseInt(form.max_attendees)||10,created_by:uid},tk);
    setForm({title:'',location:'',event_date:'',max_attendees:''});
    setShowForm(false);await load();setSaving(false);
  };
  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <h2 style={{fontWeight:700,fontSize:22,color:C.text,margin:0}}>Meet Up</h2>
        <button onClick={()=>setShowForm(!showForm)} style={{background:C.accent,border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',fontWeight:600,cursor:'pointer',fontSize:14}}>+ Créer</button>
      </div>
      {showForm&&<div style={{background:C.card,border:'1px solid '+C.border,borderRadius:12,padding:24,marginBottom:24}}>
        <h3 style={{fontWeight:600,fontSize:16,color:C.text,margin:'0 0 16px'}}>Nouvel événement</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
          {[['Titre','title','text'],['Lieu','location','text'],['Date','event_date','date'],['Places','max_attendees','number']].map(([l,k,t])=>(
            <div key={k}><label style={{fontSize:12,color:C.muted,display:'block',marginBottom:5}}>{l}</label><input type={t} style={inp} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>
          ))}
        </div>
        <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
          <button onClick={()=>setShowForm(false)} style={{background:'transparent',border:'1px solid '+C.border,borderRadius:8,color:C.muted,padding:'8px 20px',cursor:'pointer',fontSize:14}}>Annuler</button>
          <button onClick={create} disabled={saving} style={{background:C.accent,border:'none',borderRadius:8,color:'#fff',padding:'8px 20px',fontWeight:600,cursor:'pointer',fontSize:14}}>{saving?'...':'Créer'}</button>
        </div>
      </div>}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16}}>
        {events.map(ev=>{
          const cnt=counts[ev.id]||0,pct=Math.min(~~(cnt/ev.max_attendees*100),100);
          return(
            <div key={ev.id} style={{background:C.card,border:'1px solid '+C.border,borderRadius:12,padding:20}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                <div><div style={{fontWeight:600,fontSize:16,color:C.text}}>{ev.title}</div><div style={{fontSize:13,color:C.muted,marginTop:3}}>📍 {ev.location}</div></div>
                <div style={{background:'#1a2a1a',borderRadius:8,padding:'5px 12px',fontSize:12,fontWeight:700,color:'#4caf50',flexShrink:0}}>{new Date(ev.event_date).toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}</div>
              </div>
              <div style={{marginBottom:14}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:C.muted,marginBottom:5}}><span>{cnt} inscrits</span><span>{ev.max_attendees} places</span></div>
                <div style={{height:5,background:C.border,borderRadius:3}}><div style={{height:5,width:pct+'%',background:C.accent,borderRadius:3}}/></div>
              </div>
              <button onClick={()=>toggle(ev.id)} style={{width:'100%',padding:'9px',borderRadius:8,border:'1px solid '+(joined[ev.id]?C.border:C.accent),background:joined[ev.id]?'transparent':C.accent,color:joined[ev.id]?C.muted:'#fff',fontWeight:600,fontSize:13,cursor:'pointer'}}>{joined[ev.id]?'Inscrit ✓':'Je participe'}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Profil({session,onLogout}){
  const [vehicles,setVehicles]=useState([]);
  const [postCount,setPostCount]=useState(0);
  const [newV,setNewV]=useState('');
  const [profile,setProfile]=useState(null);
  const [editingUsername,setEditingUsername]=useState(false);
  const [newUsername,setNewUsername]=useState('');
  const [usernameError,setUsernameError]=useState('');
  const [usernameLoading,setUsernameLoading]=useState(false);
  const tk=session?.access_token,uid=session?.user?.id;
  const username=profile?.username||session?.user?.email?.split('@')[0];

  useEffect(()=>{
    dbGet('profiles','id=eq.'+uid+'&select=*',tk).then(r=>{
      const p=Array.isArray(r.data)?r.data[0]:null;
      setProfile(p);
    });
    dbGet('vehicles','user_id=eq.'+uid+'&select=*',tk).then(r=>setVehicles(Array.isArray(r.data)?r.data:[]));
    dbGet('posts','user_id=eq.'+uid+'&select=id',tk).then(r=>setPostCount(Array.isArray(r.data)?r.data.length:0));
  },[uid,tk]);

  const canChange=()=>{
    if(!profile?.username_changed_at)return true;
    return(new Date()-new Date(profile.username_changed_at))/(1000*60*60*24)>=30;
  };
  const daysLeft=()=>{
    if(!profile?.username_changed_at)return 0;
    return Math.ceil(30-(new Date()-new Date(profile.username_changed_at))/(1000*60*60*24));
  };

  const saveUsername=async()=>{
    setUsernameError('');
    const val=newUsername.trim();
    if(val.length<3||val.length>20){setUsernameError('3 à 20 caractères requis');return;}
    if(!/^[a-zA-Z0-9_]+$/.test(val)){setUsernameError('Lettres, chiffres et _ uniquement');return;}
    if(hasBanned(val)){setUsernameError('Ce pseudo contient un mot interdit');return;}
    if(!canChange()){setUsernameError('1 changement par mois max. Encore '+daysLeft()+' jours.');return;}
    setUsernameLoading(true);
    const check=await dbGet('profiles','username=eq.'+val+'&select=id',tk);
    if(Array.isArray(check.data)&&check.data.length>0&&check.data[0].id!==uid){
      setUsernameError('Ce pseudo est déjà pris');setUsernameLoading(false);return;
    }
    const r=await dbPatch('profiles','id=eq.'+uid,{username:val,username_changed_at:new Date().toISOString()},tk);
    if(r.ok){
      setProfile(prev=>({...prev,username:val,username_changed_at:new Date().toISOString()}));
      setEditingUsername(false);setNewUsername('');
    }else{setUsernameError('Erreur lors de la mise à jour');}
    setUsernameLoading(false);
  };

  const addV=async()=>{
    if(!newV.trim())return;
    await dbPost('vehicles',{user_id:uid,name:newV},tk);
    const r=await dbGet('vehicles','user_id=eq.'+uid+'&select=*',tk);
    setVehicles(Array.isArray(r.data)?r.data:[]);setNewV('');
  };

  return(
    <div style={{display:'flex',gap:24,alignItems:'flex-start'}}>
      <div style={{width:280,flexShrink:0}}>
        <div style={{background:C.card,border:'1px solid '+C.border,borderRadius:12,padding:24,textAlign:'center',marginBottom:16}}>
          <Av name={username} size={72}/>
          <div style={{fontWeight:700,fontSize:20,color:C.text,marginTop:12,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            {username}
            {canChange()
              ?<button onClick={()=>{setEditingUsername(true);setNewUsername(username);}} title="Changer le pseudo" style={{background:'transparent',border:'none',cursor:'pointer',color:C.muted,fontSize:14,padding:2}}>✏️</button>
              :<span title={'Disponible dans '+daysLeft()+' jours'} style={{fontSize:12,color:C.muted,cursor:'help'}}>🔒</span>
            }
          </div>
          {editingUsername&&(
            <div style={{marginTop:12}}>
              <input style={{...inp,textAlign:'center',marginBottom:8}} value={newUsername} onChange={e=>setNewUsername(e.target.value)} placeholder="Nouveau pseudo" maxLength={20}/>
              {usernameError&&<div style={{color:'#f85149',fontSize:12,marginBottom:8}}>{usernameError}</div>}
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>{setEditingUsername(false);setUsernameError('');}} style={{flex:1,padding:'6px',borderRadius:7,border:'1px solid '+C.border,background:'transparent',color:C.muted,fontSize:13,cursor:'pointer'}}>Annuler</button>
                <button onClick={saveUsername} disabled={usernameLoading} style={{flex:1,padding:'6px',borderRadius:7,border:'none',background:C.accent,color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer'}}>{usernameLoading?'...':'Sauvegarder'}</button>
              </div>
              <div style={{fontSize:11,color:C.muted,marginTop:8}}>1 changement par mois max</div>
            </div>
          )}
          <div style={{fontSize:13,color:C.muted,marginTop:4}}>{session.user.email}</div>
          <div style={{display:'flex',justifyContent:'center',gap:24,marginTop:20,paddingTop:20,borderTop:'1px solid '+C.border}}>
            <div><div style={{fontWeight:700,fontSize:22,color:C.accent}}>{postCount}</div><div style={{fontSize:12,color:C.muted}}>Posts</div></div>
            <div><div style={{fontWeight:700,fontSize:22,color:C.accent}}>{vehicles.length}</div><div style={{fontSize:12,color:C.muted}}>Véhicules</div></div>
          </div>
        </div>
        <button onClick={onLogout} style={{width:'100%',padding:'10px',borderRadius:9,border:'1px solid '+C.border,background:'transparent',color:C.muted,fontSize:14,cursor:'pointer'}}>Se déconnecter</button>
      </div>
      <div style={{flex:1}}>
        <h2 style={{fontWeight:700,fontSize:22,color:C.text,margin:'0 0 20px'}}>Mon Garage</h2>
        <div style={{display:'flex',gap:10,marginBottom:20}}>
          <input style={{flex:1,padding:'9px 12px',background:C.surface,border:'1px solid '+C.border,borderRadius:8,color:C.text,fontSize:14,outline:'none'}} value={newV} onChange={e=>setNewV(e.target.value)} placeholder="Ex: Golf R Stage 2" onKeyDown={e=>e.key==='Enter'&&addV()}/>
          <button onClick={addV} style={{background:C.accent,border:'none',borderRadius:8,color:'#fff',padding:'9px 18px',fontWeight:600,cursor:'pointer',fontSize:14}}>+ Ajouter</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:14}}>
          {vehicles.length===0
            ?<div style={{color:C.muted,fontSize:14}}>Ajoute ta première voiture !</div>
            :vehicles.map(v=>(
              <div key={v.id} style={{background:C.card,border:'1px solid '+C.border,borderRadius:12,padding:20,display:'flex',alignItems:'center',gap:14}}>
                <div style={{width:44,height:44,background:C.surface,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>🚗</div>
                <div style={{fontWeight:600,fontSize:14,color:C.text}}>{v.name}</div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

export default function App(){
  const [session,setSession]=useState(()=>{
    try{const s=localStorage.getItem('yd_session');return s?JSON.parse(s):null;}catch{return null;}
  });
  const [tab,setTab]=useState('feed');

  const handleAuth=(s)=>{
    localStorage.setItem('yd_session',JSON.stringify(s));
    setSession(s);
  };
  const handleLogout=()=>{
    localStorage.removeItem('yd_session');
    setSession(null);
  };

  if(!session)return <AuthScreen onAuth={handleAuth}/>;

  const username=session?.user?.email?.split('@')[0];
  const nav=[{id:'feed',label:'Feed'},{id:'meetup',label:'Meet Up'},{id:'profil',label:'Mon profil'}];

  return(
    <div style={{background:C.bg,minHeight:'100vh',fontFamily:'system-ui,sans-serif',color:C.text}}>
      <div style={{background:C.surface,borderBottom:'1px solid '+C.border,position:'sticky',top:0,zIndex:100}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 32px',display:'flex',alignItems:'center',height:56}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginRight:40}}>
            <div style={{width:30,height:30,background:C.accent,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:15,color:'#fff'}}>Y</div>
            <span style={{fontWeight:700,fontSize:17}}>Young<span style={{color:C.accent}}>&Drive</span></span>
          </div>
          <div style={{display:'flex',gap:4,flex:1}}>
            {nav.map(n=><button key={n.id} onClick={()=>setTab(n.id)} style={{background:tab===n.id?C.card:'transparent',border:'none',cursor:'pointer',padding:'6px 14px',borderRadius:8,color:tab===n.id?C.text:C.muted,fontWeight:tab===n.id?600:400,fontSize:14}}>{n.label}</button>)}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:13,color:C.muted}}>{username}</span>
            <Av name={username} size={30}/>
          </div>
        </div>
      </div>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'32px'}}>
        {tab==='feed'&&<Feed session={session}/>}
        {tab==='meetup'&&<MeetUp session={session}/>}
        {tab==='profil'&&<Profil session={session} onLogout={handleLogout}/>}
      </div>
    </div>
  );
}
