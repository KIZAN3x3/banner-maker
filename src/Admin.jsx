import { useState, useRef, useEffect } from "react";

const ADMIN_PASSWORD = "123123";
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const GITHUB_OWNER = "KIZAN3x3";
const GITHUB_REPO = "banner-maker";
const GITHUB_BRANCH = "main";

const C = {
  g1:"#EB6100", g2:"#F18D00",
  ink:"#18120A", inkS:"#3D2E1E",
  white:"#FFFFFF", cream:"#FAF6F0",
  gray:"#9C8E80", grayL:"#D6CEC4", grayLL:"#EDE7DF",
  dark:"#0F0A05", green:"#22C55E", red:"#EF4444",
};

const SNS_SIZES = [
  { id:"reel",   label:"リール・ストーリーズ", w:1080, h:1920 },
  { id:"feed_v", label:"フィード縦",           w:1080, h:1350 },
  { id:"feed_sq",label:"フィード正方形",        w:1080, h:1080 },
];

async function getFileSha(path) {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
    { headers: { Authorization:`token ${GITHUB_TOKEN}`, Accept:"application/vnd.github.v3+json" } }
  );
  if (!res.ok) return undefined;
  return (await res.json()).sha;
}

async function uploadFile(path, base64, message) {
  const sha = await getFileSha(path);
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
    {
      method:"PUT",
      headers:{ Authorization:`token ${GITHUB_TOKEN}`, Accept:"application/vnd.github.v3+json", "Content-Type":"application/json" },
      body:JSON.stringify({ message, content:base64, branch:GITHUB_BRANCH, ...(sha?{sha}:{}) }),
    }
  );
  if (!res.ok) throw new Error(await res.text());
}

async function deleteFile(path, message) {
  const sha = await getFileSha(path);
  if (!sha) return;
  await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
    {
      method:"DELETE",
      headers:{ Authorization:`token ${GITHUB_TOKEN}`, Accept:"application/vnd.github.v3+json", "Content-Type":"application/json" },
      body:JSON.stringify({ message, sha, branch:GITHUB_BRANCH }),
    }
  );
}

async function getFileContent(path) {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
    { headers:{ Authorization:`token ${GITHUB_TOKEN}`, Accept:"application/vnd.github.v3+json" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return atob(data.content.replace(/\n/g,""));
}

function toBase64(file) {
  return new Promise((resolve,reject)=>{
    const r = new FileReader();
    r.onload = ()=>resolve(r.result.split(",")[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pw,     setPw]     = useState("");
  const [err,    setErr]    = useState("");
  const [tab,    setTab]    = useState("tabs");

  const login = () => {
    if (pw===ADMIN_PASSWORD) setAuthed(true);
    else { setErr("パスワードが違います"); setTimeout(()=>setErr(""),1500); }
  };

  if (!authed) return (
    <div style={{ minHeight:"100vh", background:C.dark, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Noto Sans JP',sans-serif" }}>
      <div style={{ background:C.ink, borderRadius:20, padding:"40px 32px", width:300, boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ width:56, height:56, borderRadius:14, background:`linear-gradient(135deg,${C.g1},${C.g2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:900, color:C.white, margin:"0 auto 14px" }}>管理</div>
          <p style={{ margin:0, fontSize:18, fontWeight:700, color:C.white }}>管理者ページ</p>
        </div>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="管理者パスワード"
          style={{ width:"100%", padding:"13px 16px", background:"#2A1E12", border:`1.5px solid ${err?C.red:C.grayL}`, borderRadius:10, color:C.white, fontSize:16, outline:"none", boxSizing:"border-box", fontFamily:"'Noto Sans JP',sans-serif" }}
        />
        {err&&<p style={{ color:C.red, fontSize:12, margin:"6px 0 0", textAlign:"center" }}>{err}</p>}
        <button onClick={login} style={{ width:"100%", marginTop:14, padding:"14px", background:`linear-gradient(135deg,${C.g1},${C.g2})`, border:"none", borderRadius:12, color:C.white, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"'Noto Sans JP',sans-serif" }}>ログイン</button>
      </div>
      <style>{`input::placeholder{color:#5A4A38} *{box-sizing:border-box}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.cream, fontFamily:"'Noto Sans JP',sans-serif", color:C.ink, paddingBottom:60 }}>
      <header style={{ background:C.ink, height:56, display:"flex", alignItems:"center", padding:"0 16px", gap:12, position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 20px #00000055" }}>
        <div style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg,${C.g1},${C.g2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:C.white }}>管理</div>
        <p style={{ margin:0, fontSize:13, fontWeight:700, color:C.white, flex:1 }}>バナーメーカー管理者</p>
        <a href="/" style={{ fontSize:12, color:C.gray, textDecoration:"none" }}>← アプリへ</a>
      </header>

      <div style={{ background:C.white, borderBottom:`1px solid ${C.grayLL}`, display:"flex" }}>
        {[["tabs","📋 タブ管理"],["stamps","🏷️ スタンプ管理"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ flex:1, padding:"12px", background:"none", border:"none", borderBottom:`3px solid ${tab===id?C.g1:"transparent"}`, color:tab===id?C.g1:C.gray, fontSize:13, fontWeight:tab===id?700:400, cursor:"pointer", fontFamily:"'Noto Sans JP',sans-serif" }}>{label}</button>
        ))}
      </div>

      <div style={{ maxWidth:600, margin:"0 auto", padding:"20px 16px" }}>
        {tab==="tabs"   && <TabManager />}
        {tab==="stamps" && <StampManager />}
      </div>

      <style>{`*{box-sizing:border-box} @keyframes spin{to{transform:rotate(360deg)}} input::placeholder{color:#C0B8B0} @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

function TabManager() {
  const [showAdd, setShowAdd] = useState(false);
  const [tabs,    setTabs]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ loadTabs(); },[]);

  const loadTabs = async () => {
    setLoading(true);
    try {
      const content = await getFileContent("src/App.jsx");
      if (!content) { setTabs([]); setLoading(false); return; }
      const match = content.match(/const TABS = \[([\s\S]*?)\];/);
      if (!match) { setTabs([]); setLoading(false); return; }
      const lines = match[1].split("\n").filter(l=>l.includes('id:'));
      const parsed = lines.map(l=>{
        const id    = (l.match(/id:"([^"]+)"/)    ||[])[1];
        const label = (l.match(/label:"([^"]+)"/) ||[])[1];
        const bg    = (l.match(/bg:"([^"]+)"/)    ||[])[1];
        const sample= (l.match(/sample:"([^"]+)"/)  ||[])[1];
        const sizeId= (l.match(/size:\{[^}]+id:"([^"]+)"/)  ||[])[1];
        return id&&label ? { id, label, bg:bg||"", sample:sample||"", sizeId:sizeId||"reel" } : null;
      }).filter(Boolean);
      setTabs(parsed);
    } catch(e) { console.error(e); setTabs([]); }
    setLoading(false);
  };

  if (loading) return <div style={{ textAlign:"center", padding:40 }}><Spinner size={32} /></div>;

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <p style={{ margin:0, fontSize:16, fontWeight:700 }}>タブ管理</p>
        <button onClick={()=>setShowAdd(v=>!v)} style={{ padding:"8px 16px", background:`linear-gradient(135deg,${C.g1},${C.g2})`, border:"none", borderRadius:10, color:C.white, fontSize:13, fontWeight:700, cursor:"pointer" }}>
          {showAdd?"キャンセル":"＋ タブを追加"}
        </button>
      </div>

      {showAdd && <AddTabForm onAdded={()=>{ setShowAdd(false); loadTabs(); }} />}

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {tabs?.map(t=>(
          <ExistingTabCard key={t.id} tab={t} onUpdated={loadTabs} />
        ))}
        {tabs?.length===0&&!showAdd&&<p style={{ textAlign:"center", color:C.gray, padding:20 }}>タブがありません</p>}
      </div>
    </div>
  );
}

function AddTabForm({ onAdded }) {
  const [label,      setLabel]      = useState("");
  const [sizeId,     setSizeId]     = useState("reel");
  const [sampleFile, setSampleFile] = useState(null);
  const [samplePrev, setSamplePrev] = useState(null);
  const [bgFile,     setBgFile]     = useState(null);
  const [bgPrev,     setBgPrev]     = useState(null);
  const [status,     setStatus]     = useState("");
  const [message,    setMessage]    = useState("");

  const submit = async () => {
    if (!label.trim())  { setMessage("タブ名を入力してください"); return; }
    if (!sampleFile)    { setMessage("お手本画像を選択してください"); return; }
    if (!bgFile)        { setMessage("背景画像を選択してください"); return; }
    setStatus("uploading"); setMessage("");
    try {
      const tabId  = "tab_" + Date.now();
      const bgName = `bg_${tabId}.png`;
      const smName = `sample_${tabId}.png`;
      const size   = SNS_SIZES.find(s=>s.id===sizeId)||SNS_SIZES[0];
      const [bgB64,smB64] = await Promise.all([toBase64(bgFile),toBase64(sampleFile)]);
      await uploadFile(`public/${bgName}`, bgB64, `Add bg: ${label}`);
      await uploadFile(`public/${smName}`, smB64, `Add sample: ${label}`);
      const appContent = await getFileContent("src/App.jsx");
      const newTab = `  { id:"${tabId}", label:"${label.trim()}", bg:"/${bgName}", sample:"/${smName}", size:{ id:"${sizeId}", w:${size.w}, h:${size.h} } },`;
      const updated = appContent.replace(/const TABS = \[/, `const TABS = [\n${newTab}`);
      const updatedB64 = btoa(unescape(encodeURIComponent(updated)));
      await uploadFile("src/App.jsx", updatedB64, `Add tab: ${label}`);
      setStatus("done"); setMessage("✅ タブを追加しました！1〜2分後に反映されます。");
      setTimeout(onAdded, 2000);
    } catch(e) { setStatus("error"); setMessage("エラー: "+e.message); }
  };

  return (
    <div style={{ background:C.white, borderRadius:14, padding:"20px", border:`1.5px solid ${C.g1}`, marginBottom:16, animation:"fadeUp 0.2s ease" }}>
      <p style={{ margin:"0 0 16px", fontSize:14, fontWeight:700, color:C.g1 }}>新規タブを追加</p>

      <label style={labelS}>タブ名</label>
      <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="例：当選報告" style={inputS} />

      <label style={labelS}>SNSサイズ</label>
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        {SNS_SIZES.map(s=>(
          <button key={s.id} onClick={()=>setSizeId(s.id)} style={{ padding:"8px 12px", background:sizeId===s.id?C.ink:C.cream, border:`1px solid ${sizeId===s.id?C.ink:C.grayL}`, borderRadius:8, color:sizeId===s.id?C.white:C.ink, fontSize:12, fontWeight:sizeId===s.id?700:400, cursor:"pointer" }}>
            {s.label}<br/><span style={{ fontSize:10, opacity:0.7 }}>{s.w}×{s.h}</span>
          </button>
        ))}
      </div>

      <label style={labelS}>① お手本バナー画像</label>
      <DropZone preview={samplePrev} onFile={f=>{ setSampleFile(f); setSamplePrev(URL.createObjectURL(f)); }} label="お手本画像をドロップ / タップして選択" />

      <label style={{ ...labelS, marginTop:12 }}>② 背景画像</label>
      <DropZone preview={bgPrev} onFile={f=>{ setBgFile(f); setBgPrev(URL.createObjectURL(f)); }} label="背景画像をドロップ / タップして選択" />

      {message&&<p style={{ margin:"10px 0 0", fontSize:12, color:status==="done"?C.green:status==="error"?C.red:C.g1 }}>{message}</p>}

      <button onClick={submit} disabled={status==="uploading"} style={{ width:"100%", marginTop:16, padding:"13px", background:status==="uploading"?C.grayL:`linear-gradient(135deg,${C.g1},${C.g2})`, border:"none", borderRadius:12, color:C.white, fontSize:14, fontWeight:700, cursor:status==="uploading"?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
        {status==="uploading"?<><Spinner size={16} color={C.white}/>アップロード中...</>:"✦ タブを追加する"}
      </button>
    </div>
  );
}

function ExistingTabCard({ tab, onUpdated }) {
  const [open,       setOpen]       = useState(false);
  const [sampleFile, setSampleFile] = useState(null);
  const [samplePrev, setSamplePrev] = useState(null);
  const [bgFile,     setBgFile]     = useState(null);
  const [bgPrev,     setBgPrev]     = useState(null);
  const [status,     setStatus]     = useState("");
  const [message,    setMessage]    = useState("");
  const size = SNS_SIZES.find(s=>s.id===tab.sizeId)||SNS_SIZES[0];

  const handleUpdate = async () => {
    if (!sampleFile&&!bgFile) { setMessage("画像を選択してください"); return; }
    setStatus("uploading"); setMessage("");
    try {
      if (sampleFile) { const b64=await toBase64(sampleFile); await uploadFile(`public/${tab.sample.replace(/^\//,"")}`,b64,`Update sample: ${tab.label}`); }
      if (bgFile)     { const b64=await toBase64(bgFile);     await uploadFile(`public/${tab.bg.replace(/^\//,"")}`    ,b64,`Update bg: ${tab.label}`); }
      setStatus("done"); setMessage("✅ 更新しました！1〜2分後に反映されます。");
    } catch(e) { setStatus("error"); setMessage("エラー: "+e.message); }
  };

  return (
    <div style={{ background:C.white, borderRadius:12, border:`1px solid ${C.grayLL}`, overflow:"hidden" }}>
      <div onClick={()=>setOpen(v=>!v)} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", cursor:"pointer" }}>
        <div style={{ flex:1 }}>
          <p style={{ margin:0, fontSize:14, fontWeight:700 }}>{tab.label}</p>
          <p style={{ margin:"2px 0 0", fontSize:11, color:C.gray }}>{size.label}　{size.w}×{size.h}px</p>
        </div>
        <span style={{ color:C.gray }}>{open?"▲":"▼"}</span>
      </div>
      {open&&(
        <div style={{ padding:"14px 16px", borderTop:`1px solid ${C.grayLL}`, background:C.cream, animation:"fadeUp 0.2s ease" }}>
          <label style={labelS}>① お手本画像を差し替え</label>
          <DropZone preview={samplePrev} onFile={f=>{ setSampleFile(f); setSamplePrev(URL.createObjectURL(f)); }} label="お手本画像をドロップ" small />
          <label style={{ ...labelS, marginTop:12 }}>② 背景画像を差し替え</label>
          <DropZone preview={bgPrev} onFile={f=>{ setBgFile(f); setBgPrev(URL.createObjectURL(f)); }} label="背景画像をドロップ" small />
          {message&&<p style={{ margin:"8px 0 0", fontSize:12, color:status==="done"?C.green:status==="error"?C.red:C.g1 }}>{message}</p>}
          <button onClick={handleUpdate} disabled={status==="uploading"} style={{ width:"100%", marginTop:12, padding:"11px", background:status==="uploading"?C.grayL:`linear-gradient(135deg,${C.g1},${C.g2})`, border:"none", borderRadius:10, color:C.white, fontSize:13, fontWeight:700, cursor:status==="uploading"?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            {status==="uploading"?<><Spinner size={14} color={C.white}/>更新中...</>:"更新する"}
          </button>
        </div>
      )}
    </div>
  );
}

function StampManager() {
  const [stamps,  setStamps]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading,setUploading]=useState(false);

  useEffect(()=>{ loadStamps(); },[]);

  const loadStamps = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/public/stamps`,
        { headers:{ Authorization:`token ${GITHUB_TOKEN}`, Accept:"application/vnd.github.v3+json" } }
      );
      if (res.ok) {
        const files = await res.json();
        setStamps(Array.isArray(files)?files.filter(f=>f.type==="file").map(f=>({ name:f.name, url:`/stamps/${f.name}?t=${Date.now()}` })):[]);
      } else { setStamps([]); }
    } catch { setStamps([]); }
    setLoading(false);
  };

  const uploadStamp = async (file) => {
    setUploading(true);
    try {
      const b64 = await toBase64(file);
      await uploadFile(`public/stamps/${file.name}`, b64, `Add stamp: ${file.name}`);
      setTimeout(loadStamps, 1000);
    } catch(e) { alert("エラー: "+e.message); }
    setUploading(false);
  };

  const deleteStamp = async (name) => {
    if (!confirm(`「${name}」を削除しますか？`)) return;
    await deleteFile(`public/stamps/${name}`, `Delete stamp: ${name}`);
    setStamps(s=>s.filter(st=>st.name!==name));
  };

  if (loading) return <div style={{ textAlign:"center", padding:40 }}><Spinner size={32} /></div>;

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <p style={{ margin:0, fontSize:16, fontWeight:700 }}>スタンプ管理</p>
        <label style={{ padding:"8px 16px", background:uploading?C.grayL:`linear-gradient(135deg,${C.g1},${C.g2})`, border:"none", borderRadius:10, color:C.white, fontSize:13, fontWeight:700, cursor:uploading?"not-allowed":"pointer" }}>
          {uploading?"アップロード中...":"＋ スタンプを追加"}
          <input type="file" accept="image/*" multiple style={{ display:"none" }} disabled={uploading} onChange={e=>{ Array.from(e.target.files).forEach(uploadStamp); e.target.value=""; }} />
        </label>
      </div>

      <div style={{ background:"#FFF8E1", border:"1px solid #F59E0B", borderRadius:10, padding:"10px 14px", marginBottom:16 }}>
        <p style={{ margin:0, fontSize:12, color:"#92400E", lineHeight:1.7 }}>
          📌 PNG推奨（透過背景にするとキレイに使えます）<br/>
          アップロード後1〜2分でユーザーページに反映されます。
        </p>
      </div>

      {stamps.length===0 ? (
        <p style={{ textAlign:"center", color:C.gray, padding:20 }}>スタンプがありません</p>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          {stamps.map(st=>(
            <div key={st.name} style={{ background:C.white, borderRadius:10, border:`1px solid ${C.grayLL}`, overflow:"hidden", textAlign:"center" }}>
              <div style={{ background:"repeating-conic-gradient(#ddd 0% 25%,#fff 0% 50%) 0 0/14px 14px", padding:8 }}>
                <img src={st.url} style={{ width:"100%", maxHeight:80, objectFit:"contain", display:"block", margin:"0 auto" }} />
              </div>
              <div style={{ padding:"6px 8px" }}>
                <p style={{ margin:0, fontSize:10, color:C.gray, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{st.name}</p>
                <button onClick={()=>deleteStamp(st.name)} style={{ marginTop:4, padding:"3px 10px", background:"none", border:`1px solid ${C.red}`, borderRadius:6, color:C.red, fontSize:10, cursor:"pointer" }}>削除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DropZone({ preview, onFile, label, small }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();
  const handleDrop = (e)=>{ e.preventDefault(); setDragOver(false); const f=e.dataTransfer.files[0]; if(f&&f.type.startsWith("image/"))onFile(f); };
  return (
    <div
      onDragOver={e=>{ e.preventDefault(); setDragOver(true); }}
      onDragLeave={()=>setDragOver(false)}
      onDrop={handleDrop}
      onClick={()=>inputRef.current.click()}
      style={{ border:`2px dashed ${dragOver?C.g1:C.grayL}`, borderRadius:10, padding:small?10:18, background:dragOver?`${C.g1}08`:C.cream, cursor:"pointer", textAlign:"center", transition:"all 0.2s", marginBottom:4 }}
    >
      {preview
        ? <img src={preview} style={{ maxWidth:"100%", maxHeight:small?80:120, objectFit:"contain", borderRadius:6 }} />
        : <p style={{ margin:0, fontSize:12, color:C.gray }}>{label}</p>
      }
      <input ref={inputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>{ if(e.target.files[0])onFile(e.target.files[0]); e.target.value=""; }} />
    </div>
  );
}

const labelS = { display:"block", fontSize:11, fontWeight:700, color:C.gray, marginBottom:5 };
const inputS  = { width:"100%", padding:"10px 12px", marginBottom:14, background:C.cream, border:`1px solid ${C.grayL}`, borderRadius:8, fontSize:14, fontFamily:"'Noto Sans JP',sans-serif", color:C.ink, outline:"none" };

function Spinner({ size=20, color=C.g1 }) {
  return <div style={{ width:size, height:size, flexShrink:0, border:`2px solid ${color}30`, borderTop:`2px solid ${color}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />;
}
