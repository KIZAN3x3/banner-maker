import { useState } from "react";

const ADMIN_PASSWORD = "123123"; // 管理者パスワード（変更可能）
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const GITHUB_OWNER = "KIZAN3x3";
const GITHUB_REPO = "banner-maker";
const GITHUB_BRANCH = "main";

const C = {
  g1:"#EB6100", g2:"#F18D00",
  ink:"#18120A", white:"#FFFFFF",
  cream:"#FAF6F0", gray:"#9C8E80",
  grayL:"#D6CEC4", grayLL:"#EDE7DF",
  dark:"#0F0A05", green:"#22C55E",
  red:"#EF4444",
};

// アップロード対象ファイル定義
const UPLOAD_TARGETS = [
  { id:"sns_bg",       label:"SNS枠　背景画像",         filename:"ins-bg.png"          },
  { id:"sns_sample",   label:"SNS枠　お手本バナー",      filename:"ins-sample.png"      },
  { id:"vote_bg",      label:"投票依頼　背景画像",        filename:"bg_vote.png"         },
  { id:"vote_sample",  label:"投票依頼　お手本バナー",    filename:"sample_vote.png"     },
  { id:"schedule_bg",  label:"スケジュール　背景画像",    filename:"bg_schedule.png"     },
  { id:"schedule_s",   label:"スケジュール　お手本",      filename:"sample_schedule.png" },
  { id:"speech_bg",    label:"演説告知　背景画像",        filename:"bg_speech.png"       },
  { id:"speech_s",     label:"演説告知　お手本",          filename:"sample_speech.png"   },
  { id:"countdown_bg", label:"カウントダウン　背景画像",  filename:"bg_countdown.png"    },
  { id:"countdown_s",  label:"カウントダウン　お手本",    filename:"sample_countdown.png"},
  { id:"win_bg",       label:"当選　背景画像",            filename:"bg_win.png"          },
  { id:"win_s",        label:"当選　お手本",              filename:"sample_win.png"      },
];

export default function Admin() {
  const [authed,   setAuthed]   = useState(false);
  const [pw,       setPw]       = useState("");
  const [err,      setErr]      = useState("");
  const [statuses, setStatuses] = useState({}); // { filename: "uploading"|"done"|"error" }
  const [dragOver, setDragOver] = useState(null);

  const login = () => {
    if (pw === ADMIN_PASSWORD) setAuthed(true);
    else { setErr("パスワードが違います"); setTimeout(()=>setErr(""),1500); }
  };

  // GitHubにファイルをアップロード
  const uploadToGitHub = async (filename, file) => {
    setStatuses(s => ({ ...s, [filename]:"uploading" }));
    try {
      // Base64に変換
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 既存ファイルのSHAを取得
      const path = `public/${filename}`;
      const getRes = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
        { headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" } }
      );
      const sha = getRes.ok ? (await getRes.json()).sha : undefined;

      // ファイルをアップロード
      const putRes = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
        {
          method: "PUT",
          headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `Update ${filename} via admin panel`,
            content: base64,
            branch: GITHUB_BRANCH,
            ...(sha ? { sha } : {}),
          }),
        }
      );

      if (putRes.ok) {
        setStatuses(s => ({ ...s, [filename]:"done" }));
      } else {
        const errData = await putRes.json();
        console.error(errData);
        setStatuses(s => ({ ...s, [filename]:"error" }));
      }
    } catch (e) {
      console.error(e);
      setStatuses(s => ({ ...s, [filename]:"error" }));
    }
  };

  const handleDrop = (e, filename) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    uploadToGitHub(filename, file);
  };

  const handleFile = (e, filename) => {
    const file = e.target.files[0];
    if (!file) return;
    uploadToGitHub(filename, file);
    e.target.value = "";
  };

  if (!authed) {
    return (
      <div style={{ minHeight:"100vh", background:C.dark, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Noto Sans JP',sans-serif" }}>
        <div style={{ background:C.ink, borderRadius:20, padding:"40px 32px", width:300, boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}>
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ width:56, height:56, borderRadius:14, background:`linear-gradient(135deg,${C.g1},${C.g2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:900, color:C.white, margin:"0 auto 14px" }}>管理</div>
            <p style={{ margin:0, fontSize:18, fontWeight:700, color:C.white }}>管理者ページ</p>
            <p style={{ margin:"6px 0 0", fontSize:12, color:C.gray }}>管理者パスワードを入力</p>
          </div>
          <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="管理者パスワード"
            style={{ width:"100%", padding:"13px 16px", background:"#2A1E12", border:`1.5px solid ${err?"#EF4444":C.grayL}`, borderRadius:10, color:C.white, fontSize:16, outline:"none", boxSizing:"border-box", fontFamily:"'Noto Sans JP',sans-serif" }}
          />
          {err && <p style={{ color:C.red, fontSize:12, margin:"6px 0 0", textAlign:"center" }}>{err}</p>}
          <button onClick={login} style={{ width:"100%", marginTop:14, padding:"14px", background:`linear-gradient(135deg,${C.g1},${C.g2})`, border:"none", borderRadius:12, color:C.white, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"'Noto Sans JP',sans-serif" }}>ログイン</button>
        </div>
        <style>{`input::placeholder{color:#5A4A38} *{box-sizing:border-box}`}</style>
      </div>
    );
  }

  const allDone = Object.values(statuses).some(s=>s==="done");

  return (
    <div style={{ minHeight:"100vh", background:C.cream, fontFamily:"'Noto Sans JP',sans-serif", color:C.ink, paddingBottom:60 }}>
      {/* ヘッダー */}
      <header style={{ background:C.ink, height:56, display:"flex", alignItems:"center", padding:"0 20px", gap:12, position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 20px #00000055" }}>
        <div style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg,${C.g1},${C.g2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:900, color:C.white }}>管理</div>
        <p style={{ margin:0, fontSize:14, fontWeight:700, color:C.white, flex:1 }}>バナーメーカー　管理者ページ</p>
        {allDone && (
          <div style={{ fontSize:11, color:C.green, background:"rgba(34,197,94,0.15)", padding:"4px 12px", borderRadius:20 }}>
            ✓ Vercelに自動デプロイ中...
          </div>
        )}
        <a href="/" style={{ fontSize:12, color:C.gray, textDecoration:"none" }}>← アプリに戻る</a>
      </header>

      <div style={{ maxWidth:600, margin:"0 auto", padding:"24px 16px" }}>
        <div style={{ background:"#FFF8E1", border:"1px solid #F59E0B", borderRadius:10, padding:"12px 16px", marginBottom:24 }}>
          <p style={{ margin:0, fontSize:12, color:"#92400E", lineHeight:1.7 }}>
            📌 画像をドラッグ＆ドロップするとGitHubに自動アップロードされ、1〜2分後にVercelに反映されます。<br/>
            画像サイズは <strong>1080×1920px（PNG推奨）</strong> で作成してください。
          </p>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {UPLOAD_TARGETS.map(target => {
            const status = statuses[target.filename];
            const isDragOver = dragOver === target.id;
            return (
              <div key={target.id}
                onDragOver={e=>{ e.preventDefault(); setDragOver(target.id); }}
                onDragLeave={()=>setDragOver(null)}
                onDrop={e=>handleDrop(e, target.filename)}
                style={{
                  background: isDragOver ? `${C.g1}15` : C.white,
                  border: `2px ${isDragOver?"solid":"dashed"} ${
                    status==="done" ? C.green :
                    status==="error" ? C.red :
                    status==="uploading" ? C.g1 :
                    isDragOver ? C.g1 : C.grayL
                  }`,
                  borderRadius:12,
                  padding:"16px 18px",
                  display:"flex", alignItems:"center", gap:14,
                  transition:"all 0.2s",
                  cursor:"pointer",
                }}
              >
                {/* ステータスアイコン */}
                <div style={{ width:36, height:36, borderRadius:8, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
                  background:
                    status==="done" ? "rgba(34,197,94,0.15)" :
                    status==="error" ? "rgba(239,68,68,0.15)" :
                    status==="uploading" ? `${C.g1}15` :
                    C.grayLL
                }}>
                  {status==="uploading" ? <Spinner size={18} /> :
                   status==="done"      ? "✅" :
                   status==="error"     ? "❌" : "📁"}
                </div>

                <div style={{ flex:1 }}>
                  <p style={{ margin:0, fontSize:13, fontWeight:700, color:C.ink }}>{target.label}</p>
                  <p style={{ margin:"2px 0 0", fontSize:11, color:C.gray }}>{target.filename}</p>
                  {status==="uploading" && <p style={{ margin:"4px 0 0", fontSize:11, color:C.g1 }}>アップロード中...</p>}
                  {status==="done"      && <p style={{ margin:"4px 0 0", fontSize:11, color:C.green }}>✓ アップロード完了！Vercelに反映中...</p>}
                  {status==="error"     && <p style={{ margin:"4px 0 0", fontSize:11, color:C.red }}>エラーが発生しました。再試行してください。</p>}
                  {!status             && <p style={{ margin:"4px 0 0", fontSize:11, color:C.gray }}>ここに画像をドロップ、またはタップして選択</p>}
                </div>

                <label style={{ flexShrink:0, padding:"8px 14px", background:status==="uploading"?C.grayL:`linear-gradient(135deg,${C.g1},${C.g2})`, border:"none", borderRadius:8, color:C.white, fontSize:12, fontWeight:700, cursor:status==="uploading"?"not-allowed":"pointer" }}>
                  選択
                  <input type="file" accept="image/*" style={{ display:"none" }} disabled={status==="uploading"} onChange={e=>handleFile(e, target.filename)} />
                </label>
              </div>
            );
          })}
        </div>

        {allDone && (
          <div style={{ marginTop:24, background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:12, padding:"16px", textAlign:"center" }}>
            <p style={{ margin:0, fontSize:14, fontWeight:700, color:C.green }}>✅ アップロード完了</p>
            <p style={{ margin:"6px 0 0", fontSize:12, color:C.gray }}>1〜2分後にVercelに自動反映されます</p>
          </div>
        )}
      </div>

      <style>{`
        *{box-sizing:border-box}
        input::placeholder{color:#5A4A38}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}

function Spinner({ size=20 }) {
  return (
    <div style={{ width:size, height:size, border:`2px solid ${C.g1}30`, borderTop:`2px solid ${C.g1}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
  );
}
