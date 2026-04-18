import { useState, useRef, useEffect, useCallback } from "react";

// ── Google Fonts ───────────────────────────────────────────
const fl = document.createElement("link");
fl.rel = "stylesheet";
fl.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Noto+Serif+JP:wght@400;700;900&display=swap";
document.head.appendChild(fl);

// フォントを事前ロード（明朝体が確実に使えるよう）
fl.onload = () => {
  Promise.all([
    document.fonts.load("700 16px 'Noto Serif JP'"),
    document.fonts.load("900 16px 'Noto Sans JP'"),
    document.fonts.load("400 16px 'Noto Sans JP'"),
    document.fonts.load("400 16px 'Noto Serif JP'"),
  ]).catch(() => {});
};

// ── カラー ────────────────────────────────────────────────
const C = {
  g1:"#EB6100", g2:"#F18D00", red:"#CC0000",
  ink:"#18120A", inkS:"#3D2E1E",
  white:"#FFFFFF", cream:"#FAF6F0",
  gray:"#9C8E80", grayL:"#D6CEC4", grayLL:"#EDE7DF",
};

const CW = 1080;
const CH = 1920;

// ── 座標定義（すべて左上基準） ────────────────────────────
// ※ イラレは中心点基準なので X - W/2, Y - H/2 で左上に変換済み
const L = {
  ORANGE_TOP: { x:0,      y:0,       w:1080,   h:345    },
  CATCH_BAND: { x:0,      y:1387.05, w:1080,   h:109.69 },
  WHITE_BAND: { x:0,      y:1495.44, w:1080,   h:115.36 },
  ORANGE_BOT: { x:0,      y:1610.80, w:1080,   h:309.99 },
  LOGO:       { x:94.60,  y:126.31,  w:193.35, h:189.60 },
  // テキストエリア（イラレ中心値から左上に変換）
  // POS:   中心X:663.37 Y:150.62 W:685.31 H:77.04  → 左上X=320.71 Y=112.10
  POS:        { x:320.71, y:112.10,  w:685.31, h:77.04  },
  // YOMI:  中心X:663.37 Y:221.18 W:520.05 H:47.82  → 左上X=403.34 Y=197.27
  YOMI:       { x:403.34, y:197.27,  w:520.05, h:47.82  },
  // NAME:  中心X:663.37 Y:335.75 W:683.31 H:175.03 → 左上X=321.71 Y=248.22
  NAME:       { x:321.71, y:248.22,  w:683.31, h:175.03 },
  // CATCH: 中心X:406.79 Y:1444.51 W:684.12 H:70.07 → 左上X=64.73 Y=1409.47
  CATCH_TEXT: { x:64.73,  y:1409.47, w:684.12, h:70.07  },
  // VOTE:  中心X:464.43 Y:1549.50 W:263.83 H:87.59 → 左上X=332.51 Y=1505.70
  VOTE:       { x:332.51, y:1505.70, w:263.83, h:87.59  },
  // PERIOD:中心X:822.78 Y:1567.33 W:269.61 H:42.92 → 左上X=687.97 Y=1545.87
  PERIOD:     { x:687.97, y:1545.87, w:269.61, h:42.92  },
  // PHOTO: 中心X:908.12 Y:1275.99 W:281.45 H:437.43→ 左上X=766.89 Y=1057.27
  PHOTO:      { x:766.89, y:1057.27, w:281.45, h:437.43 },
};

// ── テキスト要素定義 ──────────────────────────────────────
const TEXT_ITEMS = [
  {
    key:"position", label:"① 肩書き・選挙区",
    placeholder:"●●●議会議員候補",
    required:true, hint:"上部オレンジ帯内・黒テキスト",
    layout:L.POS, fontWeight:"700", fontFamily:"'Noto Sans JP'",
    color:C.ink, baseSize:52, alignLeft:false,
  },
  {
    key:"yomi", label:"② よみがな",
    placeholder:"いとうまさよし",
    required:true, hint:"候補者名の上・白テキスト",
    layout:L.YOMI, fontWeight:"400", fontFamily:"'Noto Serif JP'",
    color:C.white, baseSize:38, alignLeft:false,
  },
  {
    key:"name", label:"③ 候補者名",
    placeholder:"伊藤正義",
    required:true, hint:"白テキストで大きく",
    layout:L.NAME, fontWeight:"900", fontFamily:"'Noto Sans JP'",
    color:C.white, baseSize:160, alignLeft:false, shadow:true,
  },
  {
    key:"catch", label:"④ キャッチコピー",
    placeholder:"僕らは日本をあきらめない！",
    required:true, hint:"オレンジ帯内・白テキスト・左揃え",
    layout:L.CATCH_TEXT, fontWeight:"700", fontFamily:"'Noto Serif JP'",
    color:C.white, baseSize:56, alignLeft:true,
  },
];

const VOTE_FIELDS = [
  { key:"voteday", label:"⑤ 投開票日",      placeholder:"4月11日",                  required:true, hint:"赤字で表示" },
  { key:"period",  label:"⑥ 期日前投票期間", placeholder:"4 / 5 ㊊ ～ 4 / 10 ㊏", required:true, hint:"エリアいっぱいに表示" },
];

const SS_KEY = "sanseito_banner_v9";

// ──────────────────────────────────────────────────────────
export default function App() {
  const getSaved = () => {
    try { const s = sessionStorage.getItem(SS_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
  };
  const saved = getSaved();

  const [screen,     setScreen]     = useState(saved?.screen     || "edit");
  const [values,     setValues]     = useState(saved?.values     || {});
  const [offsets,    setOffsets]    = useState(saved?.offsets    || {});  // { key: {x,y} }
  const [scales,     setScales]     = useState(saved?.scales     || {});  // { key: number }
  const [photo,      setPhoto]      = useState(saved?.photo      || null);
  const [photoImg,   setPhotoImg]   = useState(null);
  const [photoScale, setPhotoScale] = useState(saved?.photoScale || 1);
  const [photoPos,   setPhotoPos]   = useState(saved?.photoPos   || {x:0,y:0});
  const [generating, setGenerating] = useState(false);
  const [downloadUrl,setDownloadUrl]= useState(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [dragging,   setDragging]   = useState(null);

  const previewRef = useRef(null);
  const PW = Math.min(typeof window !== "undefined" ? window.innerWidth - 32 : 380, 420);
  const PH = Math.round(PW * CH / CW);
  const SCALE = PW / CW;

  useEffect(() => {
    try { sessionStorage.setItem(SS_KEY, JSON.stringify({screen,values,offsets,scales,photo,photoScale,photoPos})); } catch {}
  }, [screen,values,offsets,scales,photo,photoScale,photoPos]);

  useEffect(() => {
    document.fonts.ready.then(() =>
      Promise.all([
        document.fonts.load("700 48px 'Noto Serif JP'"),
        document.fonts.load("900 48px 'Noto Sans JP'"),
        document.fonts.load("400 48px 'Noto Serif JP'"),
      ]).then(() => setFontsReady(true)).catch(() => setFontsReady(true))
    );
  }, []);

  useEffect(() => {
    if (!photo) { setPhotoImg(null); return; }
    const img = new Image();
    img.onload = () => setPhotoImg(img);
    img.src = photo;
  }, [photo]);

  useEffect(() => {
    if (screen !== "preview" || !previewRef.current) return;
    previewRef.current.width  = PW;
    previewRef.current.height = PH;
    drawBanner(previewRef.current, values, offsets, scales, photoImg, photoScale, photoPos, PW, PH);
  }, [screen, values, offsets, scales, photoImg, photoScale, photoPos, fontsReady, PW, PH]);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 80));
    const canvas = document.createElement("canvas");
    canvas.width = CW; canvas.height = CH;
    drawBanner(canvas, values, offsets, scales, photoImg, photoScale, photoPos, CW, CH);
    setDownloadUrl(canvas.toDataURL("image/png"));
    setGenerating(false);
    setScreen("done");
  };

  const reset = () => {
    sessionStorage.removeItem(SS_KEY);
    setScreen("edit"); setValues({}); setOffsets({}); setScales({});
    setPhoto(null); setPhotoScale(1); setPhotoPos({x:0,y:0}); setDownloadUrl(null);
  };

  const requiredKeys = [...TEXT_ITEMS, ...VOTE_FIELDS].filter(f=>f.required).map(f=>f.key);
  const canNext = requiredKeys.every(k => (values[k]||"").trim() !== "");

  // ── ドラッグ＆ピンチ管理 ─────────────────────────────────
  const pinchRef = useRef({ lastDist:null, key:null });

  const getCanvasPos = useCallback((clientX, clientY) => {
    if (!previewRef.current) return {x:0,y:0};
    const rect = previewRef.current.getBoundingClientRect();
    return { x:(clientX - rect.left)/SCALE, y:(clientY - rect.top)/SCALE };
  }, [SCALE]);

  // ヒットテスト（テキスト or 写真）
  const hitTest = useCallback((mx, my) => {
    for (const item of TEXT_ITEMS) {
      if (!(values[item.key]||"").trim()) continue;
      const ox = offsets[item.key]?.x || 0;
      const oy = offsets[item.key]?.y || 0;
      const sc = scales[item.key] || 1;
      const lx = item.layout.x + ox;
      const ly = item.layout.y + oy;
      const lw = item.layout.w * sc;
      const lh = item.layout.h * sc;
      if (mx>=lx && mx<=lx+lw && my>=ly && my<=ly+lh) return { key:item.key, type:"text" };
    }
    const px = L.PHOTO.x, py = L.PHOTO.y;
    if (mx>=px && mx<=px+L.PHOTO.w && my>=py && my<=py+L.PHOTO.h) return { key:"__photo__", type:"photo" };
    return null;
  }, [values, offsets, scales]);

  const handleMouseDown = useCallback((e) => {
    const {x:mx, y:my} = getCanvasPos(e.clientX, e.clientY);
    const hit = hitTest(mx, my);
    if (!hit) return;
    const ox = offsets[hit.key]?.x || 0;
    const oy = offsets[hit.key]?.y || 0;
    const origX = hit.type === "photo" ? photoPos.x : ox;
    const origY = hit.type === "photo" ? photoPos.y : oy;
    setDragging({ key:hit.key, type:hit.type, startX:mx, startY:my, origX, origY });
  }, [getCanvasPos, hitTest, offsets, photoPos]);

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return;
    const {x:mx, y:my} = getCanvasPos(e.clientX, e.clientY);
    const dx = mx - dragging.startX, dy = my - dragging.startY;
    if (dragging.type === "photo") {
      setPhotoPos({ x:dragging.origX + dx*(CW/PW), y:dragging.origY + dy*(CW/PW) });
    } else {
      setOffsets(prev => ({ ...prev, [dragging.key]:{x:dragging.origX+dx, y:dragging.origY+dy} }));
    }
  }, [dragging, getCanvasPos, PW]);

  const handleMouseUp = useCallback(() => setDragging(null), []);

  // タッチ：1本=ドラッグ、2本=ピンチ
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      // ピンチ開始：どの要素かを記録
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current.lastDist = Math.sqrt(dx*dx+dy*dy);
      // 中心点でヒットテスト
      const cx = (e.touches[0].clientX + e.touches[1].clientX)/2;
      const cy = (e.touches[0].clientY + e.touches[1].clientY)/2;
      const {x:mx, y:my} = getCanvasPos(cx, cy);
      const hit = hitTest(mx, my);
      pinchRef.current.key = hit ? hit.key : null;
      pinchRef.current.type = hit ? hit.type : null;
    } else if (e.touches.length === 1) {
      handleMouseDown({ clientX:e.touches[0].clientX, clientY:e.touches[0].clientY });
    }
  }, [handleMouseDown, getCanvasPos, hitTest]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx*dx+dy*dy);
      if (pinchRef.current.lastDist && dist > 0) {
        const ratio = dist / pinchRef.current.lastDist;
        const k = pinchRef.current.key;
        const t = pinchRef.current.type;
        if (t === "photo") {
          setPhotoScale(s => Math.min(Math.max(s*ratio, 0.2), 6));
        } else if (k) {
          setScales(prev => ({ ...prev, [k]: Math.min(Math.max((prev[k]||1)*ratio, 0.3), 4) }));
        }
      }
      pinchRef.current.lastDist = dist;
    } else if (e.touches.length === 1) {
      handleMouseMove({ clientX:e.touches[0].clientX, clientY:e.touches[0].clientY });
    }
  }, [handleMouseMove, setPhotoScale]);

  const handleTouchEnd = useCallback(() => {
    pinchRef.current.lastDist = null;
    handleMouseUp();
  }, [handleMouseUp]);

  return (
    <div style={{ minHeight:"100vh", background:C.cream, fontFamily:"'Noto Sans JP',sans-serif", color:C.ink, paddingBottom:60 }}>
      <AppHeader screen={screen} onBack={
        screen==="preview" ? ()=>setScreen("edit") :
        screen==="done"    ? ()=>setScreen("preview") : null
      }/>
      {screen==="edit"    && <EditScreen values={values} setValues={setValues} photo={photo} setPhoto={setPhoto} setPhotoScale={setPhotoScale} setPhotoPos={setPhotoPos} canNext={canNext} onNext={()=>setScreen("preview")} />}
      {screen==="preview" && <PreviewScreen values={values} offsets={offsets} scales={scales} photoImg={photoImg} photoScale={photoScale} photoPos={photoPos} canvasRef={previewRef} PW={PW} PH={PH} generating={generating} isDragging={!!dragging} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onGenerate={handleGenerate} onEdit={()=>setScreen("edit")} />}
      {screen==="done"    && <DoneScreen downloadUrl={downloadUrl} onReset={reset} />}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} input::placeholder{color:#C0B8B0} *{box-sizing:border-box} ::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}

// ── AppHeader ──────────────────────────────────────────────
function AppHeader({ screen, onBack }) {
  return (
    <header style={{ background:C.ink, height:56, display:"flex", alignItems:"center", padding:"0 16px", gap:10, position:"sticky", top:0, zIndex:300, boxShadow:"0 2px 20px #00000055" }}>
      {onBack
        ? <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", color:C.white, fontSize:26, lineHeight:1, padding:"0 10px 0 0", marginLeft:-4 }}>‹</button>
        : <LogoBadge size={32} />
      }
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ margin:0, fontSize:10, color:`${C.white}55`, letterSpacing:"0.1em", fontWeight:700 }}>参政党 BANNER CREATOR</p>
        <p style={{ margin:0, fontSize:12, fontWeight:700, color:C.white, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {screen==="edit" ? "Instagramリール・ストーリーズ用バナー" : screen==="preview" ? "確認・位置調整" : "完成！"}
        </p>
      </div>
      <div style={{ display:"flex", gap:5 }}>
        {["edit","preview","done"].map(s=>(
          <div key={s} style={{ width:s===screen?18:5, height:5, borderRadius:3, background:s===screen?C.g1:`${C.white}25`, transition:"all 0.3s" }} />
        ))}
      </div>
    </header>
  );
}

function LogoBadge({ size=30 }) {
  return <div style={{ width:size, height:size, borderRadius:Math.round(size*0.23), background:`linear-gradient(135deg,${C.g1} 7%,${C.g2} 97%)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.38, fontWeight:900, color:C.white, flexShrink:0 }}>参</div>;
}

// ── EditScreen ─────────────────────────────────────────────
function EditScreen({ values, setValues, photo, setPhoto, setPhotoScale, setPhotoPos, canNext, onNext }) {
  const readFile = (file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = ev => { setPhoto(ev.target.result); setPhotoScale(1); setPhotoPos({x:0,y:0}); };
    r.readAsDataURL(file);
  };
  return (
    <div style={{ maxWidth:520, margin:"0 auto" }}>
      <div style={{ background:`${C.g1}12`, borderBottom:`1px solid ${C.g1}22`, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
        <LogoBadge size={26} />
        <div>
          <p style={{ margin:0, fontSize:13, fontWeight:700, color:C.inkS }}>Instagramリール・ストーリーズ</p>
          <p style={{ margin:0, fontSize:11, color:C.gray }}>1080×1920px　背景透過PNG</p>
        </div>
      </div>
      <div style={{ padding:"20px 16px 40px" }}>
        <SectionLabel num="01" title="⑦ 候補者写真・ポスター" sub="右下エリアに配置。次の画面でドラッグ・ピンチで調整できます（任意）" />
        <div style={{ marginTop:10 }}>
          {!photo ? (
            <label style={{ display:"flex", alignItems:"center", gap:14, background:C.white, border:`2px dashed ${C.g1}55`, borderRadius:14, padding:"20px", cursor:"pointer" }}>
              <div style={{ width:52, height:52, borderRadius:"50%", background:`${C.g1}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>📷</div>
              <div>
                <p style={{ margin:0, fontSize:15, fontWeight:700, color:C.g1 }}>写真をタップして選択</p>
                <p style={{ margin:0, fontSize:11, color:C.gray, marginTop:4, lineHeight:1.6 }}>切り抜き済みJPG・PNG推奨</p>
              </div>
              <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>readFile(e.target.files[0])} />
            </label>
          ) : (
            <div style={{ display:"flex", alignItems:"center", gap:12, background:C.white, borderRadius:14, padding:"12px 16px", border:`1.5px solid ${C.g1}` }}>
              <img src={photo} style={{ width:64, height:64, borderRadius:10, objectFit:"cover", flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <p style={{ margin:0, fontSize:13, fontWeight:700, color:C.inkS }}>✓ 写真設定済み</p>
                <p style={{ margin:0, fontSize:11, color:C.gray, marginTop:3 }}>次の画面でドラッグ・ピンチで調整できます</p>
              </div>
              <label style={{ fontSize:12, color:C.g1, cursor:"pointer", textDecoration:"underline", fontWeight:700, flexShrink:0 }}>
                変える<input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>readFile(e.target.files[0])} />
              </label>
            </div>
          )}
        </div>
        <div style={{ marginTop:24 }}>
          <SectionLabel num="02" title="テキスト入力" sub="●必須　○任意 ／ 次の画面でドラッグ・ピンチで位置・サイズ調整できます" />
          <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:10 }}>
            {[...TEXT_ITEMS, ...VOTE_FIELDS].map(field => (
              <FieldInput key={field.key} field={field} value={values[field.key]||""} onChange={v=>setValues(prev=>({...prev,[field.key]:v}))} />
            ))}
          </div>
        </div>
        <div style={{ marginTop:24 }}>
          {!canNext && (
            <div style={{ background:`${C.g1}10`, border:`1px solid ${C.g1}25`, borderRadius:10, padding:"10px 14px", marginBottom:12 }}>
              {[...TEXT_ITEMS, ...VOTE_FIELDS].filter(f=>f.required && !(values[f.key]||"").trim()).map(f=>(
                <p key={f.key} style={{ margin:"2px 0", fontSize:12, color:C.g1, fontWeight:700 }}>● 「{f.label}」を入力してください</p>
              ))}
            </div>
          )}
          <PrimaryBtn disabled={!canNext} onClick={onNext}>プレビューを確認する →</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// ── FieldInput ─────────────────────────────────────────────
function FieldInput({ field, value, onChange }) {
  const [focused, setFocused] = useState(false);
  const filled = value.trim().length > 0;
  return (
    <div style={{ background:C.white, border:`1.5px solid ${focused?C.g1:filled?`${C.g1}50`:C.grayL}`, borderRadius:12, padding:"11px 14px", transition:"border-color 0.2s" }}>
      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6 }}>
        <span style={{ fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:20, background:field.required?`linear-gradient(135deg,${C.g1},${C.g2})`:C.grayLL, color:field.required?C.white:C.gray }}>{field.required?"●必須":"○任意"}</span>
        <span style={{ fontSize:12, fontWeight:700, color:C.inkS }}>{field.label}</span>
        {filled && <span style={{ marginLeft:"auto", fontSize:13, color:C.g1 }}>✓</span>}
      </div>
      <input value={value} onChange={e=>onChange(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} placeholder={field.placeholder}
        style={{ width:"100%", background:"transparent", border:"none", outline:"none", fontSize:16, fontFamily:"'Noto Sans JP',sans-serif", color:C.ink, padding:0 }} />
      {focused && field.hint && <p style={{ margin:"5px 0 0", fontSize:10, color:C.g1, lineHeight:1.5 }}>💡 {field.hint}</p>}
    </div>
  );
}

// ── PreviewScreen ──────────────────────────────────────────
function PreviewScreen({ values, offsets, scales, photoImg, photoScale, photoPos, canvasRef, PW, PH, generating, isDragging, onMouseDown, onMouseMove, onMouseUp, onTouchStart, onTouchMove, onTouchEnd, onGenerate, onEdit }) {
  return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"16px 16px 40px" }}>
      <p style={{ margin:"0 0 4px", fontSize:14, fontWeight:700 }}>プレビュー・調整</p>
      <p style={{ margin:"0 0 12px", fontSize:11, color:C.gray, lineHeight:1.6 }}>
        📌 テキスト・写真をドラッグで移動<br/>
        🤏 テキスト・写真をピンチで拡大縮小（縦横比固定）
      </p>
      <div style={{ display:"flex", justifyContent:"center", borderRadius:10, overflow:"hidden", boxShadow:`0 8px 40px ${C.g1}25`, border:`2px solid ${C.g1}`, background:"repeating-conic-gradient(#bbb 0% 25%,#fff 0% 50%) 0 0/14px 14px" }}>
        <canvas ref={canvasRef} width={PW} height={PH}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          style={{ display:"block", cursor:isDragging?"grabbing":"grab", touchAction:"none", userSelect:"none" }}
        />
      </div>
      <p style={{ textAlign:"center", fontSize:10, color:C.gray, marginTop:6 }}>チェック柄＝透明エリア　出力：1080×1920px 透過PNG</p>
      <div style={{ display:"flex", gap:10, marginTop:14 }}>
        <button onClick={onEdit} style={{ padding:"14px 18px", background:"transparent", border:`1.5px solid ${C.grayL}`, borderRadius:12, color:C.inkS, fontSize:13, fontFamily:"'Noto Sans JP',sans-serif", cursor:"pointer", flexShrink:0 }}>← 修正する</button>
        <PrimaryBtn onClick={onGenerate} disabled={generating} flex>
          {generating ? <><Spinner size={18} color={C.white}/>生成中...</> : "✦ バナーを生成する"}
        </PrimaryBtn>
      </div>
    </div>
  );
}

// ── DoneScreen ─────────────────────────────────────────────
function DoneScreen({ downloadUrl, onReset }) {
  return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"36px 16px" }}>
      <div style={{ textAlign:"center", marginBottom:24 }}>
        <div style={{ width:68, height:68, borderRadius:"50%", margin:"0 auto 12px", background:`linear-gradient(135deg,${C.g1} 7%,${C.g2} 97%)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, boxShadow:`0 8px 28px ${C.g1}50` }}>✓</div>
        <h2 style={{ margin:0, fontSize:20, fontWeight:900 }}>バナー完成！</h2>
        <p style={{ margin:"6px 0 0", fontSize:12, color:C.gray }}>1080×1920px 背景透過PNG</p>
      </div>
      {downloadUrl && (
        <div style={{ borderRadius:12, overflow:"hidden", border:`2px solid ${C.g1}`, marginBottom:18, background:"repeating-conic-gradient(#bbb 0% 25%,#fff 0% 50%) 0 0/14px 14px", display:"flex", justifyContent:"center", maxHeight:480 }}>
          <img src={downloadUrl} style={{ height:480, width:"auto", display:"block" }} />
        </div>
      )}
      <a href={downloadUrl} download="sanseito_reel_banner.png" style={{ display:"block", width:"100%", padding:"17px", background:`linear-gradient(135deg,${C.g1} 7%,${C.g2} 97%)`, borderRadius:14, textAlign:"center", color:C.white, fontSize:15, fontWeight:700, textDecoration:"none", fontFamily:"'Noto Sans JP',sans-serif", boxShadow:`0 6px 28px ${C.g1}50`, letterSpacing:"0.06em" }}>↓ ダウンロード（透過PNG）</a>
      <button onClick={onReset} style={{ width:"100%", marginTop:10, padding:"13px", background:"transparent", border:`1.5px solid ${C.grayL}`, borderRadius:14, color:C.inkS, fontSize:14, fontFamily:"'Noto Sans JP',sans-serif", cursor:"pointer" }}>最初からやり直す</button>
    </div>
  );
}

// ── Canvas描画 ─────────────────────────────────────────────
function drawBanner(canvas, vals, offsets, scales, photoImg, photoScale, photoPos, W, H) {
  if (!canvas) return;
  const r = W / CW;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, W, H);

  // 1. 写真（最下層）
  if (photoImg) drawPhotoInArea(ctx, photoImg, photoScale, photoPos, r);

  // 2. 上部オレンジ帯
  fillGradH(ctx, L.ORANGE_TOP, r, H);

  // 3. キャッチコピー帯
  fillGradH(ctx, L.CATCH_BAND, r, H);

  // 4. 白帯
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(L.WHITE_BAND.x*r, L.WHITE_BAND.y*r, L.WHITE_BAND.w*r, L.WHITE_BAND.h*r);

  // 5. 下部オレンジ帯
  fillGradH(ctx, L.ORANGE_BOT, r, H);

  // 6. 党ロゴ
  drawPartyLogo(ctx, r);

  // 7. テキスト要素
  TEXT_ITEMS.forEach(item => {
    const text = (vals[item.key] || "").trim();
    if (!text) return;

    const ox = offsets[item.key]?.x || 0;
    const oy = offsets[item.key]?.y || 0;
    const sc = scales[item.key] || 1;

    // エリア左上（オフセット込み）
    const lx = (item.layout.x + ox) * r;
    const ly = (item.layout.y + oy) * r;
    const lw = item.layout.w * sc * r;
    const lh = item.layout.h * sc * r;

    // フォントサイズをエリア幅に合わせて自動縮小
    let fs = item.baseSize * sc * r;
    ctx.font = `${item.fontWeight} ${fs}px ${item.fontFamily},sans-serif`;
    while (ctx.measureText(text).width > lw - 8*r && fs > 10*r) {
      fs -= r * 0.5;
      ctx.font = `${item.fontWeight} ${fs}px ${item.fontFamily},sans-serif`;
    }

    ctx.fillStyle = item.color;
    ctx.textBaseline = "middle";

    if (item.key === "name") {
      // ドロップシャドウ
      ctx.save();
      ctx.shadowColor    = "rgba(0,0,0,0.75)";
      ctx.shadowOffsetX  = 2 * r;
      ctx.shadowOffsetY  = 2 * r;
      ctx.shadowBlur     = 1 * r;
      ctx.textAlign = "center";
      ctx.fillText(text, lx + lw/2, ly + lh/2);
      ctx.restore();

    } else if (item.alignLeft) {
      // 左揃え（キャッチコピーなど）
      ctx.textAlign = "left";
      ctx.fillText(text, lx, ly + lh/2);

    } else {
      // 中央揃え
      ctx.textAlign = "center";
      ctx.fillText(text, lx + lw/2, ly + lh/2);
    }
  });

  // 8. 投開票日（赤・中央）
  const voteText = (vals.voteday || "").trim();
  if (voteText) {
    const { x, y, w, h } = L.VOTE;
    let fs = 72*r;
    ctx.font = `900 ${fs}px 'Noto Sans JP',sans-serif`;
    while (ctx.measureText(voteText).width > w*r - 8*r && fs > 16*r) {
      fs -= r; ctx.font = `900 ${fs}px 'Noto Sans JP',sans-serif`;
    }
    ctx.fillStyle = C.red;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(voteText, (x+w/2)*r, (y+h/2)*r);
  }

  // 9. 期日前投票期間（黒・中央・エリアいっぱい）
  const periodText = (vals.period || "").trim();
  if (periodText) {
    const { x, y, w, h } = L.PERIOD;
    let fs = 38*r;
    ctx.font = `700 ${fs}px 'Noto Sans JP',sans-serif`;
    while (ctx.measureText(periodText).width > w*r - 4*r && fs > 10*r) {
      fs -= r*0.5; ctx.font = `700 ${fs}px 'Noto Sans JP',sans-serif`;
    }
    ctx.fillStyle = C.ink;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(periodText, (x+w/2)*r, (y+h/2)*r);
  }

  ctx.textAlign = "left";
}

// ── グラデ帯描画（左→右） ────────────────────────────────
function fillGradH(ctx, rect, r, H) {
  const { x, y, w, h } = rect;
  const g = ctx.createLinearGradient(x*r, 0, (x+w)*r, 0);
  g.addColorStop(0, "rgb(235,97,0)");
  g.addColorStop(1, "rgb(241,141,0)");
  ctx.fillStyle = g;
  // ORANGE_BOTは下端まで塗る
  const drawH = (y+h >= CH-1) ? (H - y*r) : h*r;
  ctx.fillRect(x*r, y*r, w*r, drawH);
}

// ── 写真エリア描画 ─────────────────────────────────────────
function drawPhotoInArea(ctx, img, scale, pos, r) {
  const { x, y, w, h } = L.PHOTO;
  const ax=x*r, ay=y*r, aw=w*r, ah=h*r;
  ctx.save();
  ctx.beginPath();
  ctx.rect(ax, ay, aw, ah);
  ctx.clip();
  const ia = img.width/img.height, aa = aw/ah;
  let dw, dh;
  if (ia>aa) { dh=ah*scale; dw=dh*ia; } else { dw=aw*scale; dh=dw/ia; }
  ctx.drawImage(img, ax+(aw-dw)/2+pos.x*r, ay+(ah-dh)/2+pos.y*r, dw, dh);
  ctx.restore();
}

// ── 党ロゴ描画 ────────────────────────────────────────────
function drawPartyLogo(ctx, r) {
  const { x, y, w, h } = L.LOGO;
  const cx = (x+w/2)*r;
  const circleY = (y+h*0.34)*r;
  const cr = w*0.38*r;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, circleY, cr, 0, Math.PI*2);
  ctx.strokeStyle = C.white;
  ctx.lineWidth = 5*r;
  ctx.stroke();
  ctx.font = `900 ${cr*0.95}px 'Noto Sans JP',sans-serif`;
  ctx.fillStyle = C.white;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("参", cx, circleY);
  ctx.font = `900 ${w*0.28*r}px 'Noto Sans JP',sans-serif`;
  ctx.textBaseline = "top";
  ctx.fillText("参政党", cx, (y+h*0.64)*r);
  ctx.font = `400 ${w*0.12*r}px 'Noto Sans JP',sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText("sanseito", cx, (y+h*0.85)*r);
  ctx.restore();
  ctx.textAlign = "left";
}

// ── Shared UI ─────────────────────────────────────────────
function SectionLabel({ num, title, sub }) {
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:7 }}>
        {num && <span style={{ fontSize:10, fontWeight:700, color:C.g1, letterSpacing:"0.12em" }}>{num}</span>}
        <h2 style={{ fontSize:16, fontWeight:700, margin:0 }}>{title}</h2>
      </div>
      {sub && <p style={{ fontSize:11, color:C.gray, margin:"4px 0 0", lineHeight:1.6 }}>{sub}</p>}
    </div>
  );
}

function PrimaryBtn({ children, onClick, disabled, flex }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ flex:flex?1:undefined, width:flex?undefined:"100%", padding:"15px", background:disabled?C.grayL:`linear-gradient(135deg,${C.g1} 7%,${C.g2} 97%)`, border:"none", borderRadius:14, color:C.white, fontSize:15, fontWeight:700, fontFamily:"'Noto Sans JP',sans-serif", cursor:disabled?"not-allowed":"pointer", boxShadow:disabled?"none":`0 4px 20px ${C.g1}45`, transition:"all 0.25s", display:"flex", alignItems:"center", justifyContent:"center", gap:8, letterSpacing:"0.06em" }}>{children}</button>
  );
}

function Spinner({ size=20, color=C.g1 }) {
  return <div style={{ width:size, height:size, flexShrink:0, border:`2.5px solid ${color}30`, borderTop:`2.5px solid ${color}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />;
}
