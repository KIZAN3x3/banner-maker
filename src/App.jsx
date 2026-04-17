import { useState, useRef, useEffect, useCallback } from "react";

// ── Google Fonts ───────────────────────────────────────────
const fl = document.createElement("link");
fl.rel = "stylesheet";
fl.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Noto+Serif+JP:wght@400;700;900&display=swap";
document.head.appendChild(fl);

// ── カラー ────────────────────────────────────────────────
const G1 = "rgb(235,97,0)";
const G2 = "rgb(241,141,0)";
const C = {
  g1:"#EB6100", g2:"#F18D00",
  ink:"#18120A", inkS:"#3D2E1E",
  white:"#FFFFFF", cream:"#FAF6F0",
  gray:"#9C8E80", grayL:"#D6CEC4", grayLL:"#EDE7DF",
};

// ── Canvas サイズ ─────────────────────────────────────────
const CW = 1080;
const CH = 1920;

// ── イラレ座標 → Canvas座標変換 ──────────────────────────
// イラレ左上角Y = -284.98 なのでオフセット加算
const IY = 284.98;
const toCanvas = (illustratorY) => illustratorY + IY;

// ── イラレ座標定義 ────────────────────────────────────────
const ORANGE_TOP = {
  x: 0,
  y: toCanvas(-112.5),   // 172.48px
  w: 1080,
  h: 345,
};

const LOGO = {
  x: 191.27,
  y: toCanvas(-63.91),   // 221.07px
  w: 193.35,
  h: 189.60,
};

const POS = {
  x: 659.78,
  y: toCanvas(-102.17),  // 182.81px
  w: 558.6,
  h: 109.84,
};

const YOMI = {
  x: 659.78,
  y: toCanvas(-44.78),   // 240.20px
  w: 303.4,
  h: 71.23,
};

const NAME = {
  x: 659.78,
  y: toCanvas(116.54),   // 401.52px
  w: 661.08,
  h: 306.65,
};

const CATCH = {
  x: 0,
  y: toCanvas(1182.52),  // 1467.50px
  w: 1080,
  h: 103.95,
};

const WHITE_BAND = {
  x: 0,
  y: toCanvas(1182.52) + 103.95,  // 1571.45px
  w: 1080,
  h: 140,
};

const VOTE = {
  x: 30,
  y: WHITE_BAND.y,
  w: 700,
  h: 140,
};

const PERIOD = {
  x: 750,
  y: WHITE_BAND.y,
  w: 300,
  h: 140,
};

const ORANGE_BOT = {
  x: 0,
  y: WHITE_BAND.y + WHITE_BAND.h,  // 1711.45px
  w: 1080,
  h: CH - (WHITE_BAND.y + WHITE_BAND.h),
};

const PHOTO = {
  x: 908.12,
  y: toCanvas(990.97),   // 1275.95px
  w: 281.45,
  h: 437.43,
};

// ── テキスト要素定義 ──────────────────────────────────────
const TEXT_ITEMS = [
  {
    key: "position",
    label: "① 肩書き・選挙区",
    placeholder: "幸田町議会議員候補",
    required: false,
    hint: "上部オレンジ帯内に表示",
    layout: POS,
    fontWeight: "700",
    fontFamily: "'Noto Sans JP'",
    color: "#FFFFFF",
    baseSize: 60,
  },
  {
    key: "yomi",
    label: "② よみがな",
    placeholder: "ふじもとかずみ",
    required: false,
    hint: "候補者名の上に小さく表示",
    layout: YOMI,
    fontWeight: "400",
    fontFamily: "'Noto Serif JP'",
    color: "#FFFFFF",
    baseSize: 42,
  },
  {
    key: "name",
    label: "③ 候補者名",
    placeholder: "藤本和美",
    required: true,
    hint: "白テキストで大きく表示",
    layout: NAME,
    fontWeight: "900",
    fontFamily: "'Noto Sans JP'",
    color: "#FFFFFF",
    baseSize: 220,
  },
  {
    key: "catch",
    label: "④ キャッチコピー",
    placeholder: "はずみをつける！幸田町",
    required: false,
    hint: "下部オレンジ帯に白テキスト",
    layout: CATCH,
    fontWeight: "900",
    fontFamily: "'Noto Sans JP'",
    color: "#FFFFFF",
    baseSize: 62,
  },
];

// ──────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]   = useState("edit");
  const [values, setValues]   = useState({});
  const [offsets, setOffsets] = useState({});
  const [photo, setPhoto]     = useState(null);
  const [photoImg, setPhotoImg] = useState(null);
  const [photoScale, setPhotoScale] = useState(1);
  const [photoPos,   setPhotoPos]   = useState({ x:0, y:0 });
  const [generating, setGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [fontsReady,  setFontsReady]  = useState(false);
  const [dragging, setDragging] = useState(null);

  const previewRef = useRef(null);

  const PW = Math.min(typeof window !== "undefined" ? window.innerWidth - 32 : 380, 400);
  const PH = Math.round(PW * CH / CW);
  const SCALE = PW / CW;

  useEffect(() => { document.fonts.ready.then(() => setFontsReady(true)); }, []);

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
    drawBanner(previewRef.current, values, offsets, photoImg, photoScale, photoPos, PW, PH);
  }, [screen, values, offsets, photoImg, photoScale, photoPos, fontsReady, PW, PH]);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 80));
    const canvas = document.createElement("canvas");
    canvas.width = CW; canvas.height = CH;
    drawBanner(canvas, values, offsets, photoImg, photoScale, photoPos, CW, CH);
    setDownloadUrl(canvas.toDataURL("image/png"));
    setGenerating(false);
    setScreen("done");
  };

  const reset = () => {
    setScreen("edit"); setValues({}); setOffsets({});
    setPhoto(null); setPhotoScale(1); setPhotoPos({x:0,y:0});
    setDownloadUrl(null);
  };

  const canNext = (values.name || "").trim() !== "";

  // ── テキストドラッグ ──────────────────────────────────
  const handleCanvasMouseDown = useCallback((e) => {
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / SCALE;
    const my = (e.clientY - rect.top)  / SCALE;
    for (const item of TEXT_ITEMS) {
      if (!(values[item.key] || "").trim()) continue;
      const ox = offsets[item.key]?.x || 0;
      const oy = offsets[item.key]?.y || 0;
      const lx = item.layout.x + ox;
      const ly = item.layout.y + oy;
      if (mx >= lx && mx <= lx + item.layout.w && my >= ly && my <= ly + item.layout.h) {
        setDragging({ key: item.key, startX: mx, startY: my, origX: ox, origY: oy });
        return;
      }
    }
    // 写真エリアのドラッグ
    const px = PHOTO.x; const py = PHOTO.y;
    if (mx >= px && mx <= px + PHOTO.w && my >= py && my <= py + PHOTO.h) {
      setDragging({ key: "__photo__", startX: mx, startY: my, origX: photoPos.x, origY: photoPos.y });
    }
  }, [values, offsets, photoPos, SCALE]);

  const handleCanvasMouseMove = useCallback((e) => {
    if (!dragging || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / SCALE;
    const my = (e.clientY - rect.top)  / SCALE;
    const dx = mx - dragging.startX;
    const dy = my - dragging.startY;
    if (dragging.key === "__photo__") {
      setPhotoPos({ x: dragging.origX + dx * (CW/PW), y: dragging.origY + dy * (CW/PW) });
    } else {
      setOffsets(prev => ({ ...prev, [dragging.key]: { x: dragging.origX + dx, y: dragging.origY + dy } }));
    }
  }, [dragging, SCALE, PW]);

  const handleCanvasMouseUp = useCallback(() => setDragging(null), []);

  // タッチ
  const pinchRef = useRef({ lastDist: null });
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current.lastDist = Math.sqrt(dx*dx+dy*dy);
    } else if (e.touches.length === 1) {
      handleCanvasMouseDown({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
    }
  }, [handleCanvasMouseDown]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx*dx+dy*dy);
      if (pinchRef.current.lastDist) {
        setPhotoScale(s => Math.min(Math.max(s*(dist/pinchRef.current.lastDist), 0.2), 6));
      }
      pinchRef.current.lastDist = dist;
    } else if (e.touches.length === 1) {
      handleCanvasMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
    }
  }, [handleCanvasMouseMove, setPhotoScale]);

  const handleTouchEnd = useCallback(() => {
    pinchRef.current.lastDist = null;
    handleCanvasMouseUp();
  }, [handleCanvasMouseUp]);

  return (
    <div style={{ minHeight:"100vh", background:C.cream, fontFamily:"'Noto Sans JP',sans-serif", color:C.ink, paddingBottom:60 }}>
      <AppHeader screen={screen} onBack={screen !== "edit" ? () => setScreen(screen==="done"?"preview":"edit") : null} />

      {screen === "edit" && (
        <EditScreen
          values={values} setValues={setValues}
          photo={photo} setPhoto={setPhoto}
          setPhotoScale={setPhotoScale} setPhotoPos={setPhotoPos}
          canNext={canNext} onNext={() => setScreen("preview")}
        />
      )}

      {screen === "preview" && (
        <PreviewScreen
          values={values} offsets={offsets}
          photoImg={photoImg}
          photoScale={photoScale} setPhotoScale={setPhotoScale}
          photoPos={photoPos}
          canvasRef={previewRef}
          PW={PW} PH={PH}
          generating={generating}
          dragging={!!dragging}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onGenerate={handleGenerate}
          onEdit={() => setScreen("edit")}
        />
      )}

      {screen === "done" && (
        <DoneScreen downloadUrl={downloadUrl} onReset={reset} />
      )}

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        input::placeholder{color:#C0B8B0}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{display:none}
      `}</style>
    </div>
  );
}

// ── AppHeader ──────────────────────────────────────────────
function AppHeader({ screen, onBack }) {
  const titles = { edit:"内容を入力", preview:"確認・位置調整", done:"完成！" };
  return (
    <header style={{
      background:C.ink, height:56,
      display:"flex", alignItems:"center", padding:"0 16px", gap:10,
      position:"sticky", top:0, zIndex:300,
      boxShadow:"0 2px 20px #00000055",
    }}>
      {onBack
        ? <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", color:C.white, fontSize:26, lineHeight:1, padding:"0 10px 0 0", marginLeft:-4 }}>‹</button>
        : <LogoBadge size={32} />
      }
      <div style={{ flex:1 }}>
        <p style={{ margin:0, fontSize:10, color:`${C.white}55`, letterSpacing:"0.12em", fontWeight:700 }}>参政党 BANNER CREATOR</p>
        <p style={{ margin:0, fontSize:13, fontWeight:700, color:C.white }}>{titles[screen]}　リール・ストーリーズ</p>
      </div>
      <StepDots screen={screen} />
    </header>
  );
}

function StepDots({ screen }) {
  return (
    <div style={{ display:"flex", gap:5 }}>
      {["edit","preview","done"].map(s => (
        <div key={s} style={{ width:s===screen?18:5, height:5, borderRadius:3, background:s===screen?C.g1:`${C.white}25`, transition:"all 0.3s" }} />
      ))}
    </div>
  );
}

function LogoBadge({ size=30 }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:Math.round(size*0.23),
      background:`linear-gradient(135deg,${C.g1} 7%,${C.g2} 97%)`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:size*0.38, fontWeight:900, color:C.white, flexShrink:0,
    }}>参</div>
  );
}

// ── EditScreen ─────────────────────────────────────────────
function EditScreen({ values, setValues, photo, setPhoto, setPhotoScale, setPhotoPos, canNext, onNext }) {
  const readFile = (file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = ev => { setPhoto(ev.target.result); setPhotoScale(1); setPhotoPos({x:0,y:0}); };
    r.readAsDataURL(file);
  };

  const VOTE_FIELDS = [
    { key:"voteday", label:"⑤ 投票日", placeholder:"令和9年4月12日（日）", required:false, hint:"白帯にオレンジで表示" },
    { key:"period",  label:"⑥ 期日前投票期間", placeholder:"4/6（月）〜4/11（土）", required:false, hint:"右側に小さく表示" },
  ];

  return (
    <div style={{ maxWidth:520, margin:"0 auto" }}>
      <div style={{ background:`linear-gradient(135deg,${C.g1}15,${C.g2}08)`, borderBottom:`1px solid ${C.g1}22`, padding:"11px 16px", display:"flex", alignItems:"center", gap:10 }}>
        <LogoBadge size={26} />
        <div>
          <p style={{ margin:0, fontSize:13, fontWeight:700, color:C.inkS }}>投票依頼　リール・ストーリーズ</p>
          <p style={{ margin:0, fontSize:11, color:C.gray }}>1080 × 1920px　背景透過PNG</p>
        </div>
      </div>

      <div style={{ padding:"20px 16px 40px" }}>

        {/* 写真 */}
        <SectionLabel num="01" title="⑦ 候補者写真" sub="右下エリアに配置。次の画面でドラッグ・ピンチで調整できます" />
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

        {/* テキスト */}
        <div style={{ marginTop:24 }}>
          <SectionLabel num="02" title="テキスト入力" sub="●必須　○任意 ／ 次の画面でドラッグして位置調整できます" />
          <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:10 }}>
            {[...TEXT_ITEMS, ...VOTE_FIELDS].map(field => (
              <FieldInput
                key={field.key} field={field}
                value={values[field.key]||""}
                onChange={v => setValues(prev => ({ ...prev, [field.key]:v }))}
              />
            ))}
          </div>
        </div>

        {/* 次へ */}
        <div style={{ marginTop:24 }}>
          {!canNext && (
            <div style={{ background:`${C.g1}10`, border:`1px solid ${C.g1}25`, borderRadius:10, padding:"10px 14px", marginBottom:12 }}>
              <p style={{ margin:0, fontSize:12, color:C.g1, fontWeight:700 }}>● 「候補者名」を入力してください</p>
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
    <div style={{
      background:C.white,
      border:`1.5px solid ${focused ? C.g1 : filled ? `${C.g1}50` : C.grayL}`,
      borderRadius:12, padding:"11px 14px", transition:"border-color 0.2s",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6 }}>
        <span style={{
          fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:20,
          background:field.required ? `linear-gradient(135deg,${C.g1},${C.g2})` : C.grayLL,
          color:field.required ? C.white : C.gray,
        }}>{field.required ? "●必須" : "○任意"}</span>
        <span style={{ fontSize:12, fontWeight:700, color:C.inkS }}>{field.label}</span>
        {filled && <span style={{ marginLeft:"auto", fontSize:13, color:C.g1 }}>✓</span>}
      </div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={field.placeholder}
        style={{ width:"100%", background:"transparent", border:"none", outline:"none", fontSize:16, fontFamily:"'Noto Sans JP',sans-serif", color:C.ink, padding:0 }}
      />
      {focused && field.hint && (
        <p style={{ margin:"5px 0 0", fontSize:10, color:C.g1, lineHeight:1.5 }}>💡 {field.hint}</p>
      )}
    </div>
  );
}

// ── PreviewScreen ──────────────────────────────────────────
function PreviewScreen({ values, offsets, photoImg, photoScale, photoPos, canvasRef, PW, PH, generating, dragging, onMouseDown, onMouseMove, onMouseUp, onTouchStart, onTouchMove, onTouchEnd, onGenerate, onEdit }) {
  return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"16px 16px 40px" }}>
      <div style={{ marginBottom:10 }}>
        <p style={{ margin:0, fontSize:14, fontWeight:700 }}>プレビュー・調整</p>
        <p style={{ margin:"4px 0 0", fontSize:11, color:C.gray, lineHeight:1.6 }}>
          📌 テキスト・写真をドラッグして位置調整<br/>
          🤏 写真はピンチで拡大縮小
        </p>
      </div>

      <div style={{ display:"flex", justifyContent:"center" }}>
        <div style={{
          position:"relative", borderRadius:10, overflow:"hidden",
          boxShadow:`0 8px 40px ${C.g1}25`, border:`2px solid ${C.g1}`,
          background:"repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 16px 16px",
        }}>
          <canvas
            ref={canvasRef} width={PW} height={PH}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{ display:"block", cursor:dragging?"grabbing":"grab", touchAction:"none", userSelect:"none" }}
          />
        </div>
      </div>

      <p style={{ textAlign:"center", fontSize:11, color:C.gray, marginTop:8 }}>
        ※ チェック柄が透明エリアです。出力は1080×1920px透過PNGです。
      </p>

      <div style={{ display:"flex", gap:10, marginTop:16 }}>
        <button onClick={onEdit} style={{
          padding:"14px 18px", background:"transparent",
          border:`1.5px solid ${C.grayL}`, borderRadius:12,
          color:C.inkS, fontSize:13, fontFamily:"'Noto Sans JP',sans-serif",
          cursor:"pointer", flexShrink:0,
        }}>← 修正する</button>
        <PrimaryBtn onClick={onGenerate} disabled={generating} flex>
          {generating ? <><Spinner size={18} color={C.white} />生成中...</> : "✦ バナーを生成する"}
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
        <div style={{
          width:68, height:68, borderRadius:"50%", margin:"0 auto 12px",
          background:`linear-gradient(135deg,${C.g1} 7%,${C.g2} 97%)`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:30, boxShadow:`0 8px 28px ${C.g1}50`,
        }}>✓</div>
        <h2 style={{ margin:0, fontSize:20, fontWeight:900 }}>バナー完成！</h2>
        <p style={{ margin:"6px 0 0", fontSize:12, color:C.gray }}>1080×1920px 背景透過PNG</p>
      </div>

      {downloadUrl && (
        <div style={{
          borderRadius:12, overflow:"hidden",
          border:`2px solid ${C.g1}`, marginBottom:18,
          background:"repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 16px 16px",
          maxHeight:500, display:"flex", justifyContent:"center",
        }}>
          <img src={downloadUrl} style={{ height:500, width:"auto", display:"block" }} />
        </div>
      )}

      <a href={downloadUrl} download="sanseito_reel_banner.png" style={{
        display:"block", width:"100%", padding:"17px",
        background:`linear-gradient(135deg,${C.g1} 7%,${C.g2} 97%)`,
        borderRadius:14, textAlign:"center",
        color:C.white, fontSize:15, fontWeight:700,
        textDecoration:"none", fontFamily:"'Noto Sans JP',sans-serif",
        boxShadow:`0 6px 28px ${C.g1}50`, letterSpacing:"0.06em",
      }}>↓ ダウンロード（透過PNG）</a>

      <button onClick={onReset} style={{
        width:"100%", marginTop:10, padding:"13px",
        background:"transparent", border:`1.5px solid ${C.grayL}`,
        borderRadius:14, color:C.inkS, fontSize:14,
        fontFamily:"'Noto Sans JP',sans-serif", cursor:"pointer",
      }}>最初からやり直す</button>
    </div>
  );
}

// ── Canvas描画 ─────────────────────────────────────────────
function drawBanner(canvas, vals, offsets, photoImg, photoScale, photoPos, W, H) {
  if (!canvas) return;
  const r = W / CW;
  const ctx = canvas.getContext("2d");

  // 全体を透明にリセット
  ctx.clearRect(0, 0, W, H);

  // ── 1. 写真を最下層に描画（青エリア内） ───────────────
  if (photoImg) {
    drawPhotoInArea(ctx, photoImg, photoScale, photoPos, r);
  }

  // ── 2. 上部オレンジグラデ帯 ───────────────────────────
  const topGrad = ctx.createLinearGradient(0, 0, W, 0);
  topGrad.addColorStop(0,   G1);
  topGrad.addColorStop(0.5, G2);
  topGrad.addColorStop(1,   G1);
  ctx.fillStyle = topGrad;
  ctx.fillRect(
    ORANGE_TOP.x * r,
    ORANGE_TOP.y * r,
    ORANGE_TOP.w * r,
    ORANGE_TOP.h * r
  );

  // ── 3. ④キャッチコピー帯 ──────────────────────────────
  const catchGrad = ctx.createLinearGradient(0, CATCH.y*r, W, CATCH.y*r);
  catchGrad.addColorStop(0,   G1);
  catchGrad.addColorStop(0.5, G2);
  catchGrad.addColorStop(1,   G1);
  ctx.fillStyle = catchGrad;
  ctx.fillRect(CATCH.x*r, CATCH.y*r, CATCH.w*r, CATCH.h*r);

  // ── 4. 白帯 ───────────────────────────────────────────
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(WHITE_BAND.x*r, WHITE_BAND.y*r, WHITE_BAND.w*r, WHITE_BAND.h*r);

  // ── 5. 下部オレンジグラデ帯 ───────────────────────────
  const botGrad = ctx.createLinearGradient(0, ORANGE_BOT.y*r, 0, H);
  botGrad.addColorStop(0, G2);
  botGrad.addColorStop(1, G1);
  ctx.fillStyle = botGrad;
  ctx.fillRect(ORANGE_BOT.x*r, ORANGE_BOT.y*r, ORANGE_BOT.w*r, ORANGE_BOT.h*r);

  // ── 6. 党ロゴ ─────────────────────────────────────────
  drawPartyLogo(ctx, r);

  // ── 7. テキスト要素 ───────────────────────────────────
  TEXT_ITEMS.forEach(item => {
    const text = (vals[item.key] || "").trim();
    if (!text) return;
    const ox = offsets[item.key]?.x || 0;
    const oy = offsets[item.key]?.y || 0;
    const lx = (item.layout.x + ox) * r;
    const ly = (item.layout.y + oy) * r;
    const lw = item.layout.w * r;
    const lh = item.layout.h * r;

    // フォントサイズ自動調整
    let fs = item.baseSize * r;
    ctx.font = `${item.fontWeight} ${fs}px ${item.fontFamily},sans-serif`;
    while (ctx.measureText(text).width > lw - 8*r && fs > 16*r) {
      fs -= r * 0.5;
      ctx.font = `${item.fontWeight} ${fs}px ${item.fontFamily},sans-serif`;
    }

    ctx.fillStyle = item.color;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";

    if (item.key === "catch") {
      ctx.fillText(text, lx + 24*r, ly + lh/2);
    } else {
      ctx.fillText(text, lx, ly + lh/2);
    }
  });

  // ── 8. 投票日・期日前（白帯内） ───────────────────────
  const wby = WHITE_BAND.y * r;
  const wbh = WHITE_BAND.h * r;

  // 「投開票日」ラベル
  ctx.font = `700 ${24*r}px 'Noto Sans JP',sans-serif`;
  ctx.fillStyle = C.ink;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("投開票日", 30*r, wby + 12*r);

  // 投票日本文
  if ((vals.voteday || "").trim()) {
    let fs = 58*r;
    ctx.font = `900 ${fs}px 'Noto Sans JP',sans-serif`;
    while (ctx.measureText(vals.voteday).width > 680*r && fs > 20*r) {
      fs -= r;
      ctx.font = `900 ${fs}px 'Noto Sans JP',sans-serif`;
    }
    ctx.fillStyle = C.g1;
    ctx.fillText(vals.voteday, 30*r, wby + 44*r);
  }

  // 「期日前投票期間」ラベル
  ctx.font = `700 ${20*r}px 'Noto Sans JP',sans-serif`;
  ctx.fillStyle = C.gray;
  ctx.textAlign = "right";
  ctx.fillText("期日前投票期間", (CW-30)*r, wby + 12*r);

  // 期日前テキスト
  if ((vals.period || "").trim()) {
    let fs2 = 32*r;
    ctx.font = `700 ${fs2}px 'Noto Sans JP',sans-serif`;
    while (ctx.measureText(vals.period).width > 300*r && fs2 > 16*r) {
      fs2 -= r * 0.5;
      ctx.font = `700 ${fs2}px 'Noto Sans JP',sans-serif`;
    }
    ctx.fillStyle = C.ink;
    ctx.textAlign = "right";
    ctx.fillText(vals.period, (CW-30)*r, wby + 44*r);
  }

  ctx.textAlign = "left";
}

// ── 写真をエリアに描画 ─────────────────────────────────────
function drawPhotoInArea(ctx, img, scale, pos, r) {
  const ax = PHOTO.x * r;
  const ay = PHOTO.y * r;
  const aw = PHOTO.w * r;
  const ah = PHOTO.h * r;

  ctx.save();
  ctx.beginPath();
  ctx.rect(ax, ay, aw, ah);
  ctx.clip();

  const imgAspect = img.width / img.height;
  const areaAspect = aw / ah;
  let dw, dh;
  if (imgAspect > areaAspect) { dh = ah * scale; dw = dh * imgAspect; }
  else { dw = aw * scale; dh = dw / imgAspect; }

  const bx = ax + (aw - dw) / 2 + pos.x * r;
  const by = ay + (ah - dh) / 2 + pos.y * r;
  ctx.drawImage(img, bx, by, dw, dh);
  ctx.restore();
}

// ── 党ロゴ描画 ────────────────────────────────────────────
function drawPartyLogo(ctx, r) {
  const lx = LOGO.x * r;
  const ly = LOGO.y * r;
  const lw = LOGO.w * r;
  const lh = LOGO.h * r;
  const cx = lx + lw * 0.5;
  const circleR = lw * 0.4;
  const circleY = ly + lh * 0.38;

  // 円
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, circleY, circleR, 0, Math.PI*2);
  ctx.strokeStyle = C.white;
  ctx.lineWidth = 5*r;
  ctx.stroke();

  // 円内「参」
  ctx.font = `900 ${circleR * 0.95}px 'Noto Sans JP',sans-serif`;
  ctx.fillStyle = C.white;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("参", cx, circleY);
  ctx.restore();

  // 「参政党」
  ctx.font = `900 ${lw * 0.30}px 'Noto Sans JP',sans-serif`;
  ctx.fillStyle = C.white;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("参政党", cx, ly + lh * 0.65);

  // 「sanseito」
  ctx.font = `400 ${lw * 0.13}px 'Noto Sans JP',sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText("sanseito", cx, ly + lh * 0.87);

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
    <button onClick={onClick} disabled={disabled} style={{
      flex:flex?1:undefined, width:flex?undefined:"100%",
      padding:"15px",
      background:disabled ? C.grayL : `linear-gradient(135deg,${C.g1} 7%,${C.g2} 97%)`,
      border:"none", borderRadius:14,
      color:C.white, fontSize:15, fontWeight:700,
      fontFamily:"'Noto Sans JP',sans-serif",
      cursor:disabled?"not-allowed":"pointer",
      boxShadow:disabled?"none":`0 4px 20px ${C.g1}45`,
      transition:"all 0.25s",
      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
      letterSpacing:"0.06em",
    }}>{children}</button>
  );
}

function Spinner({ size=20, color=C.g1 }) {
  return (
    <div style={{
      width:size, height:size, flexShrink:0,
      border:`2.5px solid ${color}30`,
      borderTop:`2.5px solid ${color}`,
      borderRadius:"50%",
      animation:"spin 0.8s linear infinite",
    }} />
  );
}
