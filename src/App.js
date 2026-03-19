import { useState, useEffect, useCallback, useRef } from "react";

const API = "https://ticketera-chess.onrender.com";

const apiFetch = {
  get: (path, token) =>
    fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
  post: (path, body, token) =>
    fetch(`${API}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    }).then(r => r.json()),
  postForm: (path, body) =>
    fetch(`${API}${path}`, { method: "POST", body }).then(r => r.json()),
  patch: (path, body, token) =>
    fetch(`${API}${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }).then(r => r.json()),
  del: (path, token) =>
    fetch(`${API}${path}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? true : r.json()),
};

const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const I = {
  ticket:  "M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z",
  users:   "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm6 0a3 3 0 1 0 0-6M22 21v-2a4 4 0 0 0-3-3.87",
  chart:   "M3 3v18h18M18 17V9M13 17V5M8 17v-3",
  check:   "M20 6 9 17l-5-5",
  logout:  "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  refresh: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M3 8V3h5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M21 16v5h-5",
  plus:    "M12 5v14M5 12h14",
  trash:   "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  qr:      "M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h3v3h-3zM21 18v3M21 15h-3M18 21h3",
  csv:     "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M10 13H8M16 17H8M12 13h4",
  lock:    "M18 11H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2Zm-6 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM7 11V7a5 5 0 0 1 10 0v4",
  chess:   "M9 18h6M10 22h4M8 18l1-5H7l1-3h8l1 3h-2l1 5M12 2v4M10 4l4 0",
  warn:    "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0ZM12 9v4M12 17h.01",
  search:  "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --bg:#080808; --surf:#101010; --surf2:#161616; --border:#222;
    --gold:#d4a853; --gold2:#f0c87a; --white:#ede9dc; --muted:#555;
    --green:#3a7a3a; --red:#7a2020; --r:5px;
    --head:'Bebas Neue',sans-serif; --mono:'DM Mono',monospace;
  }
  body { background:var(--bg); color:var(--white); font-family:var(--mono); }
  .chess-bg { background-image:repeating-conic-gradient(#ffffff06 0% 25%,transparent 0% 50%); background-size:36px 36px; }

  .login-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; }
  .login-card { background:var(--surf); border:1px solid var(--border); border-top:3px solid var(--gold); padding:48px 40px; width:380px; animation:fadeUp .4s ease; }
  .login-title { font-family:var(--head); font-size:40px; color:var(--gold); letter-spacing:2px; line-height:1; }
  .login-sub { color:var(--muted); font-size:11px; margin-bottom:28px; }

  .field { margin-bottom:13px; }
  .field label { display:block; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); margin-bottom:5px; }
  .field input, .field select {
    width:100%; background:var(--bg); border:1px solid var(--border);
    color:var(--white); font-family:var(--mono); font-size:13px;
    padding:9px 13px; outline:none; border-radius:var(--r); transition:border .15s;
  }
  .field input:focus, .field select:focus { border-color:var(--gold); }

  .btn { display:inline-flex; align-items:center; gap:7px; background:var(--gold); color:#080808; font-family:var(--head); font-size:17px; letter-spacing:1px; border:none; padding:9px 20px; cursor:pointer; border-radius:var(--r); transition:background .15s,transform .1s; white-space:nowrap; }
  .btn:hover { background:var(--gold2); }
  .btn:active { transform:scale(.98); }
  .btn:disabled { opacity:.4; cursor:not-allowed; }
  .btn-full { width:100%; justify-content:center; }
  .btn-sm { font-size:12px; padding:5px 11px; font-family:var(--mono); font-weight:500; }
  .btn-ghost { background:transparent; border:1px solid var(--border); color:var(--white); }
  .btn-ghost:hover { background:#ffffff0a; }
  .btn-green { background:var(--green); color:#fff; }
  .btn-green:hover { background:#4a9a4a; }
  .btn-red { background:var(--red); color:#fff; }
  .btn-red:hover { background:#a03030; }
  .err  { color:#e07070; font-size:12px; margin-top:10px; }
  .succ { color:#70c070; font-size:12px; margin-top:10px; }

  .layout { display:flex; min-height:100vh; }
  .sidebar { width:215px; background:var(--surf); border-right:1px solid var(--border); display:flex; flex-direction:column; position:sticky; top:0; height:100vh; flex-shrink:0; }
  .logo { padding:22px 18px 14px; border-bottom:1px solid var(--border); }
  .logo h1 { font-family:var(--head); font-size:24px; color:var(--gold); letter-spacing:2px; }
  .logo p { font-size:10px; color:var(--muted); letter-spacing:1px; }
  .nav { flex:1; padding:14px 0; }
  .nav-item { display:flex; align-items:center; gap:11px; padding:11px 18px; cursor:pointer; color:var(--muted); font-size:11px; letter-spacing:1px; text-transform:uppercase; transition:color .15s,background .15s; border-left:3px solid transparent; }
  .nav-item:hover { color:var(--white); background:#ffffff07; }
  .nav-item.active { color:var(--gold); border-left-color:var(--gold); background:#d4a85312; }
  .sidebar-foot { padding:14px 18px; border-top:1px solid var(--border); }
  .main { flex:1; overflow-y:auto; }
  .page { padding:28px 32px; }
  .page-hdr { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; gap:12px; }
  .page-title { font-family:var(--head); font-size:34px; letter-spacing:2px; line-height:1; }
  .page-sub { font-size:11px; color:var(--muted); margin-top:3px; }
  .hdr-actions { display:flex; gap:8px; flex-shrink:0; flex-wrap:wrap; }

  .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:14px; margin-bottom:28px; }
  .stat-card { background:var(--surf); border:1px solid var(--border); padding:18px; animation:fadeUp .3s ease; }
  .stat-lbl { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); margin-bottom:6px; }
  .stat-val { font-family:var(--head); font-size:46px; color:var(--gold); line-height:1; }
  .stat-sub { font-size:10px; color:var(--muted); margin-top:3px; }

  .chart-card { background:var(--surf); border:1px solid var(--border); padding:22px; margin-bottom:24px; }
  .chart-title { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); margin-bottom:14px; }
  .bars { display:flex; align-items:flex-end; gap:7px; height:76px; }
  .bar-wrap { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; }
  .bar { width:100%; background:var(--gold); opacity:.65; border-radius:2px 2px 0 0; min-height:2px; transition:opacity .2s; }
  .bar:hover { opacity:1; }
  .bar.used { background:#4a9a4a; }
  .bar-lbl { font-size:9px; color:var(--muted); }

  .toolbar { display:flex; gap:10px; margin-bottom:14px; flex-wrap:wrap; }
  .toolbar input { flex:1; min-width:180px; background:var(--surf); border:1px solid var(--border); color:var(--white); font-family:var(--mono); font-size:13px; padding:8px 13px; outline:none; border-radius:var(--r); }
  .toolbar input:focus { border-color:var(--gold); }
  .table-wrap { background:var(--surf); border:1px solid var(--border); overflow-x:auto; border-radius:var(--r); }
  .tbl { width:100%; border-collapse:collapse; font-size:12px; }
  .tbl th { text-align:left; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); padding:11px 15px; border-bottom:1px solid var(--border); background:var(--bg); }
  .tbl td { padding:11px 15px; border-bottom:1px solid #181818; vertical-align:middle; }
  .tbl tr:last-child td { border-bottom:none; }
  .tbl tr:hover td { background:#ffffff03; }
  .badge { display:inline-block; padding:3px 9px; font-size:10px; letter-spacing:1px; border-radius:2px; text-transform:uppercase; }
  .badge-used   { background:#1e4020; color:#70bf70; }
  .badge-unused { background:#1a2e3c; color:#70a8d8; }
  .badge-admin  { background:#2a1e40; color:#a08ad8; }
  .badge-user   { background:#222; color:var(--muted); }
  .acts { display:flex; gap:6px; }
  .empty { text-align:center; padding:40px; color:var(--muted); font-size:12px; }

  .overlay { position:fixed; inset:0; background:#000000cc; display:flex; align-items:center; justify-content:center; z-index:100; animation:fadeIn .2s; }
  .modal { background:var(--surf2); border:1px solid var(--border); border-top:3px solid var(--gold); padding:32px; width:440px; max-width:calc(100vw - 32px); animation:fadeUp .25s ease; }
  .modal-title { font-family:var(--head); font-size:28px; color:var(--gold); letter-spacing:2px; margin-bottom:20px; }
  .modal-foot { display:flex; gap:10px; margin-top:20px; justify-content:flex-end; }
  .modal-warn { background:#3a1010; border:1px solid #7a2020; padding:14px; border-radius:var(--r); font-size:12px; display:flex; gap:10px; align-items:flex-start; margin-bottom:16px; }
  .qr-result { background:var(--bg); border:1px solid var(--border); padding:16px; border-radius:var(--r); margin-top:12px; }
  .qr-id { font-family:var(--head); font-size:38px; color:var(--gold); line-height:1; }

  .loading { display:flex; align-items:center; justify-content:center; padding:60px; color:var(--muted); font-size:12px; gap:10px; }
  .spinner { width:15px; height:15px; border:2px solid var(--border); border-top-color:var(--gold); border-radius:50%; animation:spin .6s linear infinite; flex-shrink:0; }

  @keyframes spin   { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
`;

// helpers
const isUsed  = t => !!(t.used || t.is_used || t.estado === "usado" || t.estado === "used");
const isAdmin = u => !!(u.role === "admin" || u.is_admin || u.es_admin);
const dStr    = s => (s || "").slice(0, 10) || "—";
const norm    = a => Array.isArray(a) ? a : (a?.tickets || a?.users || a?.items || []);

function exportCSV(tickets) {
  const hdr  = ["id","codigo","nombre","estado","fecha"];
  const rows = tickets.map(t => [t.id, t.codigo||t.code||"", t.nombre||t.name||t.descripcion||"", isUsed(t)?"usado":"disponible", dStr(t.created_at||t.fecha)]);
  const csv  = [hdr,...rows].map(r => r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
  const a    = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv],{type:"text/csv"})), download:"tickets.csv" });
  a.click();
}

// ── Login ──────────────────────────────────────────────
function Login({ onLogin }) {
  const [f, setF] = useState({ username:"", password:"" });
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      const d = await apiFetch.postForm("/auth/token", new URLSearchParams(f));
      if (d.access_token) onLogin(d.access_token); else setErr(d.detail || "Credenciales incorrectas");
    } catch { setErr("No se pudo conectar con la API"); }
    setBusy(false);
  };
  return (
    <div className="login-wrap chess-bg"><div className="login-card">
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
        <Icon d={I.chess} size={30}/>
        <div><div className="login-title">TICKETERA</div><div className="login-sub">PANEL DE ADMINISTRACIÓN</div></div>
      </div>
      {["username","password"].map(k=>(
        <div className="field" key={k}>
          <label>{k==="username"?"Usuario":"Contraseña"}</label>
          <input type={k==="password"?"password":"text"} value={f[k]}
            onChange={e=>setF(p=>({...p,[k]:e.target.value}))}
            onKeyDown={e=>e.key==="Enter"&&submit()}/>
        </div>
      ))}
      <button className="btn btn-full" onClick={submit} disabled={busy}>
        {busy?<span className="spinner"/>:<Icon d={I.lock}/>} INGRESAR
      </button>
      {err&&<div className="err">{err}</div>}
    </div></div>
  );
}

// ── Create Modal ───────────────────────────────────────
function CreateModal({ token, onClose, onDone }) {
  const [f, setF] = useState({ codigo:"", nombre:"", descripcion:"" });
  const [busy,setBusy]=useState(false); const [err,setErr]=useState(""); const [ok,setOk]=useState("");
  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      const r = await apiFetch.post("/tickets/", f, token);
      if (r.id||r.codigo) { setOk("Ticket creado ✓"); onDone(); setTimeout(onClose,1100); }
      else setErr(r.detail||JSON.stringify(r));
    } catch { setErr("Error al crear ticket"); }
    setBusy(false);
  };
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-title">CREAR TICKET</div>
        {[["codigo","Código / Número"],["nombre","Nombre del titular"],["descripcion","Descripción (opcional)"]].map(([k,l])=>(
          <div className="field" key={k}><label>{l}</label>
            <input value={f[k]} onChange={e=>setF(p=>({...p,[k]:e.target.value}))}/>
          </div>
        ))}
        {err&&<div className="err">{err}</div>}{ok&&<div className="succ">{ok}</div>}
        <div className="modal-foot">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancelar</button>
          <button className="btn btn-sm" onClick={submit} disabled={busy}>
            {busy?<span className="spinner"/>:<Icon d={I.plus} size={13}/>} Crear
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Modal ───────────────────────────────────────
function DeleteModal({ ticket, token, onClose, onDone }) {
  const [busy,setBusy]=useState(false); const [err,setErr]=useState("");
  const confirm = async () => {
    setBusy(true);
    try { await apiFetch.del(`/tickets/${ticket.id}`, token); onDone(); onClose(); }
    catch { setErr("Error al eliminar"); setBusy(false); }
  };
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-title">ELIMINAR TICKET</div>
        <div className="modal-warn"><Icon d={I.warn} size={16}/>
          <span>Vas a eliminar el ticket <strong>#{ticket.id}</strong> — {ticket.codigo||ticket.code||"sin código"}. Esto no se puede deshacer.</span>
        </div>
        {err&&<div className="err">{err}</div>}
        <div className="modal-foot">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancelar</button>
          <button className="btn btn-red btn-sm" onClick={confirm} disabled={busy}>
            {busy?<span className="spinner"/>:<Icon d={I.trash} size={13}/>} Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── QR / Search Modal ──────────────────────────────────
function QRModal({ tickets, token, onClose, onRefresh }) {
  const [q,setQ]=useState(""); const [res,setRes]=useState(null); const [msg,setMsg]=useState(""); const [busy,setBusy]=useState(false);
  const ref=useRef(); useEffect(()=>{ ref.current?.focus(); },[]);
  const search = () => {
    const s=q.trim().toLowerCase(); if(!s) return;
    const f=tickets.find(t=>String(t.id)===s||(t.codigo||"").toLowerCase()===s||(t.code||"").toLowerCase()===s||(t.nombre||"").toLowerCase().includes(s));
    setRes(f||null); setMsg(f?"":"No se encontró ningún ticket");
  };
  const markUsed = async () => {
    setBusy(true);
    try { await apiFetch.patch(`/tickets/${res.id}`,{used:true},token); onRefresh(); setRes(r=>({...r,used:true})); }
    catch {} finally { setBusy(false); }
  };
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-title">BUSCAR TICKET</div>
        <div className="field"><label>Código, ID o nombre</label>
          <input ref={ref} value={q} placeholder="Ej: ABC-001 o 42"
            onChange={e=>{setQ(e.target.value);setRes(null);setMsg("");}}
            onKeyDown={e=>e.key==="Enter"&&search()}/>
        </div>
        <button className="btn btn-sm" onClick={search} style={{marginBottom:12}}>
          <Icon d={I.search} size={13}/> Buscar
        </button>
        {msg&&<div className="err">{msg}</div>}
        {res&&(
          <div className="qr-result">
            <div style={{fontSize:10,color:"var(--muted)",letterSpacing:2,marginBottom:4}}>ENCONTRADO</div>
            <div className="qr-id">#{res.id}</div>
            <div style={{fontSize:13,marginTop:4}}>{res.nombre||res.name||"—"}</div>
            <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>Código: {res.codigo||res.code||"—"}</div>
            <div style={{marginTop:10}}><span className={`badge ${isUsed(res)?"badge-used":"badge-unused"}`}>{isUsed(res)?"Ya usado":"Disponible"}</span></div>
            {!isUsed(res)&&<button className="btn btn-green btn-sm" style={{marginTop:12}} onClick={markUsed} disabled={busy}>
              {busy?<span className="spinner"/>:<Icon d={I.check} size={13}/>} Marcar como usado
            </button>}
          </div>
        )}
        <div className="modal-foot"><button className="btn btn-ghost btn-sm" onClick={onClose}>Cerrar</button></div>
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────
function Dashboard({ tickets, users }) {
  const total=tickets.length, used=tickets.filter(isUsed).length, unused=total-used;
  const pct=total>0?Math.round(used/total*100):0;
  const byDate={};
  tickets.forEach(t=>{ const d=dStr(t.created_at||t.fecha); byDate[d]=(byDate[d]||0)+1; });
  const keys=Object.keys(byDate).sort().slice(-7);
  const mx=Math.max(...keys.map(k=>byDate[k]),1);
  return (
    <div className="page">
      <div className="page-hdr"><div><div className="page-title">DASHBOARD</div><div className="page-sub">Resumen general</div></div></div>
      <div className="stats-grid">
        {[["Tickets totales",total,"en el sistema"],["Tickets usados",used,`${pct}% del total`],["Disponibles",unused,"sin usar"],["Usuarios",users.length,"registrados"]].map(([l,v,s],i)=>(
          <div className="stat-card" key={i} style={{animationDelay:`${i*.06}s`}}>
            <div className="stat-lbl">{l}</div><div className="stat-val">{v}</div><div className="stat-sub">{s}</div>
          </div>
        ))}
      </div>
      {keys.length>0&&<div className="chart-card">
        <div className="chart-title">Tickets por fecha (últimos {keys.length} días)</div>
        <div className="bars">{keys.map(k=>(
          <div className="bar-wrap" key={k}>
            <div className="bar" style={{height:`${(byDate[k]/mx)*70}px`}} title={`${byDate[k]}`}/>
            <div className="bar-lbl">{k.slice(5)}</div>
          </div>
        ))}</div>
      </div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div className="chart-card"><div className="chart-title">Usados vs disponibles</div>
          <div className="bars" style={{height:56}}>
            <div className="bar-wrap"><div className="bar used" style={{height:`${(used/(total||1))*52}px`}}/><div className="bar-lbl">Usados ({used})</div></div>
            <div className="bar-wrap"><div className="bar"      style={{height:`${(unused/(total||1))*52}px`}}/><div className="bar-lbl">Libres ({unused})</div></div>
          </div>
        </div>
        <div className="chart-card"><div className="chart-title">Usuarios</div>
          <div style={{display:"flex",alignItems:"center",gap:20,paddingTop:6}}>
            <div style={{fontFamily:"var(--head)",fontSize:50,color:"var(--gold)",lineHeight:1}}>{users.length}</div>
            <div>
              <div style={{fontSize:11,color:"var(--muted)"}}>Admins: {users.filter(isAdmin).length}</div>
              <div style={{fontSize:11,color:"var(--muted)",marginTop:3}}>Usuarios: {users.filter(u=>!isAdmin(u)).length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tickets Page ───────────────────────────────────────
function Tickets({ tickets, token, onRefresh }) {
  const [search,setSearch]=useState(""); const [filter,setFilter]=useState("all");
  const [busy,setBusy]=useState(null);
  const [showCreate,setShowCreate]=useState(false);
  const [delTarget,setDelTarget]=useState(null);
  const [showQR,setShowQR]=useState(false);

  const markUsed = async id => {
    setBusy(id);
    try { await apiFetch.patch(`/tickets/${id}`,{used:true},token); onRefresh(); }
    catch {} finally { setBusy(null); }
  };

  const filtered=tickets.filter(t=>{
    const q=search.toLowerCase();
    const m=!q||String(t.id).includes(q)||(t.codigo||t.code||"").toLowerCase().includes(q)||(t.nombre||t.name||"").toLowerCase().includes(q);
    const u=isUsed(t);
    return m&&(filter==="all"||(filter==="used"&&u)||(filter==="unused"&&!u));
  });

  return (
    <div className="page">
      {showCreate&&<CreateModal token={token} onClose={()=>setShowCreate(false)} onDone={onRefresh}/>}
      {delTarget&&<DeleteModal ticket={delTarget} token={token} onClose={()=>setDelTarget(null)} onDone={onRefresh}/>}
      {showQR&&<QRModal tickets={tickets} token={token} onClose={()=>setShowQR(false)} onRefresh={onRefresh}/>}

      <div className="page-hdr">
        <div><div className="page-title">TICKETS</div><div className="page-sub">{tickets.length} en total</div></div>
        <div className="hdr-actions">
          <button className="btn btn-ghost btn-sm" onClick={()=>exportCSV(tickets)}><Icon d={I.csv} size={13}/> CSV</button>
          <button className="btn btn-ghost btn-sm" onClick={()=>setShowQR(true)}><Icon d={I.qr} size={13}/> Buscar</button>
          <button className="btn btn-sm" onClick={()=>setShowCreate(true)}><Icon d={I.plus} size={13}/> Crear</button>
        </div>
      </div>

      <div className="toolbar">
        <input placeholder="Buscar por ID, código o nombre..." value={search} onChange={e=>setSearch(e.target.value)}/>
        {["all","used","unused"].map(f=>(
          <button key={f} className={`btn btn-sm ${filter===f?"":"btn-ghost"}`} onClick={()=>setFilter(f)}>
            {f==="all"?"Todos":f==="used"?"Usados":"Disponibles"}
          </button>
        ))}
        <button className="btn btn-ghost btn-sm" onClick={onRefresh}><Icon d={I.refresh} size={13}/></button>
      </div>

      <div className="table-wrap">
        <table className="tbl">
          <thead><tr><th>#</th><th>Código</th><th>Nombre</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {filtered.length===0
              ?<tr><td colSpan={6}><div className="empty">Sin resultados</div></td></tr>
              :filtered.map(t=>(
                <tr key={t.id}>
                  <td style={{color:"var(--muted)"}}>#{t.id}</td>
                  <td style={{letterSpacing:1}}>{t.codigo||t.code||"—"}</td>
                  <td>{t.nombre||t.name||t.descripcion||"—"}</td>
                  <td style={{color:"var(--muted)"}}>{dStr(t.created_at||t.fecha)}</td>
                  <td><span className={`badge ${isUsed(t)?"badge-used":"badge-unused"}`}>{isUsed(t)?"Usado":"Disponible"}</span></td>
                  <td><div className="acts">
                    {!isUsed(t)&&<button className="btn btn-green btn-sm" onClick={()=>markUsed(t.id)} disabled={busy===t.id}>
                      {busy===t.id?<span className="spinner" style={{width:11,height:11}}/>:<Icon d={I.check} size={11}/>} Usar
                    </button>}
                    <button className="btn btn-red btn-sm" onClick={()=>setDelTarget(t)}><Icon d={I.trash} size={11}/></button>
                  </div></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Users Page ─────────────────────────────────────────
function Users({ users, onRefresh }) {
  const [search,setSearch]=useState("");
  const filtered=users.filter(u=>{ const q=search.toLowerCase(); return !q||(u.username||u.nombre||u.email||"").toLowerCase().includes(q); });
  return (
    <div className="page">
      <div className="page-hdr">
        <div><div className="page-title">USUARIOS</div><div className="page-sub">{users.length} registrados</div></div>
        <button className="btn btn-ghost btn-sm" onClick={onRefresh}><Icon d={I.refresh} size={13}/> Actualizar</button>
      </div>
      <div className="toolbar"><input placeholder="Buscar usuario..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
      <div className="table-wrap"><table className="tbl">
        <thead><tr><th>#</th><th>Usuario</th><th>Email</th><th>Rol</th><th>Registrado</th></tr></thead>
        <tbody>
          {filtered.length===0
            ?<tr><td colSpan={5}><div className="empty">Sin resultados</div></td></tr>
            :filtered.map(u=>(
              <tr key={u.id}>
                <td style={{color:"var(--muted)"}}>#{u.id}</td>
                <td>{u.username||u.nombre||"—"}</td>
                <td style={{color:"var(--muted)"}}>{u.email||"—"}</td>
                <td><span className={`badge ${isAdmin(u)?"badge-admin":"badge-user"}`}>{isAdmin(u)?"Admin":"Usuario"}</span></td>
                <td style={{color:"var(--muted)"}}>{dStr(u.created_at||u.fecha)}</td>
              </tr>
            ))
          }
        </tbody>
      </table></div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────
export default function App() {
  const [token,setToken]=useState(()=>localStorage.getItem("chess_tk")||"");
  const [tab,setTab]=useState("dashboard");
  const [tickets,setTickets]=useState([]); const [users,setUsers]=useState([]);
  const [loading,setLoading]=useState(false);
  const logout=()=>{ localStorage.removeItem("chess_tk"); setToken(""); };
  const fetchAll=useCallback(async()=>{
    if(!token) return; setLoading(true);
    try {
      const [t,u]=await Promise.all([
        apiFetch.get("/tickets/",token).catch(()=>apiFetch.get("/tickets",token).catch(()=>[])),
        apiFetch.get("/users/",token).catch(()=>apiFetch.get("/users",token).catch(()=>[])),
      ]);
      setTickets(norm(t)); setUsers(norm(u));
    } catch {} finally { setLoading(false); }
  },[token]);
  useEffect(()=>{ if(token){ localStorage.setItem("chess_tk",token); fetchAll(); } },[token,fetchAll]);

  if(!token) return(<><style>{css}</style><Login onLogin={setToken}/></>);

  const nav=[{id:"dashboard",l:"Dashboard",i:I.chart},{id:"tickets",l:"Tickets",i:I.ticket},{id:"users",l:"Usuarios",i:I.users}];
  return (
    <><style>{css}</style>
    <div className="layout">
      <aside className="sidebar">
        <div className="logo"><div style={{display:"flex",alignItems:"center",gap:8}}>
          <Icon d={I.chess} size={20}/><div><h1>CHESS</h1><p>ADMIN PANEL</p></div>
        </div></div>
        <nav className="nav">{nav.map(n=>(
          <div key={n.id} className={`nav-item ${tab===n.id?"active":""}`} onClick={()=>setTab(n.id)}>
            <Icon d={n.i} size={14}/>{n.l}
          </div>
        ))}</nav>
        <div className="sidebar-foot">
          {loading&&<div style={{fontSize:10,color:"var(--muted)",marginBottom:8,display:"flex",gap:6,alignItems:"center"}}><span className="spinner"/> Actualizando...</div>}
          <button className="btn btn-ghost btn-sm" style={{width:"100%",justifyContent:"center"}} onClick={logout}><Icon d={I.logout} size={13}/> Salir</button>
        </div>
      </aside>
      <main className="main chess-bg">
        {tab==="dashboard"&&<Dashboard tickets={tickets} users={users}/>}
        {tab==="tickets"  &&<Tickets   tickets={tickets} token={token} onRefresh={fetchAll}/>}
        {tab==="users"    &&<Users     users={users} onRefresh={fetchAll}/>}
      </main>
    </div></>
  );
}
