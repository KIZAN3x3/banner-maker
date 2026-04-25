import { useState, useRef, useEffect, useCallback } from "react";

const fl = document.createElement("link");
fl.rel = "stylesheet";
fl.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Noto+Serif+JP:wght@400;700;900&family=M+PLUS+1p:wght@400;700;800&family=M+PLUS+Rounded+1c:wght@400;700;800&family=Shippori+Mincho:wght@400;700;800&family=Zen+Old+Mincho:wght@400;700;900&display=swap";
document.head.appendChild(fl);
fl.onload = () => {
  ["Noto Sans JP","Noto Serif JP","M PLUS 1p","M PLUS Rounded 1c","Shippori Mincho","Zen Old Mincho"].forEach(f => {
    document.fonts.load(`700 16px '${f}'`).catch(()=>{});
  });
};

const C = {
  g1:"#EB6100", g2:"#F18D00",
  ink:"#18120A", inkS:"#3D2E1E",
  white:"#FFFFFF", cream:"#FAF6F0",
  gray:"#9C8E80", grayL:"#D6CEC4", grayLL:"#EDE7DF",
  dark:"#0F0A05",
};

const FONTS = [
  { id:"noto_sans",   name:"ゴシック（標準）",  family:"'Noto Sans JP'",      weight:"700" },
  { id:"noto_serif",  name:"明朝（標準）",      family:"'Noto Serif JP'",     weight:"700" },
  { id:"mplus",       name:"ゴシック（丸め）",  family:"'M PLUS 1p'",         weight:"700" },
  { id:"mplus_round", name:"丸ゴシック",        family:"'M PLUS Rounded 1c'", weight:"700" },
  { id:"shippori",    name:"明朝（上品）",      family:"'Shippori Mincho'",   weight:"700" },
  { id:"zen_mincho",  name:"明朝（格調）",      family:"'Zen Old Mincho'",    weight:"700" },
];

const TEXT_SIZES = { large:120, medium:72, small:40 };

const TABS = [
  { id:"sns",       label:"SNS枠",         bg:"/ins-bg.png",       sample:"/ins-sample.png"       },
  { id:"vote",      label:"投票依頼",      bg:"/bg_vote.png",      sample:"/sample_vote.png"      },
  { id:"schedule",  label:"スケジュール",  bg:"/bg_schedule.png",  sample:"/sample_schedule.png"  },
  { id:"speech",    label:"演説告知",      bg:"/bg_speech.png",    sample:"/sample_speech.png"    },
  { id:"countdown", label:"カウントダウン",bg:"/bg_countdown.png", sample:"/sample_countdown.png" },
  { id:"win",       label:"当選",          bg:"/bg_win.png",       sample:"/sample_win.png"       },
];

const CW = 1080;
const CH = 1920;
const PASSWORD = "123";
const SS_KEY = "banner_maker_v4";

const uid = () => Math.random().toString(36).slice(2,9);

const defaultText = (zIndex=0) => ({
  id:uid(), type:"text",
  text:"テキストを入力",
  font:FONTS[0].id, size:"medium", color:"#FFFFFF",
  vertical:false,
  shadow:false,
  outline:false, outlineColor:"#000000", outlineWidth:4,
  glow:false, glowColor:"#FF6600",
  x:CW/2, y:CH/2, scale:1, zIndex,
});

const defaultImage = (src, w, h, zIndex=0) => ({
  id:uid(), type:"image",
  src, naturalW:w, naturalH:h,
  x:CW/2, y:CH/2, scale:1, zIndex,
});

// ── 画像キャッシュ ────────────────────────────────────────
const imgCache = {};
const loadImg = (src) => new Promise((resolve, reject) => {
  if (imgCache[src]) { resolve(imgCache[src]); return; }
  const img = new Image();
  img.onload = () => { imgCache[src] = img; resolve(img); };
  img.onerror = reject;
  img.src = src;
});

export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("bm_auth")==="1");
  if (!authed) return <PasswordScreen onAuth={()=>{ sessionStorage.setItem("bm_auth","1"); setAuthed(true); }} />;
  return <MainApp />;
}

function PasswordScreen({ onAuth }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const submit = () => {
    if (pw===PASSWORD) { onAuth(); }
    else { setErr(true); setTimeout(()=>setErr(false),1200); }
  };
  return (
    <div style={{ minHeight:"100vh", background:C.dark, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Noto Sans JP',sans-serif" }}>
      <div style={{ background:C.ink, borderRadius:20, padding:"40px 32px", width:300, boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ width:56, height:56, borderRadius:14, background:`linear-gradient(135deg,${C.g1},${C.g2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:900, color:C.white, margin:"0 auto 14px" }}>BM</div>
          <p style={{ margin:0, fontSize:20, fontWeight:700, color:C.white }}>バナーメーカー</p>
          <p style={{ margin:"6px 0 0", fontSize:12, color:C.gray }}>パスワードを入力してください</p>
        </div>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="パスワード"
          style={{ width:"100%", padding:"13px 16px", background:err?"#3D0A0A":"#2A1E12", border:`1.5px solid ${err?"#CC3333":C.grayL}`, borderRadius:10, color:C.white, fontSize:16, fontFamily:"'Noto Sans JP',sans-serif", outline:"none", boxSizing:"border-box" }}
        />
        {err && <p style={{ color:"#CC3333", fontSize:12, margin:"6px 0 0", textAlign:"center" }}>パスワードが違います</p>}
        <button onClick={submit} style={{ width:"100%", marginTop:14, padding:"14px", background:`linear-gradient(135deg,${C.g1},${C.g2})`, border:"none", borderRadius:12, color:C.white, fontSize:15, fontWeight:700, fontFamily:"'Noto Sans JP',sans-serif", cursor:"pointer" }}>ログイン</button>
      </div>
      <style>{`input::placeholder{color:#5A4A38} *{box-sizing:border-box}`}</style>
    </div>
  );
}

function MainApp() {
  const [activeTab,  setActiveTab]  = useState("sns"); // SNS枠をデフォルト
  const [screen,     setScreen]     = useState("home");
  const [elements,   setElements]   = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [editing,    setEditing]    = useState(null);
  const [history,    setHistory]    = useState([]);
  const [saves,      setSaves]      = useState(()=>{ try{return JSON.parse(localStorage.getItem(SS_KEY)||"{}");}catch{return {};} });
  const [bgImg,      setBgImg]      = useState(null);
  const [sampleImg,  setSampleImg]  = useState(null);
  const [downloadUrl,setDownloadUrl]= useState(null);
  const [generating, setGenerating] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [showSample, setShowSample] = useState(true);

  const previewRef = useRef(null);
  const PW = Math.min(typeof window!=="undefined"?window.innerWidth-48:380, 420);
  const PH = Math.round(PW*CH/CW);
  const R  = PW/CW;
  const tab = TABS.find(t=>t.id===activeTab);

  useEffect(()=>{
    document.fonts.ready.then(()=>
      Promise.all(FONTS.map(f=>document.fonts.load(`${f.weight} 48px ${f.family}`)))
        .then(()=>setFontsReady(true)).catch(()=>setFontsReady(true))
    );
  },[]);

  // 背景画像読み込み（キャッシュ回避）
  useEffect(()=>{
    setBgImg(null); setSampleImg(null);
    const ts = Date.now();
    const bg = new Image();
    bg.onload = () => setBgImg(bg);
    bg.onerror = () => console.warn("背景画像読み込み失敗:", tab.bg);
    bg.src = tab.bg + "?t=" + ts;
    const sm = new Image();
    sm.onload = () => setSampleImg(sm);
    sm.src = tab.sample + "?t=" + ts;
  },[activeTab]);

  // Canvas描画
  useEffect(()=>{
    if(screen!=="preview"||!previewRef.current)return;
    previewRef.current.width=PW; previewRef.current.height=PH;
    drawCanvas(previewRef.current,elements,bgImg,PW,PH,selected);
  },[screen,elements,bgImg,fontsReady,PW,PH,selected]);

  const pushHistory = useCallback((els)=>{
    setHistory(h=>[...h.slice(-19),JSON.parse(JSON.stringify(els))]);
  },[]);

  const undo = ()=>{
    if(history.length===0)return;
    setElements(history[history.length-1]);
    setHistory(h=>h.slice(0,-1));
  };

  const addText = ()=>{
    pushHistory(elements);
    const el = defaultText(elements.length);
    setElements(e=>[...e,el]);
    setSelected(el.id);
    setEditing(el.id);
  };

  const addImage = (file)=>{
    const reader=new FileReader();
    reader.onload=ev=>{
      const img=new Image();
      img.onload=()=>{
        pushHistory(elements);
        const el=defaultImage(ev.target.result,img.width,img.height,elements.length);
        setElements(e=>[...e,el]);
        setSelected(el.id);
      };
      img.src=ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const updateEl = (id,patch)=>setElements(e=>e.map(el=>el.id===id?{...el,...patch}:el));
  const deleteEl = (id)=>{ pushHistory(elements); setElements(e=>e.filter(el=>el.id!==id)); setSelected(null); setEditing(null); };

  const moveLayer = (id,dir)=>{
    pushHistory(elements);
    setElements(e=>{
      const arr=[...e].sort((a,b)=>a.zIndex-b.zIndex);
      const idx=arr.findIndex(el=>el.id===id);
      if(dir==="up"&&idx<arr.length-1)[arr[idx].zIndex,arr[idx+1].zIndex]=[arr[idx+1].zIndex,arr[idx].zIndex];
      else if(dir==="down"&&idx>0)[arr[idx].zIndex,arr[idx-1].zIndex]=[arr[idx-1].zIndex,arr[idx].zIndex];
      return arr;
    });
  };

  const saveWork = ()=>{
    const key=`${activeTab}_${Date.now()}`;
    const work={ id:key, tab:activeTab, name:`${tab.label} ${new Date().toLocaleDateString("ja-JP")}`, elements:JSON.parse(JSON.stringify(elements)), createdAt:Date.now() };
    const updated={...saves,[key]:work};
    setSaves(updated); localStorage.setItem(SS_KEY,JSON.stringify(updated));
    alert("保存しました！");
  };

  const loadWork = (work)=>{ setElements(work.elements); setSelected(null); setEditing(null); setHistory([]); setScreen("preview"); };
  const deleteWork = (id)=>{ const u={...saves}; delete u[id]; setSaves(u); localStorage.setItem(SS_KEY,JSON.stringify(u)); };

  const generate = async()=>{
    setGenerating(true);
    await new Promise(r=>setTimeout(r,80));
    const canvas=document.createElement("canvas");
    canvas.width=CW; canvas.height=CH;
    drawCanvas(canvas,elements,bgImg,CW,CH,null);
    setDownloadUrl(canvas.toDataURL("image/png"));
    setGenerating(false); setScreen("done");
  };

  const reset = ()=>{ setElements([]); setSelected(null); setEditing(null); setHistory([]); setDownloadUrl(null); setScreen("home"); };
  const tabSaves = Object.values(saves).filter(s=>s.tab===activeTab).sort((a,b)=>b.createdAt-a.createdAt);

  return (
    <div style={{ minHeight:"100vh", background:C.cream, fontFamily:"'Noto Sans JP',sans-serif", color:C.ink, paddingBottom:60 }}>
      <AppHeader
        screen={screen}
        onBack={screen==="preview"?()=>setScreen("home"):screen==="done"?()=>setScreen("preview"):null}
        onSave={screen==="preview"?saveWork:null}
        onUndo={screen==="preview"&&history.length>0?undo:null}
      />

      {screen==="home"&&(
        <div style={{ background:C.white, borderBottom:`1px solid ${C.grayLL}`, display:"flex", overflowX:"auto", position:"sticky", top:56, zIndex:100, WebkitOverflowScrolling:"touch" }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{ flexShrink:0, padding:"11px 14px", background:"none", border:"none", borderBottom:`3px solid ${activeTab===t.id?C.g1:"transparent"}`, color:activeTab===t.id?C.g1:C.gray, fontSize:12, fontWeight:activeTab===t.id?700:400, fontFamily:"'Noto Sans JP',sans-serif", cursor:"pointer" }}>{t.label}</button>
          ))}
        </div>
      )}

      {screen==="home"&&<HomeScreen tab={tab} tabSaves={tabSaves} onNew={()=>{setElements([]);setSelected(null);setEditing(null);setHistory([]);setScreen("preview");}} onLoad={loadWork} onDelete={deleteWork} />}
      {screen==="preview"&&(
        <PreviewScreen
          elements={elements} setElements={setElements}
          selected={selected} setSelected={setSelected}
          editing={editing} setEditing={setEditing}
          bgImg={bgImg} sampleImg={sampleImg}
          showSample={showSample} setShowSample={setShowSample}
          canvasRef={previewRef} PW={PW} PH={PH} R={R}
          addText={addText} addImage={addImage}
          updateEl={updateEl} deleteEl={deleteEl}
          moveLayer={moveLayer} pushHistory={pushHistory}
          onGenerate={generate} generating={generating}
        />
      )}
      {screen==="done"&&<DoneScreen downloadUrl={downloadUrl} onReset={reset} onBack={()=>setScreen("preview")} />}

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        *{box-sizing:border-box}
        input::placeholder{color:#C0B8B0}
        textarea::placeholder{color:#C0B8B0}
        ::-webkit-scrollbar{width:8px}
        ::-webkit-scrollbar-track{background:#E8E0D8;border-radius:4px}
        ::-webkit-scrollbar-thumb{background:#EB6100;border-radius:4px}
        ::-webkit-scrollbar-thumb:hover{background:#C4520E}
      `}</style>
    </div>
  );
}

function AppHeader({ screen, onBack, onSave, onUndo }) {
  return (
    <header style={{ background:C.ink, height:56, display:"flex", alignItems:"center", padding:"0 16px", gap:10, position:"sticky", top:0, zIndex:300, boxShadow:"0 2px 20px #00000055" }}>
      {onBack
        ? <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", color:C.white, fontSize:26, lineHeight:1, padding:"0 8px 0 0", marginLeft:-4 }}>‹</button>
        : <div style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg,${C.g1},${C.g2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:C.white }}>BM</div>
      }
      <p style={{ margin:0, fontSize:14, fontWeight:700, color:C.white, flex:1 }}>バナーメーカー</p>
      <div style={{ display:"flex", gap:8 }}>
        {onUndo&&<button onClick={onUndo} style={{ background:`${C.white}15`, border:"none", borderRadius:8, padding:"6px 12px", color:C.white, fontSize:12, cursor:"pointer" }}>↩ 戻す</button>}
        {onSave&&<button onClick={onSave} style={{ background:`linear-gradient(135deg,${C.g1},${C.g2})`, border:"none", borderRadius:8, padding:"6px 14px", color:C.white, fontSize:12, fontWeight:700, cursor:"pointer" }}>保存</button>}
      </div>
    </header>
  );
}

function HomeScreen({ tab, tabSaves, onNew, onLoad, onDelete }) {
  return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"20px 16px 40px" }}>
      <button onClick={onNew} style={{ width:"100%", padding:"18px", background:`linear-gradient(135deg,${C.g1} 7%,${C.g2} 97%)`, border:"none", borderRadius:14, color:C.white, fontSize:16, fontWeight:700, fontFamily:"'Noto Sans JP',sans-serif", cursor:"pointer", boxShadow:`0 4px 20px ${C.g1}45`, marginBottom:24 }}>＋ 新規作成</button>
      {tabSaves.length>0&&(
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:C.inkS, marginBottom:12 }}>保存済み</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {tabSaves.map(work=>(
              <div key={work.id} style={{ background:C.white, borderRadius:12, padding:"14px 16px", border:`1px solid ${C.grayLL}`, display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ flex:1 }}>
                  <p style={{ margin:0, fontSize:14, fontWeight:700 }}>{work.name}</p>
                  <p style={{ margin:"3px 0 0", fontSize:11, color:C.gray }}>{work.elements.length}個の要素</p>
                </div>
                <button onClick={()=>onLoad(work)} style={{ padding:"8px 16px", background:`linear-gradient(135deg,${C.g1},${C.g2})`, border:"none", borderRadius:8, color:C.white, fontSize:12, fontWeight:700, cursor:"pointer" }}>編集</button>
                <button onClick={()=>{if(confirm("削除しますか？"))onDelete(work.id);}} style={{ padding:"8px 12px", background:"none", border:`1px solid ${C.grayL}`, borderRadius:8, color:C.gray, fontSize:12, cursor:"pointer" }}>削除</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewScreen({ elements, setElements, selected, setSelected, editing, setEditing, bgImg, sampleImg, showSample, setShowSample, canvasRef, PW, PH, R, addText, addImage, updateEl, deleteEl, moveLayer, pushHistory, onGenerate, generating }) {
  const dragging = useRef(null);
  const pinchRef = useRef({ lastDist:null });
  const imgInputRef = useRef();

  const getXY = (cx,cy)=>{
    if(!canvasRef.current)return{x:0,y:0};
    const rect=canvasRef.current.getBoundingClientRect();
    return{x:(cx-rect.left)/R,y:(cy-rect.top)/R};
  };

  // 選択中要素のみドラッグ
  const onMouseDown = (e)=>{
    if(!selected)return;
    const el=elements.find(el=>el.id===selected);
    if(!el)return;
    const{x,y}=getXY(e.clientX,e.clientY);
    pushHistory(elements);
    dragging.current={id:el.id,startX:x,startY:y,origX:el.x,origY:el.y};
  };

  const onMouseMove = (e)=>{
    if(!dragging.current)return;
    const{x,y}=getXY(e.clientX,e.clientY);
    updateEl(dragging.current.id,{
      x:dragging.current.origX+(x-dragging.current.startX),
      y:dragging.current.origY+(y-dragging.current.startY)
    });
  };

  const onMouseUp = ()=>{ dragging.current=null; };

  const onTouchStart = (e)=>{
    if(e.touches.length===2){
      const dx=e.touches[0].clientX-e.touches[1].clientX;
      const dy=e.touches[0].clientY-e.touches[1].clientY;
      pinchRef.current.lastDist=Math.sqrt(dx*dx+dy*dy);
    } else {
      onMouseDown({clientX:e.touches[0].clientX,clientY:e.touches[0].clientY});
    }
  };

  const onTouchMove = (e)=>{
    e.preventDefault();
    if(e.touches.length===2&&selected){
      const dx=e.touches[0].clientX-e.touches[1].clientX;
      const dy=e.touches[0].clientY-e.touches[1].clientY;
      const dist=Math.sqrt(dx*dx+dy*dy);
      if(pinchRef.current.lastDist){
        const ratio=dist/pinchRef.current.lastDist;
        setElements(els=>els.map(el=>el.id===selected?{...el,scale:Math.min(Math.max(el.scale*ratio,0.1),8)}:el));
      }
      pinchRef.current.lastDist=dist;
    } else {
      onMouseMove({clientX:e.touches[0].clientX,clientY:e.touches[0].clientY});
    }
  };

  const onTouchEnd = ()=>{ pinchRef.current.lastDist=null; onMouseUp(); };

  const sortedEls = [...elements].sort((a,b)=>b.zIndex-a.zIndex);

  return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"12px 16px 40px" }}>

      {/* ツールバー */}
      <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
        <button onClick={addText} style={toolBtn(C.g1)}>＋ テキスト</button>
        <label style={toolBtn("#4A90D9")}>
          ＋ 画像
          <input ref={imgInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>{if(e.target.files[0])addImage(e.target.files[0]);e.target.value="";}} />
        </label>
        <button onClick={()=>setShowSample(v=>!v)} style={toolBtn(showSample?"#555":"#888")}>
          {showSample?"お手本を隠す":"お手本を表示"}
        </button>
      </div>

      {/* お手本 */}
      {showSample&&sampleImg&&(
        <div style={{ marginBottom:12, borderRadius:10, overflow:"hidden", border:`1px solid ${C.grayL}` }}>
          <p style={{ margin:0, padding:"6px 12px", fontSize:11, color:C.gray, background:C.white }}>📌 お手本バナー（参考）</p>
          <img src={sampleImg.src} style={{ width:"50%", display:"block" }} />
        </div>
      )}

      {/* Canvas */}
      <div style={{ borderRadius:10, overflow:"hidden", border:`2px solid ${selected?C.g1:C.grayL}`, boxShadow:`0 8px 32px ${C.g1}20`, transition:"border-color 0.2s" }}>
        <canvas ref={canvasRef} width={PW} height={PH}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          style={{ display:"block", cursor:selected?"grab":"default", touchAction:"none", userSelect:"none" }}
        />
      </div>
      <p style={{ textAlign:"center", fontSize:10, color:C.gray, marginTop:5 }}>
        {selected?"ドラッグで移動　ピンチで拡縮":"↓ レイヤーで要素を選んでください"}
      </p>

      {/* レイヤー＋編集パネル統合 */}
      {elements.length>0&&(
        <div style={{ marginTop:14, background:C.white, borderRadius:12, border:`1px solid ${C.grayLL}`, overflow:"hidden" }}>
          <p style={{ margin:0, padding:"10px 14px", fontSize:12, fontWeight:700, color:C.inkS, borderBottom:`1px solid ${C.grayLL}`, background:C.cream }}>
            レイヤー（上が前面）
          </p>
          <div style={{ display:"flex", flexDirection:"column" }}>
            {sortedEls.map((el,idx)=>(
              <div key={el.id} style={{ borderBottom:idx<sortedEls.length-1?`1px solid ${C.grayLL}`:"none" }}>

                {/* レイヤー行 */}
                <div
                  onClick={()=>{ setSelected(el.id); if(editing!==el.id)setEditing(null); }}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", background:selected===el.id?`${C.g1}10`:C.white, cursor:"pointer" }}
                >
                  <span style={{ fontSize:16, flexShrink:0 }}>{el.type==="text"?"✏️":"🖼"}</span>
                  <span style={{ flex:1, fontSize:12, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:selected===el.id?C.g1:C.ink, fontWeight:selected===el.id?700:400 }}>
                    {el.type==="text"?el.text:"画像"}
                  </span>
                  <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                    {selected===el.id&&el.type==="text"&&editing!==el.id&&(
                      <button
                        onClick={e=>{e.stopPropagation();setEditing(el.id);}}
                        style={{ padding:"4px 10px", background:C.g1, border:"none", borderRadius:6, color:C.white, fontSize:11, fontWeight:700, cursor:"pointer" }}
                      >編集</button>
                    )}
                    <button onClick={e=>{e.stopPropagation();moveLayer(el.id,"up");}} style={tinyBtn()}>↑</button>
                    <button onClick={e=>{e.stopPropagation();moveLayer(el.id,"down");}} style={tinyBtn()}>↓</button>
                    <button onClick={e=>{e.stopPropagation();if(confirm("削除？"))deleteEl(el.id);}} style={tinyBtn("#CC3333")}>✕</button>
                  </div>
                </div>

                {/* 編集パネル（編集モード時のみ） */}
                {editing===el.id&&el.type==="text"&&(
                  <div style={{ padding:"14px", background:`${C.g1}08`, borderTop:`1px solid ${C.g1}30`, animation:"fadeUp 0.2s ease" }}>

                    <textarea value={el.text} onChange={e=>updateEl(el.id,{text:e.target.value})}
                      style={{ width:"100%", minHeight:72, padding:"10px", background:C.white, border:`1px solid ${C.grayL}`, borderRadius:8, fontSize:15, fontFamily:"'Noto Sans JP',sans-serif", color:C.ink, resize:"vertical", outline:"none", marginBottom:10 }}
                    />

                    <label style={labelS}>フォント</label>
                    <select value={el.font} onChange={e=>updateEl(el.id,{font:e.target.value})} style={selectS}>
                      {FONTS.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>

                    <label style={labelS}>サイズ</label>
                    <div style={{ display:"flex", gap:6, marginBottom:10 }}>
                      {[["large","大"],["medium","中"],["small","小"]].map(([v,l])=>(
                        <button key={v} onClick={()=>updateEl(el.id,{size:v})} style={{ flex:1, padding:"8px", background:el.size===v?C.ink:C.cream, border:`1px solid ${el.size===v?C.ink:C.grayL}`, borderRadius:8, fontSize:13, fontWeight:700, color:el.size===v?C.white:C.ink, cursor:"pointer" }}>{l}</button>
                      ))}
                    </div>

                    <label style={labelS}>組方向</label>
                    <div style={{ display:"flex", gap:6, marginBottom:10 }}>
                      {[[false,"横組み"],[true,"縦組み"]].map(([v,l])=>(
                        <button key={String(v)} onClick={()=>updateEl(el.id,{vertical:v})} style={{ flex:1, padding:"8px", background:el.vertical===v?C.ink:C.cream, border:`1px solid ${el.vertical===v?C.ink:C.grayL}`, borderRadius:8, fontSize:13, color:el.vertical===v?C.white:C.ink, cursor:"pointer" }}>{l}</button>
                      ))}
                    </div>

                    <label style={labelS}>文字色</label>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                      <input type="color" value={el.color} onChange={e=>updateEl(el.id,{color:e.target.value})} style={{ width:44, height:36, borderRadius:8, border:`1px solid ${C.grayL}`, cursor:"pointer", padding:2 }} />
                      <span style={{ fontSize:12, color:C.gray }}>{el.color}</span>
                    </div>

                    <label style={labelS}>エフェクト</label>
                    <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:14 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <input type="checkbox" id={`sh_${el.id}`} checked={el.shadow} onChange={e=>updateEl(el.id,{shadow:e.target.checked})} />
                        <label htmlFor={`sh_${el.id}`} style={{ fontSize:13, cursor:"pointer" }}>ドロップシャドウ</label>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                        <input type="checkbox" id={`ol_${el.id}`} checked={el.outline} onChange={e=>updateEl(el.id,{outline:e.target.checked})} />
                        <label htmlFor={`ol_${el.id}`} style={{ fontSize:13, cursor:"pointer" }}>縁取り</label>
                        {el.outline&&<>
                          <input type="color" value={el.outlineColor} onChange={e=>updateEl(el.id,{outlineColor:e.target.value})} style={{ width:32, height:28, borderRadius:6, border:"none", cursor:"pointer" }} />
                          <input type="range" min="1" max="20" value={el.outlineWidth} onChange={e=>updateEl(el.id,{outlineWidth:Number(e.target.value)})} style={{ flex:1 }} />
                          <span style={{ fontSize:11, color:C.gray }}>{el.outlineWidth}px</span>
                        </>}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                        <input type="checkbox" id={`gl_${el.id}`} checked={el.glow} onChange={e=>updateEl(el.id,{glow:e.target.checked})} />
                        <label htmlFor={`gl_${el.id}`} style={{ fontSize:13, cursor:"pointer" }}>外光（グロー）</label>
                        {el.glow&&<input type="color" value={el.glowColor} onChange={e=>updateEl(el.id,{glowColor:e.target.value})} style={{ width:32, height:28, borderRadius:6, border:"none", cursor:"pointer" }} />}
                      </div>
                    </div>

                    <button onClick={()=>setEditing(null)} style={{ width:"100%", padding:"12px", background:C.ink, border:"none", borderRadius:10, color:C.white, fontSize:14, fontWeight:700, fontFamily:"'Noto Sans JP',sans-serif", cursor:"pointer" }}>
                      ✅ 編集完了
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={onGenerate} disabled={generating} style={{ width:"100%", marginTop:16, padding:"16px", background:generating?`${C.g1}60`:`linear-gradient(135deg,${C.g1} 7%,${C.g2} 97%)`, border:"none", borderRadius:14, color:C.white, fontSize:15, fontWeight:700, fontFamily:"'Noto Sans JP',sans-serif", cursor:generating?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
        {generating?<><Spinner size={18} color={C.white}/>生成中...</>:"✦ バナーを生成する"}
      </button>
    </div>
  );
}

function DoneScreen({ downloadUrl, onReset, onBack }) {
  return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"36px 16px" }}>
      <div style={{ textAlign:"center", marginBottom:24 }}>
        <div style={{ width:68, height:68, borderRadius:"50%", margin:"0 auto 12px", background:`linear-gradient(135deg,${C.g1} 7%,${C.g2} 97%)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, boxShadow:`0 8px 28px ${C.g1}50` }}>✓</div>
        <h2 style={{ margin:0, fontSize:20, fontWeight:900 }}>バナー完成！</h2>
        <p style={{ margin:"6px 0 0", fontSize:12, color:C.gray }}>1080×1920px PNG</p>
      </div>
      {downloadUrl&&(
        <div style={{ borderRadius:12, overflow:"hidden", border:`2px solid ${C.g1}`, marginBottom:18, display:"flex", justifyContent:"center", maxHeight:480 }}>
          <img src={downloadUrl} style={{ height:480, width:"auto", display:"block" }} />
        </div>
      )}
      <a href={downloadUrl} download="banner.png" style={{ display:"block", width:"100%", padding:"17px", background:`linear-gradient(135deg,${C.g1} 7%,${C.g2} 97%)`, borderRadius:14, textAlign:"center", color:C.white, fontSize:15, fontWeight:700, textDecoration:"none", fontFamily:"'Noto Sans JP',sans-serif", boxShadow:`0 6px 28px ${C.g1}50`, marginBottom:10 }}>↓ ダウンロード（PNG）</a>
      <button onClick={onBack}  style={{ width:"100%", padding:"13px", background:"transparent", border:`1.5px solid ${C.grayL}`, borderRadius:14, color:C.inkS, fontSize:14, fontFamily:"'Noto Sans JP',sans-serif", cursor:"pointer", marginBottom:8 }}>← 編集に戻る</button>
      <button onClick={onReset} style={{ width:"100%", padding:"13px", background:"transparent", border:`1.5px solid ${C.grayL}`, borderRadius:14, color:C.gray, fontSize:13, fontFamily:"'Noto Sans JP',sans-serif", cursor:"pointer" }}>最初からやり直す</button>
    </div>
  );
}

function drawCanvas(canvas, elements, bgImg, W, H, selectedId) {
  if(!canvas)return;
  const r=W/CW;
  const ctx=canvas.getContext("2d");
  ctx.clearRect(0,0,W,H);
  if(bgImg){
    ctx.drawImage(bgImg,0,0,W,H);
  } else {
    const g=ctx.createLinearGradient(0,0,W,0);
    g.addColorStop(0,"rgb(235,97,0)"); g.addColorStop(1,"rgb(241,141,0)");
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  }
  [...elements].sort((a,b)=>a.zIndex-b.zIndex).forEach(el=>{
    if(el.type==="image") drawImageEl(ctx,el,r,selectedId===el.id);
    else drawTextEl(ctx,el,r,selectedId===el.id);
  });
}

function drawTextEl(ctx, el, r, isSelected) {
  const font=FONTS.find(f=>f.id===el.font)||FONTS[0];
  const fontSize=TEXT_SIZES[el.size]*el.scale*r;
  ctx.save();
  ctx.translate(el.x*r, el.y*r);
  ctx.font=`${font.weight} ${fontSize}px ${font.family},sans-serif`;
  ctx.fillStyle=el.color;

  const drawLine = (text, x, y) => {
    if(el.outline){ctx.save();ctx.strokeStyle=el.outlineColor;ctx.lineWidth=el.outlineWidth*r;ctx.lineJoin="round";ctx.strokeText(text,x,y);ctx.restore();}
    if(el.shadow){ctx.save();ctx.shadowColor="rgba(0,0,0,0.7)";ctx.shadowOffsetX=2*r;ctx.shadowOffsetY=2*r;ctx.shadowBlur=2*r;ctx.fillStyle=el.color;ctx.fillText(text,x,y);ctx.restore();}
    if(el.glow){ctx.save();ctx.shadowColor=el.glowColor;ctx.shadowBlur=30*r;ctx.fillStyle=el.color;ctx.fillText(text,x,y);ctx.restore();}
    ctx.fillStyle=el.color; ctx.fillText(text,x,y);
  };

  if(el.vertical){
    ctx.textAlign="center"; ctx.textBaseline="top";
    const chars=el.text.split("");
    const totalH=chars.length*fontSize*1.1;
    chars.forEach((ch,i)=>drawLine(ch,0,-totalH/2+i*fontSize*1.1));
  } else {
    ctx.textAlign="center"; ctx.textBaseline="middle";
    const lines=el.text.split("\n");
    const totalH=lines.length*fontSize*1.3;
    lines.forEach((line,i)=>drawLine(line,0,-totalH/2+(i+0.5)*fontSize*1.3));
  }

  if(isSelected){
    const hw=getElHalfW(el)*el.scale*r, hh=getElHalfH(el)*el.scale*r;
    ctx.strokeStyle="rgba(235,97,0,0.9)"; ctx.lineWidth=2; ctx.setLineDash([6,3]);
    ctx.strokeRect(-hw,-hh,hw*2,hh*2); ctx.setLineDash([]);
  }
  ctx.restore();
}

function drawImageEl(ctx, el, r, isSelected) {
  if(!el.src)return;
  const img=imgCache[el.src]||(() => {
    const i=new Image(); i.src=el.src;
    if(i.complete)imgCache[el.src]=i;
    return i;
  })();
  if(!img.complete)return;
  const w=el.naturalW*el.scale*r, h=el.naturalH*el.scale*r;
  ctx.save(); ctx.translate(el.x*r,el.y*r);
  ctx.drawImage(img,-w/2,-h/2,w,h);
  if(isSelected){ctx.strokeStyle="rgba(235,97,0,0.9)";ctx.lineWidth=2;ctx.setLineDash([6,3]);ctx.strokeRect(-w/2,-h/2,w,h);ctx.setLineDash([]);}
  ctx.restore();
}

function getElHalfW(el){
  if(el.type==="image")return el.naturalW/2;
  const fs=TEXT_SIZES[el.size]||72;
  if(el.vertical)return fs*0.6;
  return Math.max(...el.text.split("\n").map(l=>l.length))*fs*0.55;
}
function getElHalfH(el){
  if(el.type==="image")return el.naturalH/2;
  const fs=TEXT_SIZES[el.size]||72;
  if(el.vertical)return el.text.length*fs*1.1/2;
  return el.text.split("\n").length*fs*1.3/2;
}

const toolBtn=(bg)=>({ padding:"9px 16px", background:bg, border:"none", borderRadius:10, color:C.white, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Noto Sans JP',sans-serif", display:"flex", alignItems:"center", gap:4 });
const tinyBtn=(bg=C.grayL)=>({ padding:"4px 8px", background:bg, border:"none", borderRadius:5, color:bg===C.grayL?C.ink:C.white, fontSize:10, cursor:"pointer" });
const labelS={ display:"block", fontSize:11, fontWeight:700, color:C.gray, marginBottom:5 };
const selectS={ width:"100%", padding:"9px 12px", marginBottom:10, background:C.cream, border:`1px solid ${C.grayL}`, borderRadius:8, fontSize:13, fontFamily:"'Noto Sans JP',sans-serif", color:C.ink, outline:"none" };

function Spinner({ size=20, color=C.g1 }) {
  return <div style={{ width:size, height:size, flexShrink:0, border:`2.5px solid ${color}30`, borderTop:`2.5px solid ${color}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />;
}
