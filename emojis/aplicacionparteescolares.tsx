import { useState, useEffect } from "react";

// ── Paleta de colores ──────────────────────────────────────────
const C = {
  cream:   "#F4F0E4",
  teal:    "#44A194",
  blue:    "#537D96",
  salmon:  "#EC8F8D",
  dark:    "#2C4A52",
  white:   "#FFFFFF",
  gray:    "#64748b",
  light:   "#F8F6F0",
};

// ── Datos demo ────────────────────────────────────────────────
const DEMO_ALUMNOS = [
  { id:1, nombre:"Lucía Martínez García",   curso:"1º ESO A", tutor:"Carmen López",  email:"familia.martinez@email.com", telefono:"612345678" },
  { id:2, nombre:"Marcos Fernández Ruiz",   curso:"1º ESO A", tutor:"Carmen López",  email:"familia.fernandez@email.com",telefono:"623456789" },
  { id:3, nombre:"Sara González Pérez",     curso:"2º ESO B", tutor:"Pedro Sánchez", email:"familia.gonzalez@email.com", telefono:"634567890" },
  { id:4, nombre:"Alejandro Torres Díaz",   curso:"2º ESO B", tutor:"Pedro Sánchez", email:"familia.torres@email.com",   telefono:"645678901" },
  { id:5, nombre:"Paula Ramírez Moreno",    curso:"3º ESO A", tutor:"Ana Jiménez",   email:"familia.ramirez@email.com",  telefono:"656789012" },
  { id:6, nombre:"Diego Sánchez Blanco",    curso:"3º ESO A", tutor:"Ana Jiménez",   email:"familia.sanchez@email.com",  telefono:"667890123" },
  { id:7, nombre:"Elena Romero Castro",     curso:"4º ESO C", tutor:"Luis García",   email:"familia.romero@email.com",   telefono:"678901234" },
  { id:8, nombre:"Adrián López Vega",       curso:"4º ESO C", tutor:"Luis García",   email:"familia.lopez@email.com",    telefono:"689012345" },
];

const DEMO_PROFESORES = [
  "Carmen López","Pedro Sánchez","Ana Jiménez","Luis García",
  "Carlos Moreno","María Fernández","Jorge Ruiz","Laura Torres",
  "Sofía Martín","Pablo Díaz","Elena Vega","Roberto Castro",
];

const GRAVEDAD = [
  { id:"leve",      label:"🟡 Leve",      color:C.teal,   bg:"#E8F5F3", desc:"Reglamento de Centro" },
  { id:"grave",     label:"🟠 Grave",     color:"#d97706", bg:"#fef3c7", desc:"Normativa CAM" },
  { id:"muy_grave", label:"🔴 Muy Grave", color:C.salmon, bg:"#FDF0EF", desc:"Normativa CAM (nivel superior)" },
];

const TIPOS   = ["Comportamiento","Ausencia","Académico","Otro"];
const HORAS   = ["1ª hora","2ª hora","3ª hora","4ª hora","5ª hora","6ª hora"];
const MOTIVOS = ["Enfermedad","Asunto personal","Formación","Baja médica","Otro"];

const fmt  = d => new Date(d).toLocaleString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
const fmtD = d => new Date(d).toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric"});
const todayStr = () => new Date().toISOString().split("T")[0];
const weekKey  = d => { const dt=new Date(d),day=dt.getDay(),diff=dt.getDate()-day+(day===0?-6:1); return new Date(new Date(d).setDate(diff)).toISOString().split("T")[0]; };
const gObj     = g => GRAVEDAD.find(x=>x.id===g);

async function sGet(k){ try{ const r=await window.storage.get(k); return r?JSON.parse(r.value):null; }catch{ return null; } }
async function sSet(k,v){ try{ await window.storage.set(k,JSON.stringify(v)); }catch(e){ console.error(e); } }

// ── Componentes UI ────────────────────────────────────────────
const Btn = ({onClick,disabled,children,color=C.dark,style={}}) => (
  <button onClick={onClick} disabled={disabled}
    style={{background:disabled?"#94a3b8":color,color:"#fff",border:"none",borderRadius:10,padding:"12px 20px",cursor:disabled?"not-allowed":"pointer",fontWeight:700,fontSize:14,...style}}>
    {children}
  </button>
);

const Card = ({children,style={}}) => (
  <div style={{background:C.white,borderRadius:14,padding:20,boxShadow:"0 2px 12px rgba(0,0,0,0.07)",marginBottom:14,...style}}>{children}</div>
);

const Badge = ({g}) => {
  const gv=gObj(g);
  return <span style={{background:gv.bg,color:gv.color,borderRadius:8,padding:"3px 10px",fontSize:12,fontWeight:700,whiteSpace:"nowrap"}}>{gv.label}</span>;
};

function CopyBtn({getText,label="📋 Copiar texto"}){
  const [ok,setOk]=useState(false);
  function copy(){ const t=getText(); navigator.clipboard.writeText(t).then(()=>{setOk(true);setTimeout(()=>setOk(false),2500)}).catch(()=>{const ta=document.createElement("textarea");ta.value=t;ta.style.cssText="position:fixed;opacity:0";document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);setOk(true);setTimeout(()=>setOk(false),2500);}); }
  return <button onClick={copy} style={{background:ok?C.teal:C.cream,color:ok?C.white:C.dark,border:`1px solid ${ok?C.teal:"#ccc"}`,borderRadius:8,padding:"8px 16px",cursor:"pointer",fontWeight:700,fontSize:13,transition:"all .2s"}}>{ok?"✅ ¡Copiado!":label}</button>;
}

// ── Vista impresión parte ─────────────────────────────────────
function PrintParte({parte,onClose}){
  const g=gObj(parte.gravedad);
  const texto=`GALVÁNDESK — PARTE DE INCIDENCIA\nIES Enrique Tierno Galván · Madrid\n${"─".repeat(50)}\nGravedad: ${g.label} — ${g.desc}\n\nAlumno/a: ${parte.alumno}\nCurso / Aula: ${parte.curso}\nTutor de grupo: ${parte.tutor}\nTipo de parte: ${parte.tipo}\nHora: ${parte.hora||"No especificada"}\nFecha y hora: ${fmt(parte.ts)}\nProfesor responsable: ${parte.profesor}\n\nDescripción:\n${parte.descripcion}\n\nContacto familia:\nEmail: ${parte.email}\nTeléfono: ${parte.telefono}\n${"─".repeat(50)}\nRef: PARTE-${parte.id}`;
  return (
    <div style={{position:"fixed",inset:0,background:"#fff",zIndex:1000,overflowY:"auto",fontFamily:"Arial,sans-serif"}}>
      <div className="no-print" style={{background:C.dark,color:"#fff",padding:"12px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
        <span style={{fontWeight:700,fontSize:14}}>GalvánDesk — Vista previa · Ctrl+P para PDF</span>
        <div style={{display:"flex",gap:8}}>
          <CopyBtn getText={()=>texto}/>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",borderRadius:8,padding:"8px 18px",cursor:"pointer",fontWeight:700}}>✕ Cerrar</button>
        </div>
      </div>
      <div style={{maxWidth:680,margin:"40px auto",padding:"0 24px 60px"}}>
        <div style={{textAlign:"center",borderBottom:`3px solid ${C.teal}`,paddingBottom:16,marginBottom:24}}>
          <div style={{fontSize:11,color:C.gray,marginBottom:4,letterSpacing:1}}>IES ENRIQUE TIERNO GALVÁN · MADRID</div>
          <div style={{fontSize:22,fontWeight:800,color:C.dark}}>GalvánDesk — Parte de Incidencia</div>
          <div style={{marginTop:10}}><span style={{display:"inline-block",padding:"6px 20px",borderRadius:8,fontWeight:700,fontSize:15,background:g.bg,color:g.color,border:`2px solid ${g.color}`}}>{g.label} — {g.desc}</span></div>
        </div>
        {[["Alumno/a",parte.alumno],["Curso / Aula",parte.curso],["Tutor de grupo",parte.tutor],["Tipo de parte",parte.tipo],["Hora de clase",parte.hora||"No especificada"],["Fecha y hora",fmt(parte.ts)],["Profesor responsable",parte.profesor]].map(([k,v])=>(
          <div key={k} style={{display:"flex",padding:"10px 0",borderBottom:"1px solid #eee",fontSize:14}}>
            <span style={{fontWeight:700,color:"#555",minWidth:220}}>{k}</span><span>{v}</span>
          </div>
        ))}
        {parte.esGrupal&&<div style={{marginTop:8,background:"#e8f5f3",borderRadius:8,padding:"8px 14px",fontSize:13,color:C.teal,fontWeight:600}}>📢 Parte generado como parte de grupo</div>}
        <div style={{marginTop:20}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:8}}>Descripción del incidente:</div>
          <div style={{background:C.light,padding:16,borderRadius:8,fontSize:14,lineHeight:1.7,border:`1px solid #e5e7eb`}}>{parte.descripcion}</div>
        </div>
        <div style={{background:"#EEF5F8",padding:16,borderRadius:8,marginTop:20,fontSize:14}}>
          <div style={{fontWeight:700,marginBottom:8,color:C.blue}}>📬 Contacto familia</div>
          <div>📧 {parte.email}</div><div style={{marginTop:4}}>📱 {parte.telefono}</div>
        </div>
        <div style={{display:"flex",gap:40,marginTop:50}}>
          {["Firma del Profesor","Firma Jefatura de Estudios","Firma del Alumno/a"].map(f=>(
            <div key={f} style={{flex:1,borderTop:`2px solid ${C.dark}`,paddingTop:8,textAlign:"center",fontSize:12,color:"#555"}}>{f}</div>
          ))}
        </div>
        <div style={{marginTop:32,textAlign:"center",color:"#aaa",fontSize:11,borderTop:"1px dashed #ccc",paddingTop:12}}>GalvánDesk · IES Enrique Tierno Galván · Madrid · Ref: PARTE-{parte.id}</div>
      </div>
      <style>{`@media print{.no-print{display:none!important}}`}</style>
    </div>
  );
}

// ── Vista impresión informe ───────────────────────────────────
function PrintInforme({partes,filtros,onClose}){
  const fecha=new Date().toLocaleDateString("es-ES",{day:"2-digit",month:"long",year:"numeric"});
  const res={leve:partes.filter(p=>p.gravedad==="leve").length,grave:partes.filter(p=>p.gravedad==="grave").length,muy_grave:partes.filter(p=>p.gravedad==="muy_grave").length};
  const filtrosTexto=[filtros.filtCurso&&`Curso: ${filtros.filtCurso}`,filtros.filtGravedad&&GRAVEDAD.find(g=>g.id===filtros.filtGravedad)?.label,filtros.filtFechaDesde&&`Desde: ${fmtD(filtros.filtFechaDesde)}`,filtros.filtFechaHasta&&`Hasta: ${fmtD(filtros.filtFechaHasta)}`].filter(Boolean).join(" · ");
  const textoPlano=`GALVÁNDESK — INFORME DE PARTES\nIES Enrique Tierno Galván · Madrid\nGenerado el ${fecha}\n${filtrosTexto?`Filtros: ${filtrosTexto}\n`:""}\nRESUMEN: Total: ${partes.length} | Leves: ${res.leve} | Graves: ${res.grave} | Muy Graves: ${res.muy_grave}\n\n${"─".repeat(90)}\n${partes.map((p,i)=>`${i+1}. ${fmt(p.ts)} | ${p.hora||"-"} | ${p.alumno} | ${p.curso} | ${p.tipo} | ${p.gravedad.toUpperCase()} | ${p.profesor}\n   ${p.descripcion}`).join("\n")}\n${"─".repeat(90)}`;
  return (
    <div style={{position:"fixed",inset:0,background:"#fff",zIndex:1000,overflowY:"auto",fontFamily:"Arial,sans-serif"}}>
      <div className="no-print" style={{background:C.dark,color:"#fff",padding:"12px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
        <span style={{fontWeight:700,fontSize:14}}>GalvánDesk — Informe · Ctrl+P para PDF</span>
        <div style={{display:"flex",gap:8}}>
          <CopyBtn getText={()=>textoPlano}/>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",borderRadius:8,padding:"8px 18px",cursor:"pointer",fontWeight:700}}>✕ Cerrar</button>
        </div>
      </div>
      <div style={{maxWidth:900,margin:"30px auto",padding:"0 24px 60px"}}>
        <div style={{textAlign:"center",borderBottom:`3px solid ${C.teal}`,paddingBottom:16,marginBottom:20}}>
          <div style={{fontSize:11,color:C.gray,letterSpacing:1,marginBottom:4}}>IES ENRIQUE TIERNO GALVÁN · MADRID</div>
          <div style={{fontSize:22,fontWeight:800,color:C.dark}}>GalvánDesk — Informe de Partes</div>
          <div style={{color:C.gray,fontSize:13,marginTop:4}}>Generado el {fecha} · Jefatura de Estudios</div>
          {filtrosTexto&&<div style={{color:"#888",fontSize:12,marginTop:4}}>Filtros: {filtrosTexto}</div>}
        </div>
        <div style={{display:"flex",gap:14,marginBottom:24,justifyContent:"center",flexWrap:"wrap"}}>
          {[{label:"Total",value:partes.length,color:C.dark},{label:"🟡 Leves",value:res.leve,color:C.teal},{label:"🟠 Graves",value:res.grave,color:"#d97706"},{label:"🔴 Muy Graves",value:res.muy_grave,color:C.salmon}].map(s=>(
            <div key={s.label} style={{textAlign:"center",padding:"12px 24px",borderRadius:10,background:C.light,borderTop:`3px solid ${s.color}`,minWidth:100}}>
              <div style={{fontSize:28,fontWeight:800,color:s.color}}>{s.value}</div>
              <div style={{fontSize:12,color:C.gray}}>{s.label}</div>
            </div>
          ))}
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{background:C.dark,color:"#fff"}}>{["Fecha","Hora","Alumno","Curso","Tipo","Gravedad","Profesor","Descripción"].map(h=><th key={h} style={{padding:"9px 8px",textAlign:"left"}}>{h}</th>)}</tr></thead>
          <tbody>{partes.map((p,i)=>{ const g=gObj(p.gravedad); return (
            <tr key={p.id} style={{background:i%2===0?"#fff":C.light}}>
              <td style={{padding:"7px 8px",borderBottom:"1px solid #eee",whiteSpace:"nowrap"}}>{fmt(p.ts)}</td>
              <td style={{padding:"7px 8px",borderBottom:"1px solid #eee",whiteSpace:"nowrap"}}>{p.hora||"-"}</td>
              <td style={{padding:"7px 8px",borderBottom:"1px solid #eee",fontWeight:600}}>{p.alumno}{p.esGrupal?<span style={{marginLeft:4,fontSize:10,color:C.teal}}>●grupal</span>:null}</td>
              <td style={{padding:"7px 8px",borderBottom:"1px solid #eee"}}>{p.curso}</td>
              <td style={{padding:"7px 8px",borderBottom:"1px solid #eee"}}>{p.tipo}</td>
              <td style={{padding:"7px 8px",borderBottom:"1px solid #eee"}}><span style={{background:g.bg,color:g.color,padding:"2px 8px",borderRadius:6,fontWeight:700,fontSize:11}}>{g.label}</span></td>
              <td style={{padding:"7px 8px",borderBottom:"1px solid #eee"}}>{p.profesor}</td>
              <td style={{padding:"7px 8px",borderBottom:"1px solid #eee"}}>{p.descripcion.slice(0,60)}{p.descripcion.length>60?"...":""}</td>
            </tr>
          );})}
          </tbody>
        </table>
        <div style={{marginTop:24,textAlign:"center",color:"#aaa",fontSize:11,borderTop:"1px dashed #ccc",paddingTop:10}}>GalvánDesk · IES Enrique Tierno Galván · Madrid · {fecha}</div>
      </div>
      <style>{`@media print{.no-print{display:none!important}}`}</style>
    </div>
  );
}

// ── Tarjeta parte ─────────────────────────────────────────────
function ParteCard({parte,onVer,onPrint}){
  const g=gObj(parte.gravedad);
  return (
    <div style={{background:C.white,borderRadius:12,padding:16,marginBottom:12,boxShadow:"0 2px 10px rgba(0,0,0,0.06)",borderLeft:`4px solid ${g.color}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:15,color:C.dark}}>{parte.alumno} {parte.esGrupal&&<span style={{fontSize:11,background:"#e8f5f3",color:C.teal,borderRadius:6,padding:"2px 8px",marginLeft:4}}>grupal</span>}</div>
          <div style={{fontSize:12,color:C.gray,marginTop:2}}>{parte.curso} · {parte.tipo} · {parte.hora||""} · 📅 {fmt(parte.ts)} · {parte.profesor}</div>
          <div style={{fontSize:13,marginTop:6,color:"#374151"}}>{parte.descripcion.slice(0,100)}{parte.descripcion.length>100?"...":""}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,marginLeft:12}}>
          <Badge g={parte.gravedad}/>
          <div style={{display:"flex",gap:6}}>
            <button onClick={onVer} style={{background:"#EEF5F8",color:C.blue,border:"none",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:600}}>👁 Ver</button>
            <button onClick={onPrint} style={{background:"#FDF0EF",color:C.salmon,border:"none",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:600}}>🖨️ PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────
export default function App(){
  const [perfil,setPerfil]   = useState(null);
  const [tab,setTab]         = useState("partes");
  const [alumnos,setAlumnos] = useState(DEMO_ALUMNOS);
  const [profesores,setProfesores] = useState(DEMO_PROFESORES);
  const [partes,setPartes]   = useState([]);
  const [banos,setBanos]     = useState([]);
  const [alertas,setAlertas] = useState([]);
  const [guardias,setGuardias] = useState([]);
  const [loading,setLoading] = useState(true);

  const [showParte,setShowParte]       = useState(null);
  const [showAlerta,setShowAlerta]     = useState(null);
  const [printParte,setPrintParte]     = useState(null);
  const [printInforme,setPrintInforme] = useState(false);

  // Filtros
  const [filtCurso,setFiltCurso]           = useState("");
  const [filtAlumno,setFiltAlumno]         = useState("");
  const [filtGravedad,setFiltGravedad]     = useState("");
  const [filtFechaDesde,setFiltFechaDesde] = useState("");
  const [filtFechaHasta,setFiltFechaHasta] = useState("");

  // Form parte individual
  const [fAlumno,setFAlumno]     = useState("");
  const [fBusqueda,setFBusqueda] = useState("");
  const [fTipo,setFTipo]         = useState("Comportamiento");
  const [fGravedad,setFGravedad] = useState("leve");
  const [fDesc,setFDesc]         = useState("");
  const [fHora,setFHora]         = useState("1ª hora");
  const [fProfesor,setFProfesor] = useState(DEMO_PROFESORES[4]);
  const [parteGenerado,setParteGenerado] = useState(null);

  // Form parte grupo
  const [gCurso,setGCurso]       = useState("");
  const [gTipo,setGTipo]         = useState("Comportamiento");
  const [gGravedad,setGGravedad] = useState("leve");
  const [gDesc,setGDesc]         = useState("");
  const [gHora,setGHora]         = useState("1ª hora");
  const [gExcluidos,setGExcluidos] = useState([]);
  const [grupoGenerado,setGrupoGenerado] = useState(null);

  // Form baño
  const [bAlumno,setBAlumno]     = useState("");
  const [bBusqueda,setBBusqueda] = useState("");

  // Form guardia
  const [guProfesorAusente,setGuProfesorAusente] = useState("");
  const [guHora,setGuHora]           = useState("1ª hora");
  const [guCurso,setGuCurso]         = useState("");
  const [guMateria,setGuMateria]     = useState("");
  const [guProfesorGuardia,setGuProfesorGuardia] = useState("");
  const [guMotivo,setGuMotivo]       = useState("Enfermedad");
  const [guMaterial,setGuMaterial]   = useState("");
  const [guardiaGenerada,setGuardiaGenerada] = useState(null);

  // Admin
  const [nuevoAlumno,setNuevoAlumno]   = useState({nombre:"",curso:"",tutor:"",email:"",telefono:""});
  const [nuevoProfesor,setNuevoProfesor] = useState("");

  useEffect(()=>{
    async function load(){
      setLoading(true);
      const p=await sGet("partes");    if(p) setPartes(p);
      const b=await sGet("banos");     if(b) setBanos(b);
      const a=await sGet("alertas");   if(a) setAlertas(a);
      const al=await sGet("alumnos");  if(al) setAlumnos(al);
      const pr=await sGet("profesores"); if(pr) setProfesores(pr);
      const g=await sGet("guardias");  if(g) setGuardias(g);
      setLoading(false);
    }
    load();
  },[]);

  useEffect(()=>{ if(!loading) sSet("partes",partes); },[partes,loading]);
  useEffect(()=>{ if(!loading) sSet("banos",banos); },[banos,loading]);
  useEffect(()=>{ if(!loading) sSet("alertas",alertas); },[alertas,loading]);
  useEffect(()=>{ if(!loading) sSet("alumnos",alumnos); },[alumnos,loading]);
  useEffect(()=>{ if(!loading) sSet("profesores",profesores); },[profesores,loading]);
  useEffect(()=>{ if(!loading) sSet("guardias",guardias); },[guardias,loading]);

  const cursos = [...new Set(alumnos.map(a=>a.curso))].sort();
  const alumnoSel = alumnos.find(a=>a.id===parseInt(fAlumno));
  const banoActivos = banos.filter(b=>!b.regreso);
  const alertasNoLeidas = alertas.filter(a=>!a.leida).length;
  const partesDeAlumno = id => partes.filter(p=>p.alumnoId===id);
  const partesLeves    = id => partesDeAlumno(id).filter(p=>p.gravedad==="leve").length;
  const partesFiltrados = partes.filter(p=>{
    if(filtCurso && p.curso!==filtCurso) return false;
    if(filtAlumno && p.alumnoId!==parseInt(filtAlumno)) return false;
    if(filtGravedad && p.gravedad!==filtGravedad) return false;
    if(filtFechaDesde && p.ts.split("T")[0]<filtFechaDesde) return false;
    if(filtFechaHasta && p.ts.split("T")[0]>filtFechaHasta) return false;
    return true;
  });

  function salir(){
    setPerfil(null); setTab("partes");
    setShowParte(null); setPrintParte(null); setPrintInforme(false); setShowAlerta(null);
    setFAlumno(""); setFBusqueda(""); setFDesc(""); setParteGenerado(null);
    setGCurso(""); setGDesc(""); setGExcluidos([]); setGrupoGenerado(null);
    setBAlumno(""); setBBusqueda("");
    setGuProfesorAusente(""); setGuMateria(""); setGuProfesorGuardia(""); setGuMaterial(""); setGuardiaGenerada(null);
    setFiltCurso(""); setFiltAlumno(""); setFiltGravedad(""); setFiltFechaDesde(""); setFiltFechaHasta("");
  }

  function generarAlertasParte(parte, partesActuales){
    const nuevasAlertas=[];
    const total=partesActuales.filter(p=>p.alumnoId===parte.alumnoId).length+1;
    const leves=partesActuales.filter(p=>p.alumnoId===parte.alumnoId&&p.gravedad==="leve").length+(parte.gravedad==="leve"?1:0);
    const hora=new Date(parte.ts).getHours();
    const fueraHorario=hora<8||hora>=15;
    if(leves===3) nuevasAlertas.push({id:Date.now()+1,tipo:"acumulacion_leves",alumno:parte.alumno,curso:parte.curso,msg:`Acumulación de 3 partes leves — Considerar sanción`,ts:parte.ts,leida:false});
    if(total===3) nuevasAlertas.push({id:Date.now()+2,tipo:"total_partes",alumno:parte.alumno,curso:parte.curso,msg:`Ha alcanzado 3 partes en total`,ts:parte.ts,leida:false});
    if(fueraHorario) nuevasAlertas.push({id:Date.now()+3,tipo:"fuera_horario",alumno:parte.alumno,curso:parte.curso,msg:`Parte generado fuera del horario habitual (${new Date(parte.ts).toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"})})`,ts:parte.ts,leida:false});
    if(nuevasAlertas.length>0){ setAlertas(prev=>[...nuevasAlertas,...prev]); setShowAlerta(nuevasAlertas[0]); }
  }

  function crearParte(){
    if(!fAlumno||!fDesc.trim()) return;
    const al=alumnos.find(a=>a.id===parseInt(fAlumno));
    const p={id:Date.now(),alumnoId:al.id,alumno:al.nombre,curso:al.curso,tutor:al.tutor,email:al.email,telefono:al.telefono,tipo:fTipo,gravedad:fGravedad,descripcion:fDesc,profesor:fProfesor,hora:fHora,ts:new Date().toISOString()};
    generarAlertasParte(p,partes);
    setPartes(prev=>[p,...prev]); setParteGenerado(p);
    setFAlumno(""); setFBusqueda(""); setFDesc(""); setFTipo("Comportamiento"); setFGravedad("leve");
  }

  function crearParteGrupo(){
    if(!gCurso||!gDesc.trim()) return;
    const grupo=alumnos.filter(a=>a.curso===gCurso&&!gExcluidos.includes(a.id));
    const ts=new Date().toISOString();
    const nuevos=grupo.map(al=>({id:Date.now()+al.id,alumnoId:al.id,alumno:al.nombre,curso:al.curso,tutor:al.tutor,email:al.email,telefono:al.telefono,tipo:gTipo,gravedad:gGravedad,descripcion:gDesc,profesor:fProfesor,hora:gHora,ts,esGrupal:true}));
    const partesTemp=[...partes]; nuevos.forEach(p=>generarAlertasParte(p,partesTemp));
    setPartes(prev=>[...nuevos,...prev]);
    setGrupoGenerado({curso:gCurso,total:nuevos.length,ts});
    setGDesc(""); setGExcluidos([]); setGTipo("Comportamiento"); setGGravedad("leve");
  }

  function crearGuardia(){
    if(!guProfesorAusente||!guCurso||!guProfesorGuardia) return;
    const g={id:Date.now(),profesorAusente:guProfesorAusente,hora:guHora,curso:guCurso,materia:guMateria,profesorGuardia:guProfesorGuardia,motivo:guMotivo,material:guMaterial,ts:new Date().toISOString(),fecha:todayStr()};
    setGuardias(prev=>[g,...prev]); setGuardiaGenerada(g);
    setGuProfesorAusente(""); setGuMateria(""); setGuProfesorGuardia(""); setGuMaterial("");
  }

  function checkAbusoBano(alumnoId){
    const al=alumnos.find(a=>a.id===alumnoId);
    const hoy=todayStr(),sem=weekKey(new Date());
    const sal=banos.filter(b=>b.alumnoId===alumnoId);
    const hoyC=sal.filter(b=>b.fecha===hoy).length+1;
    const semC=sal.filter(b=>weekKey(b.fecha)===sem).length+1;
    const msgs=[];
    if(hoyC>2) msgs.push(`Ha ido al baño ${hoyC} veces hoy`);
    if(semC>3) msgs.push(`Ha ido al baño ${semC} veces esta semana`);
    if(msgs.length>0){ const al2={id:Date.now(),tipo:"bano",alumno:al.nombre,curso:al.curso,msg:msgs.join(" · "),msgs,ts:new Date().toISOString(),leida:false}; setAlertas(prev=>[al2,...prev]); setShowAlerta(al2); }
  }

  function registrarSalida(){
    if(!bAlumno) return;
    const id=parseInt(bAlumno); checkAbusoBano(id);
    const al=alumnos.find(a=>a.id===id);
    setBanos(prev=>[{id:Date.now(),alumnoId:id,alumno:al.nombre,curso:al.curso,fecha:todayStr(),salida:new Date().toISOString(),regreso:null},...prev]);
    setBAlumno(""); setBBusqueda("");
  }

  const inpStyle = {width:"100%",padding:"10px 14px",borderRadius:8,border:`1px solid #d1d5db`,fontSize:14,boxSizing:"border-box",background:C.white};
  const selStyle = {...inpStyle};
  const labelStyle = {display:"block",fontWeight:600,marginBottom:6,color:C.dark,fontSize:13};

  if(loading) return <div style={{minHeight:"100vh",background:`linear-gradient(135deg,${C.dark},${C.blue})`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif"}}><div style={{color:"#fff",textAlign:"center"}}><div style={{fontSize:48}}>🏫</div><div style={{fontSize:18,fontWeight:600,marginTop:12}}>Cargando GalvánDesk...</div></div></div>;
  if(printParte) return <PrintParte parte={printParte} onClose={()=>setPrintParte(null)}/>;
  if(printInforme) return <PrintInforme partes={partesFiltrados} filtros={{filtCurso,filtAlumno,filtGravedad,filtFechaDesde,filtFechaHasta}} onClose={()=>setPrintInforme(false)}/>;

  if(!perfil) return (
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg,${C.dark},${C.blue})`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif"}}>
      <div style={{background:C.white,borderRadius:20,padding:40,maxWidth:420,width:"90%",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <div style={{fontSize:52,marginBottom:4}}>🏫</div>
        <div style={{fontSize:11,color:C.gray,letterSpacing:2,marginBottom:4}}>IES ENRIQUE TIERNO GALVÁN · MADRID</div>
        <h1 style={{color:C.dark,margin:"0 0 4px",fontSize:28}}>GalvánDesk</h1>
        <p style={{color:C.gray,marginBottom:32,fontSize:13}}>Sistema de Gestión de Incidencias</p>
        {[{id:"profesor",label:"👨‍🏫 Profesor"},{id:"jefatura",label:"👔 Jefatura"},{id:"admin",label:"⚙️ Administración"}].map(p=>(
          <button key={p.id} onClick={()=>{setPerfil(p);setTab(p.id==="jefatura"?"dashboard":p.id==="admin"?"admin_panel":"partes");}}
            style={{display:"block",width:"100%",padding:"14px 20px",marginBottom:12,background:C.cream,border:`2px solid ${C.teal}`,borderRadius:12,cursor:"pointer",fontSize:16,fontWeight:700,color:C.dark,transition:"all .2s"}}
            onMouseOver={e=>{e.currentTarget.style.background=C.teal;e.currentTarget.style.color="#fff";}}
            onMouseOut={e=>{e.currentTarget.style.background=C.cream;e.currentTarget.style.color=C.dark;}}>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );

  const tabs = perfil.id==="profesor"
    ? [{id:"partes",label:"📋 Nuevo Parte"},{id:"parte_grupo",label:"👥 Parte de Grupo"},{id:"bano",label:"🚻 Baños"},{id:"guardias_prof",label:"🔄 Guardias"},{id:"historial",label:"📁 Mis Partes"}]
    : perfil.id==="jefatura"
    ? [{id:"dashboard",label:"📊 Dashboard"},{id:"por_curso",label:"🏫 Por Curso"},{id:"por_alumno",label:"👤 Por Alumno"},{id:"partes_todos",label:"📋 Partes"},{id:"guardias_jef",label:"🔄 Guardias"},{id:"bano_live",label:"🚻 Baños"},{id:"alertas",label:`🔔${alertasNoLeidas>0?` (${alertasNoLeidas})`:""} Alertas`},{id:"informe",label:"📤 Informe"}]
    : [{id:"admin_panel",label:"👥 Alumnos"},{id:"admin_profesores",label:"👨‍🏫 Profesores"}];

  return (
    <div style={{minHeight:"100vh",background:C.cream,fontFamily:"system-ui,sans-serif"}}>
      {/* Header */}
      <div style={{background:`linear-gradient(90deg,${C.dark},${C.blue})`,color:"#fff",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:26}}>🏫</span>
          <div>
            <div style={{fontWeight:800,fontSize:17,letterSpacing:.5}}>GalvánDesk</div>
            <div style={{fontSize:11,opacity:.8}}>IES Enrique Tierno Galván · {perfil.label}</div>
          </div>
        </div>
        <button onClick={salir} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",color:"#fff",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:13,fontWeight:600}}>Salir</button>
      </div>

      {/* Tabs */}
      <div style={{background:C.white,borderBottom:`2px solid ${C.cream}`,display:"flex",overflowX:"auto",boxShadow:"0 2px 6px rgba(0,0,0,0.05)"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:"13px 16px",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:600,color:tab===t.id?C.teal:C.gray,borderBottom:tab===t.id?`3px solid ${C.teal}`:"3px solid transparent",whiteSpace:"nowrap",transition:"color .2s"}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{maxWidth:960,margin:"0 auto",padding:20}}>

        {/* Alerta flotante */}
        {showAlerta&&(
          <div style={{background:"#FFF8E8",border:`2px solid ${C.salmon}`,borderRadius:12,padding:16,marginBottom:16,position:"relative",boxShadow:"0 4px 12px rgba(236,143,141,0.2)"}}>
            <strong style={{color:C.dark}}>⚠️ {showAlerta.alumno} — {showAlerta.curso}</strong>
            <p style={{margin:"4px 0 0",fontSize:13,color:"#555"}}>{showAlerta.msg||showAlerta.msgs?.join(" · ")}</p>
            <button onClick={()=>setShowAlerta(null)} style={{position:"absolute",top:10,right:10,background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.gray}}>✕</button>
          </div>
        )}

        {/* ══ NUEVO PARTE ══ */}
        {tab==="partes"&&(
          <div>
            <h2 style={{color:C.dark,marginTop:0}}>📋 Nuevo Parte de Incidencia</h2>
            {parteGenerado&&(
              <Card style={{background:"#E8F5F3",border:`2px solid ${C.teal}`,marginBottom:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <strong style={{color:C.teal}}>✅ Parte generado · {fmt(parteGenerado.ts)}</strong>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>setShowParte(parteGenerado)} style={{background:C.blue,color:"#fff",border:"none",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:13,fontWeight:600}}>👁 Ver</button>
                    <button onClick={()=>setPrintParte(parteGenerado)} style={{background:C.salmon,color:"#fff",border:"none",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:13,fontWeight:600}}>🖨️ PDF</button>
                  </div>
                </div>
              </Card>
            )}
            <Card>
              <label style={labelStyle}>Buscar alumno</label>
              <input value={fBusqueda} onChange={e=>{setFBusqueda(e.target.value);setFAlumno("");}} placeholder="Nombre o curso..." style={inpStyle}/>
              {fBusqueda&&!fAlumno&&(
                <div style={{border:"1px solid #e5e7eb",borderRadius:8,marginTop:4,background:C.white,maxHeight:180,overflowY:"auto",marginBottom:8}}>
                  {alumnos.filter(a=>a.nombre.toLowerCase().includes(fBusqueda.toLowerCase())||a.curso.toLowerCase().includes(fBusqueda.toLowerCase())).map(a=>(
                    <div key={a.id} onClick={()=>{setFAlumno(a.id);setFBusqueda(a.nombre);}}
                      style={{padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid #f3f4f6",fontSize:13}}
                      onMouseOver={e=>e.currentTarget.style.background=C.cream} onMouseOut={e=>e.currentTarget.style.background=C.white}>
                      <strong>{a.nombre}</strong> — {a.curso}
                    </div>
                  ))}
                </div>
              )}
              {alumnoSel&&(
                <div style={{background:C.cream,borderRadius:8,padding:12,margin:"8px 0 16px",fontSize:13,border:`1px solid #ddd`}}>
                  <div><strong>Curso:</strong> {alumnoSel.curso} | <strong>Tutor:</strong> {alumnoSel.tutor}</div>
                  <div style={{marginTop:4}}>📧 {alumnoSel.email} 📱 {alumnoSel.telefono}</div>
                  {partesLeves(alumnoSel.id)>=3&&<div style={{marginTop:6,color:C.salmon,fontWeight:600}}>⚠️ Acumulación: {partesLeves(alumnoSel.id)} partes leves</div>}
                  <div style={{marginTop:2,color:C.gray}}>Total partes: {partesDeAlumno(alumnoSel.id).length}</div>
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:16,marginTop:8}}>
                <div><label style={labelStyle}>Hora de clase</label>
                  <select value={fHora} onChange={e=>setFHora(e.target.value)} style={selStyle}>
                    {HORAS.map(h=><option key={h}>{h}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>Tipo de parte</label>
                  <select value={fTipo} onChange={e=>setFTipo(e.target.value)} style={selStyle}>
                    {TIPOS.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>Gravedad</label>
                  <select value={fGravedad} onChange={e=>setFGravedad(e.target.value)} style={selStyle}>
                    {GRAVEDAD.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{marginBottom:14}}>
                <label style={labelStyle}>Descripción del incidente</label>
                <textarea value={fDesc} onChange={e=>setFDesc(e.target.value)} rows={4} placeholder="Describe detalladamente lo ocurrido..."
                  style={{...inpStyle,resize:"vertical"}}/>
              </div>
              <div style={{marginBottom:20}}>
                <label style={labelStyle}>Profesor responsable</label>
                <select value={fProfesor} onChange={e=>setFProfesor(e.target.value)} style={selStyle}>
                  {profesores.map(p=><option key={p}>{p}</option>)}
                </select>
              </div>
              <Btn onClick={crearParte} disabled={!fAlumno||!fDesc.trim()} color={C.teal} style={{width:"100%",fontSize:15,padding:"14px"}}>📋 Generar Parte</Btn>
            </Card>
          </div>
        )}

        {/* ══ PARTE DE GRUPO ══ */}
        {tab==="parte_grupo"&&(
          <div>
            <h2 style={{color:C.dark,marginTop:0}}>👥 Parte de Grupo</h2>
            {grupoGenerado&&<Card style={{background:"#E8F5F3",border:`2px solid ${C.teal}`,marginBottom:20}}>
              <strong style={{color:C.teal}}>✅ {grupoGenerado.total} partes generados para {grupoGenerado.curso} · {fmt(grupoGenerado.ts)}</strong>
            </Card>}
            <Card>
              <div style={{marginBottom:16}}>
                <label style={labelStyle}>Seleccionar curso / grupo</label>
                <select value={gCurso} onChange={e=>{setGCurso(e.target.value);setGExcluidos([]);}} style={selStyle}>
                  <option value="">— Selecciona un curso —</option>
                  {cursos.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              {gCurso&&(()=>{
                const grupo=alumnos.filter(a=>a.curso===gCurso);
                const activos=grupo.filter(a=>!gExcluidos.includes(a.id));
                return (
                  <div style={{marginBottom:16}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <label style={{...labelStyle,marginBottom:0}}>Alumnos <span style={{color:C.gray,fontWeight:400}}>({activos.length} de {grupo.length})</span></label>
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={()=>setGExcluidos(grupo.map(a=>a.id))} style={{background:"#FDF0EF",color:C.salmon,border:"none",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:12,fontWeight:600}}>Excluir todos</button>
                        <button onClick={()=>setGExcluidos([])} style={{background:"#E8F5F3",color:C.teal,border:"none",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:12,fontWeight:600}}>Incluir todos</button>
                      </div>
                    </div>
                    <div style={{border:"1px solid #e5e7eb",borderRadius:8,overflow:"hidden"}}>
                      {grupo.map(a=>{ const excl=gExcluidos.includes(a.id); return (
                        <div key={a.id} onClick={()=>setGExcluidos(prev=>prev.includes(a.id)?prev.filter(x=>x!==a.id):[...prev,a.id])}
                          style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderBottom:"1px solid #f3f4f6",cursor:"pointer",background:excl?"#FDF0EF":C.white}}
                          onMouseOver={e=>e.currentTarget.style.background=excl?"#FDE8E8":C.cream}
                          onMouseOut={e=>e.currentTarget.style.background=excl?"#FDF0EF":C.white}>
                          <span style={{fontSize:13,textDecoration:excl?"line-through":"none",color:excl?"#9ca3af":C.dark}}><strong>{a.nombre}</strong></span>
                          <span style={{fontSize:12,fontWeight:600,color:excl?C.salmon:C.teal,background:excl?"#FDF0EF":"#E8F5F3",borderRadius:6,padding:"2px 10px"}}>{excl?"Excluido":"✓ Incluido"}</span>
                        </div>
                      );})}
                    </div>
                  </div>
                );
              })()}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:16}}>
                <div><label style={labelStyle}>Hora de clase</label>
                  <select value={gHora} onChange={e=>setGHora(e.target.value)} style={selStyle}>{HORAS.map(h=><option key={h}>{h}</option>)}</select></div>
                <div><label style={labelStyle}>Tipo de parte</label>
                  <select value={gTipo} onChange={e=>setGTipo(e.target.value)} style={selStyle}>{TIPOS.map(t=><option key={t}>{t}</option>)}</select></div>
                <div><label style={labelStyle}>Gravedad</label>
                  <select value={gGravedad} onChange={e=>setGGravedad(e.target.value)} style={selStyle}>{GRAVEDAD.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}</select></div>
              </div>
              <div style={{marginBottom:20}}>
                <label style={labelStyle}>Descripción del incidente</label>
                <textarea value={gDesc} onChange={e=>setGDesc(e.target.value)} rows={4} placeholder="Describe el comportamiento indebido del grupo..."
                  style={{...inpStyle,resize:"vertical"}}/>
              </div>
              <Btn onClick={crearParteGrupo} disabled={!gCurso||!gDesc.trim()} color={C.teal} style={{width:"100%",fontSize:15,padding:"14px"}}>
                👥 Generar Parte para {gCurso?`${alumnos.filter(a=>a.curso===gCurso&&!gExcluidos.includes(a.id)).length} alumnos de ${gCurso}`:"el grupo"}
              </Btn>
            </Card>
          </div>
        )}

        {/* ══ BAÑO PROFESOR ══ */}
        {tab==="bano"&&(
          <div>
            <h2 style={{color:C.dark,marginTop:0}}>🚻 Control de Salidas al Baño</h2>
            <Card>
              <input value={bBusqueda} onChange={e=>{setBBusqueda(e.target.value);setBAlumno("");}} placeholder="Buscar alumno..." style={{...inpStyle,marginBottom:8}}/>
              {bBusqueda&&!bAlumno&&(
                <div style={{border:"1px solid #e5e7eb",borderRadius:8,background:C.white,maxHeight:160,overflowY:"auto",marginBottom:12}}>
                  {alumnos.filter(a=>a.nombre.toLowerCase().includes(bBusqueda.toLowerCase())||a.curso.toLowerCase().includes(bBusqueda.toLowerCase())).map(a=>(
                    <div key={a.id} onClick={()=>{setBAlumno(a.id);setBBusqueda(a.nombre);}}
                      style={{padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid #f3f4f6",fontSize:13}}
                      onMouseOver={e=>e.currentTarget.style.background=C.cream} onMouseOut={e=>e.currentTarget.style.background=C.white}>
                      <strong>{a.nombre}</strong> — {a.curso}
                    </div>
                  ))}
                </div>
              )}
              <Btn onClick={registrarSalida} disabled={!bAlumno} color={C.blue}>🚻 Registrar Salida</Btn>
            </Card>
            {banoActivos.length>0&&(
              <Card style={{background:"#FFF8E8",border:`1px solid ${C.salmon}`}}>
                <h3 style={{margin:"0 0 12px",color:C.dark}}>⏳ Fuera ahora ({banoActivos.length})</h3>
                {banoActivos.map(b=>(
                  <div key={b.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.cream}`}}>
                    <div style={{fontSize:13}}><strong>{b.alumno}</strong> — {b.curso} — {fmt(b.salida)}</div>
                    <button onClick={()=>setBanos(prev=>prev.map(x=>x.id===b.id?{...x,regreso:new Date().toISOString()}:x))}
                      style={{background:C.teal,color:"#fff",border:"none",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:13,fontWeight:600}}>✅ Regresó</button>
                  </div>
                ))}
              </Card>
            )}
            <Card>
              <h3 style={{marginTop:0,color:C.dark}}>Historial de hoy</h3>
              {banos.filter(b=>b.fecha===todayStr()).length===0?<p style={{color:C.gray}}>Sin registros hoy</p>:
                banos.filter(b=>b.fecha===todayStr()).map(b=>{ const mins=b.regreso?Math.round((new Date(b.regreso)-new Date(b.salida))/60000):null;
                  return <div key={b.id} style={{padding:"8px 0",borderBottom:`1px solid ${C.cream}`,fontSize:13,display:"flex",justifyContent:"space-between"}}>
                    <span><strong>{b.alumno}</strong> — {b.curso}</span>
                    <span style={{color:C.gray}}>{fmt(b.salida)} {b.regreso?`· ${mins} min`:"· 🔴 Fuera"}</span>
                  </div>;})}
            </Card>
          </div>
        )}

        {/* ══ GUARDIAS PROFESOR ══ */}
        {tab==="guardias_prof"&&(
          <div>
            <h2 style={{color:C.dark,marginTop:0}}>🔄 Registrar Guardia</h2>
            {guardiaGenerada&&(
              <Card style={{background:"#E8F5F3",border:`2px solid ${C.teal}`,marginBottom:20}}>
                <strong style={{color:C.teal}}>✅ Guardia registrada · {fmt(guardiaGenerada.ts)}</strong>
                <div style={{fontSize:13,marginTop:4,color:C.dark}}>{guardiaGenerada.hora} · {guardiaGenerada.curso} · Guardia: {guardiaGenerada.profesorGuardia}</div>
              </Card>
            )}
            <Card>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <div><label style={labelStyle}>Profesor ausente</label>
                  <select value={guProfesorAusente} onChange={e=>setGuProfesorAusente(e.target.value)} style={selStyle}>
                    <option value="">— Seleccionar —</option>
                    {profesores.map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>Hora / módulo</label>
                  <select value={guHora} onChange={e=>setGuHora(e.target.value)} style={selStyle}>
                    {HORAS.map(h=><option key={h}>{h}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>Curso</label>
                  <select value={guCurso} onChange={e=>setGuCurso(e.target.value)} style={selStyle}>
                    <option value="">— Seleccionar —</option>
                    {cursos.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>Materia</label>
                  <input value={guMateria} onChange={e=>setGuMateria(e.target.value)} placeholder="Ej: Matemáticas" style={inpStyle}/>
                </div>
                <div><label style={labelStyle}>Profesor de guardia</label>
                  <select value={guProfesorGuardia} onChange={e=>setGuProfesorGuardia(e.target.value)} style={selStyle}>
                    <option value="">— Seleccionar —</option>
                    {profesores.filter(p=>p!==guProfesorAusente).map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>Motivo de ausencia</label>
                  <select value={guMotivo} onChange={e=>setGuMotivo(e.target.value)} style={selStyle}>
                    {MOTIVOS.map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div style={{marginBottom:20}}>
                <label style={labelStyle}>Material dejado para trabajar</label>
                <textarea value={guMaterial} onChange={e=>setGuMaterial(e.target.value)} rows={3} placeholder="Describe el material o tarea que deja el profesor ausente..."
                  style={{...inpStyle,resize:"vertical"}}/>
              </div>
              <Btn onClick={crearGuardia} disabled={!guProfesorAusente||!guCurso||!guProfesorGuardia} color={C.blue} style={{width:"100%",fontSize:15,padding:"14px"}}>
                🔄 Registrar Guardia
              </Btn>
            </Card>
          </div>
        )}

        {/* ══ MIS PARTES ══ */}
        {tab==="historial"&&(
          <div>
            <h2 style={{color:C.dark,marginTop:0}}>📁 Mis Partes Enviados</h2>
            {partes.filter(p=>p.profesor===fProfesor).length===0
              ?<Card style={{textAlign:"center",color:C.gray,padding:40}}>No has generado ningún parte aún</Card>
              :partes.filter(p=>p.profesor===fProfesor).map(p=><ParteCard key={p.id} parte={p} onVer={()=>setShowParte(p)} onPrint={()=>setPrintParte(p)}/>)}
          </div>
        )}

        {/* ══ DASHBOARD ══ */}
        {tab==="dashboard"&&(
          <div>
            <h2 style={{color:C.dark,marginTop:0}}>📊 Dashboard General</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:14,marginBottom:24}}>
              {[{label:"Total Partes",value:partes.length,color:C.dark,emoji:"📋"},{label:"Leves",value:partes.filter(p=>p.gravedad==="leve").length,color:C.teal,emoji:"🟡"},{label:"Graves",value:partes.filter(p=>p.gravedad==="grave").length,color:"#d97706",emoji:"🟠"},{label:"Muy Graves",value:partes.filter(p=>p.gravedad==="muy_grave").length,color:C.salmon,emoji:"🔴"},{label:"Fuera Ahora",value:banoActivos.length,color:C.blue,emoji:"🚻"},{label:"Guardias Hoy",value:guardias.filter(g=>g.fecha===todayStr()).length,color:"#7c3aed",emoji:"🔄"},{label:"Alertas",value:alertasNoLeidas,color:C.salmon,emoji:"🔔"}].map(s=>(
                <div key={s.label} style={{background:C.white,borderRadius:12,padding:16,textAlign:"center",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",borderTop:`4px solid ${s.color}`}}>
                  <div style={{fontSize:22}}>{s.emoji}</div>
                  <div style={{fontSize:28,fontWeight:800,color:s.color}}>{s.value}</div>
                  <div style={{fontSize:11,color:C.gray,marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>
            <h3 style={{color:C.dark}}>Resumen por curso</h3>
            <Card style={{padding:0,overflow:"hidden"}}>
              {cursos.map(c=>{ const pC=partes.filter(p=>p.curso===c); if(!pC.length) return null;
                return <div key={c} style={{padding:"12px 20px",borderBottom:`1px solid ${C.cream}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontWeight:700,color:C.dark}}>{c} <span style={{color:C.gray,fontWeight:400,fontSize:13}}>— {pC.length} parte(s)</span></div>
                  <div style={{display:"flex",gap:6}}>{["leve","grave","muy_grave"].map(g=>{ const n=pC.filter(p=>p.gravedad===g).length; if(!n) return null; const gv=gObj(g); return <span key={g} style={{background:gv.bg,color:gv.color,borderRadius:8,padding:"3px 10px",fontSize:12,fontWeight:700}}>{gv.label.split(" ")[0]} ×{n}</span>; })}</div>
                </div>;})}
              {partes.length===0&&<div style={{padding:20,color:C.gray,textAlign:"center"}}>Sin incidencias registradas</div>}
            </Card>
            <h3 style={{color:C.dark}}>Alumnos con más incidencias</h3>
            <Card style={{padding:0,overflow:"hidden"}}>
              {alumnos.filter(a=>partesDeAlumno(a.id).length>0).sort((a,b)=>partesDeAlumno(b.id).length-partesDeAlumno(a.id).length).map(a=>(
                <div key={a.id} style={{padding:"12px 20px",borderBottom:`1px solid ${C.cream}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><strong style={{color:C.dark}}>{a.nombre}</strong> <span style={{color:C.gray,fontSize:13}}>— {a.curso}</span>
                    {partesLeves(a.id)>=3&&<span style={{marginLeft:8,background:"#FFF0CC",color:"#b45309",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:600}}>⚠️ Acumulación</span>}
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    {["leve","grave","muy_grave"].map(g=>{ const n=partesDeAlumno(a.id).filter(p=>p.gravedad===g).length; if(!n) return null; const gv=gObj(g); return <span key={g} style={{background:gv.bg,color:gv.color,borderRadius:8,padding:"3px 8px",fontSize:12,fontWeight:700}}>{gv.label.split(" ")[0]} ×{n}</span>; })}
                    <span style={{background:"#EEF5F8",color:C.blue,borderRadius:8,padding:"3px 10px",fontSize:12,fontWeight:700}}>Total: {partesDeAlumno(a.id).length}</span>
                  </div>
                </div>
              ))}
              {partes.length===0&&<div style={{padding:20,color:C.gray,textAlign:"center"}}>Sin incidencias registradas</div>}
            </Card>
          </div>
        )}

        {/* ══ POR CURSO ══ */}
        {tab==="por_curso"&&(
          <div>
            <h2 style={{color:C.dark,marginTop:0}}>🏫 Partes por Curso / Grupo</h2>
            {cursos.map(curso=>{
              const pC=partes.filter(p=>p.curso===curso);
              const alC=alumnos.filter(a=>a.curso===curso);
              return (
                <div key={curso} style={{background:C.white,borderRadius:14,marginBottom:16,boxShadow:"0 2px 10px rgba(0,0,0,0.06)",overflow:"hidden"}}>
                  <div style={{background:`linear-gradient(90deg,${C.dark},${C.blue})`,color:"#fff",padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontWeight:700,fontSize:16}}>{curso}</div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      {["leve","grave","muy_grave"].map(g=>{ const n=pC.filter(p=>p.gravedad===g).length; if(!n) return null; const gv=gObj(g); return <span key={g} style={{background:gv.bg,color:gv.color,borderRadius:8,padding:"2px 10px",fontSize:12,fontWeight:700}}>{gv.label.split(" ")[0]} ×{n}</span>; })}
                      <span style={{background:"rgba(255,255,255,0.2)",borderRadius:8,padding:"2px 10px",fontSize:13}}>Total: {pC.length}</span>
                    </div>
                  </div>
                  {pC.length===0?<div style={{padding:"16px 20px",color:C.gray,fontSize:13}}>Sin partes en este curso</div>
                    :alC.map(a=>{ const pA=partesDeAlumno(a.id); if(!pA.length) return null;
                      return (
                        <div key={a.id} style={{borderBottom:`1px solid ${C.cream}`}}>
                          <div style={{padding:"10px 20px",background:C.cream,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <span style={{fontWeight:600,fontSize:14,color:C.dark}}>{a.nombre}</span>
                            <div style={{display:"flex",gap:6}}>{["leve","grave","muy_grave"].map(g=>{ const n=pA.filter(p=>p.gravedad===g).length; if(!n) return null; const gv=gObj(g); return <span key={g} style={{background:gv.bg,color:gv.color,borderRadius:8,padding:"2px 8px",fontSize:11,fontWeight:700}}>{gv.label.split(" ")[0]} ×{n}</span>; })}</div>
                          </div>
                          {pA.map(p=>(
                            <div key={p.id} style={{padding:"8px 20px 8px 36px",fontSize:13,borderBottom:`1px solid ${C.cream}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                              <span style={{color:"#374151"}}>📅 {fmt(p.ts)} · {p.hora} · {p.tipo}{p.esGrupal?" · 👥":""}</span>
                              <div style={{display:"flex",gap:6}}>
                                <Badge g={p.gravedad}/>
                                <button onClick={()=>setShowParte(p)} style={{background:"#EEF5F8",color:C.blue,border:"none",borderRadius:6,padding:"2px 10px",cursor:"pointer",fontSize:12,fontWeight:600}}>Ver</button>
                                <button onClick={()=>setPrintParte(p)} style={{background:"#FDF0EF",color:C.salmon,border:"none",borderRadius:6,padding:"2px 10px",cursor:"pointer",fontSize:12,fontWeight:600}}>🖨️</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ POR ALUMNO ══ */}
        {tab==="por_alumno"&&(
          <div>
            <h2 style={{color:C.dark,marginTop:0}}>👤 Partes por Alumno</h2>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              <select value={filtCurso} onChange={e=>{setFiltCurso(e.target.value);setFiltAlumno("");}} style={selStyle}>
                <option value="">Todos los cursos</option>{cursos.map(c=><option key={c}>{c}</option>)}
              </select>
              <select value={filtAlumno} onChange={e=>setFiltAlumno(e.target.value)} style={selStyle}>
                <option value="">Seleccionar alumno</option>
                {alumnos.filter(a=>!filtCurso||a.curso===filtCurso).map(a=><option key={a.id} value={a.id}>{a.nombre} — {a.curso}</option>)}
              </select>
            </div>
            {filtAlumno?(()=>{
              const al=alumnos.find(a=>a.id===parseInt(filtAlumno));
              const pAl=partesDeAlumno(al.id);
              return (
                <div>
                  <Card>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        <div style={{fontSize:18,fontWeight:700,color:C.dark}}>{al.nombre}</div>
                        <div style={{color:C.gray,fontSize:14,marginTop:4}}>{al.curso} · Tutor: {al.tutor}</div>
                        <div style={{fontSize:13,marginTop:4}}>📧 {al.email} · 📱 {al.telefono}</div>
                      </div>
                      <div style={{textAlign:"right"}}><div style={{fontSize:32,fontWeight:800,color:C.dark}}>{pAl.length}</div><div style={{fontSize:12,color:C.gray}}>partes totales</div></div>
                    </div>
                    <div style={{display:"flex",gap:10,marginTop:16}}>
                      {["leve","grave","muy_grave"].map(g=>{ const n=pAl.filter(p=>p.gravedad===g).length; const gv=gObj(g); return <div key={g} style={{flex:1,background:gv.bg,borderRadius:10,padding:12,textAlign:"center",border:`2px solid ${gv.color}`}}><div style={{fontSize:24,fontWeight:800,color:gv.color}}>{n}</div><div style={{fontSize:12,color:gv.color,fontWeight:600}}>{gv.label}</div></div>; })}
                    </div>
                    {partesLeves(al.id)>=3&&<div style={{marginTop:12,background:"#FFF0CC",border:"1px solid #fbbf24",borderRadius:8,padding:"10px 14px",fontSize:13,fontWeight:600,color:"#92400e"}}>⚠️ Acumulación de {partesLeves(al.id)} partes leves — Considerar sanción según Reglamento de Centro</div>}
                  </Card>
                  {pAl.length===0?<Card style={{textAlign:"center",color:C.gray}}>Sin partes registrados</Card>
                    :pAl.map(p=><ParteCard key={p.id} parte={p} onVer={()=>setShowParte(p)} onPrint={()=>setPrintParte(p)}/>)}
                </div>
              );
            })():(
              <Card style={{padding:0,overflow:"hidden"}}>
                {alumnos.filter(a=>(!filtCurso||a.curso===filtCurso)&&partesDeAlumno(a.id).length>0).sort((a,b)=>partesDeAlumno(b.id).length-partesDeAlumno(a.id).length).map(a=>(
                  <div key={a.id} onClick={()=>setFiltAlumno(a.id)} style={{padding:"12px 20px",borderBottom:`1px solid ${C.cream}`,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}
                    onMouseOver={e=>e.currentTarget.style.background=C.cream} onMouseOut={e=>e.currentTarget.style.background=C.white}>
                    <div><strong style={{color:C.dark}}>{a.nombre}</strong> <span style={{color:C.gray,fontSize:13}}>— {a.curso}</span>
                      {partesLeves(a.id)>=3&&<span style={{marginLeft:8,background:"#FFF0CC",color:"#b45309",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:600}}>⚠️</span>}
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      {["leve","grave","muy_grave"].map(g=>{ const n=partesDeAlumno(a.id).filter(p=>p.gravedad===g).length; if(!n) return null; const gv=gObj(g); return <span key={g} style={{background:gv.bg,color:gv.color,borderRadius:8,padding:"3px 8px",fontSize:12,fontWeight:700}}>{gv.label.split(" ")[0]} ×{n}</span>; })}
                      <span style={{background:"#EEF5F8",color:C.blue,borderRadius:8,padding:"3px 10px",fontSize:12,fontWeight:700}}>{partesDeAlumno(a.id).length}</span>
                      <span style={{color:C.gray,fontSize:16}}>›</span>
                    </div>
                  </div>
                ))}
                {alumnos.filter(a=>(!filtCurso||a.curso===filtCurso)&&partesDeAlumno(a.id).length>0).length===0&&<div style={{padding:30,textAlign:"center",color:C.gray}}>Sin alumnos con partes</div>}
              </Card>
            )}
          </div>
        )}

        {/* ══ TODOS LOS PARTES ══ */}
        {tab==="partes_todos"&&(
          <div>
            <h2 style={{color:C.dark,marginTop:0}}>📋 Todos los Partes</h2>
            <Card>
              <div style={{fontWeight:600,color:C.dark,marginBottom:10}}>🔍 Filtros</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10}}>
                <select value={filtCurso} onChange={e=>{setFiltCurso(e.target.value);setFiltAlumno("");}} style={{...selStyle,padding:"8px 12px",fontSize:13}}>
                  <option value="">Todos los cursos</option>{cursos.map(c=><option key={c}>{c}</option>)}
                </select>
                <select value={filtAlumno} onChange={e=>setFiltAlumno(e.target.value)} style={{...selStyle,padding:"8px 12px",fontSize:13}}>
                  <option value="">Todos los alumnos</option>{alumnos.filter(a=>!filtCurso||a.curso===filtCurso).map(a=><option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
                <select value={filtGravedad} onChange={e=>setFiltGravedad(e.target.value)} style={{...selStyle,padding:"8px 12px",fontSize:13}}>
                  <option value="">Toda gravedad</option>{GRAVEDAD.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}
                </select>
                <input type="date" value={filtFechaDesde} onChange={e=>setFiltFechaDesde(e.target.value)} style={{...inpStyle,padding:"8px 12px",fontSize:13}}/>
                <input type="date" value={filtFechaHasta} onChange={e=>setFiltFechaHasta(e.target.value)} style={{...inpStyle,padding:"8px 12px",fontSize:13}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10}}>
                <span style={{fontSize:13,color:C.gray}}>{partesFiltrados.length} parte(s)</span>
                <button onClick={()=>{setFiltCurso("");setFiltAlumno("");setFiltGravedad("");setFiltFechaDesde("");setFiltFechaHasta("");}} style={{background:"none",border:`1px solid #d1d5db`,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:13,color:C.gray}}>Limpiar</button>
              </div>
            </Card>
            {partesFiltrados.length===0?<Card style={{textAlign:"center",color:C.gray}}>Sin partes con los filtros actuales</Card>
              :partesFiltrados.map(p=><ParteCard key={p.id} parte={p} onVer={()=>setShowParte(p)} onPrint={()=>setPrintParte(p)}/>)}
          </div>
        )}

        {/* ══ GUARDIAS JEFATURA ══ */}
        {tab==="guardias_jef"&&(
          <div>
            <h2 style={{color:C.dark,marginTop:0}}>🔄 Registro de Guardias</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:14,marginBottom:20}}>
              {[{label:"Guardias Hoy",value:guardias.filter(g=>g.fecha===todayStr()).length,color:C.blue},{label:"Esta Semana",value:guardias.filter(g=>weekKey(g.fecha)===weekKey(new Date())).length,color:C.teal},{label:"Total",value:guardias.length,color:C.dark}].map(s=>(
                <div key={s.label} style={{background:C.white,borderRadius:12,padding:16,textAlign:"center",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",borderTop:`4px solid ${s.color}`}}>
                  <div style={{fontSize:28,fontWeight:800,color:s.color}}>{s.value}</div>
                  <div style={{fontSize:11,color:C.gray,marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>
            {guardias.length===0?<Card style={{textAlign:"center",color:C.gray,padding:40}}>Sin guardias registradas</Card>:
              guardias.map(g=>(
                <Card key={g.id} style={{borderLeft:`4px solid ${C.blue}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontWeight:700,color:C.dark,fontSize:15}}>🔄 {g.hora} · {g.curso} {g.materia&&`· ${g.materia}`}</div>
                      <div style={{fontSize:13,color:C.gray,marginTop:4}}>📅 {fmt(g.ts)}</div>
                      <div style={{fontSize:13,marginTop:6}}><span style={{color:C.salmon,fontWeight:600}}>Ausente:</span> {g.profesorAusente} <span style={{color:C.gray,marginLeft:8}}>({g.motivo})</span></div>
                      <div style={{fontSize:13,marginTop:2}}><span style={{color:C.teal,fontWeight:600}}>Guardia:</span> {g.profesorGuardia}</div>
                      {g.material&&<div style={{fontSize:13,marginTop:4,background:C.cream,borderRadius:6,padding:"6px 10px"}}>📝 Material: {g.material}</div>}
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        )}

        {/* ══ BAÑOS LIVE ══ */}
        {tab==="bano_live"&&(
          <div>
            <h2 style={{color:C.dark,marginTop:0}}>🚻 Baños — Tiempo Real</h2>
            <Card style={{background:banoActivos.length>0?"#FFF8E8":"#E8F5F3",border:`2px solid ${banoActivos.length>0?C.salmon:C.teal}`}}>
              <h3 style={{margin:"0 0 12px",color:C.dark}}>{banoActivos.length>0?`⏳ ${banoActivos.length} alumno(s) fuera`:"✅ Ningún alumno fuera"}</h3>
              {banoActivos.map(b=><div key={b.id} style={{padding:"8px 0",borderBottom:`1px solid rgba(0,0,0,0.08)`,fontSize:14}}><strong>{b.alumno}</strong> — {b.curso} — {fmt(b.salida)}</div>)}
            </Card>
            <Card>
              <h3 style={{marginTop:0,color:C.dark}}>Historial completo</h3>
              {banos.length===0?<p style={{color:C.gray}}>Sin registros</p>:banos.map(b=>{ const mins=b.regreso?Math.round((new Date(b.regreso)-new Date(b.salida))/60000):null;
                return <div key={b.id} style={{padding:"8px 0",borderBottom:`1px solid ${C.cream}`,fontSize:13,display:"flex",justifyContent:"space-between"}}>
                  <span><strong>{b.alumno}</strong> — {b.curso} — {b.fecha}</span>
                  <span style={{color:C.gray}}>{b.regreso?`${mins} min`:"🔴 Fuera"}</span>
                </div>;})}
            </Card>
          </div>
        )}

        {/* ══ ALERTAS ══ */}
        {tab==="alertas"&&(
          <div>
            <h2 style={{color:C.dark,marginTop:0}}>🔔 Alertas</h2>
            {alertas.length===0?<Card style={{textAlign:"center",color:C.gray,padding:40}}>Sin alertas</Card>
              :alertas.map(a=>{
                const config={
                  acumulacion_leves:{icon:"⚠️",color:"#b45309",bg:"#FFF0CC",border:"#fbbf24",label:"Acumulación de leves"},
                  total_partes:     {icon:"📋",color:C.blue,   bg:"#EEF5F8",border:C.blue,   label:"Límite de partes"},
                  fuera_horario:    {icon:"🕐",color:C.teal,   bg:"#E8F5F3",border:C.teal,   label:"Fuera de horario"},
                  bano:             {icon:"🚻",color:C.salmon, bg:"#FDF0EF",border:C.salmon, label:"Abuso de baño"},
                }[a.tipo]||{icon:"🔔",color:C.gray,bg:C.cream,border:"#ccc",label:"Alerta"};
                return (
                  <div key={a.id} onClick={()=>setAlertas(prev=>prev.map(x=>x.id===a.id?{...x,leida:true}:x))}
                    style={{background:a.leida?C.white:config.bg,border:`1px solid ${a.leida?"#e5e7eb":config.border}`,borderLeft:`4px solid ${a.leida?"#e5e7eb":config.border}`,borderRadius:12,padding:16,marginBottom:10,cursor:"pointer",opacity:a.leida?.7:1,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{fontSize:20}}>{config.icon}</span>
                        <div>
                          <div style={{fontWeight:700,color:a.leida?C.gray:config.color}}>{config.label} — {a.alumno}</div>
                          <div style={{fontSize:13,color:"#374151",marginTop:2}}>{a.curso} · {a.msg||a.msgs?.join(" · ")}</div>
                        </div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
                        <div style={{fontSize:12,color:C.gray}}>{fmt(a.ts)}</div>
                        {!a.leida&&<div style={{fontSize:11,color:config.color,marginTop:4,fontWeight:600}}>● Sin leer</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* ══ INFORME ══ */}
        {tab==="informe"&&(
          <div>
            <h2 style={{color:C.dark,marginTop:0}}>📤 Exportar Informe</h2>
            <Card>
              <div style={{background:"#EEF5F8",borderRadius:8,padding:12,marginBottom:20,fontSize:13,color:C.blue}}>
                💡 El informe se abrirá en pantalla completa. Usa <strong>Ctrl+P</strong> → <strong>"Guardar como PDF"</strong>.
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:16}}>
                <select value={filtCurso} onChange={e=>{setFiltCurso(e.target.value);setFiltAlumno("");}} style={{...selStyle,fontSize:13}}>
                  <option value="">Todos los cursos</option>{cursos.map(c=><option key={c}>{c}</option>)}
                </select>
                <select value={filtAlumno} onChange={e=>setFiltAlumno(e.target.value)} style={{...selStyle,fontSize:13}}>
                  <option value="">Todos los alumnos</option>{alumnos.filter(a=>!filtCurso||a.curso===filtCurso).map(a=><option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
                <select value={filtGravedad} onChange={e=>setFiltGravedad(e.target.value)} style={{...selStyle,fontSize:13}}>
                  <option value="">Toda gravedad</option>{GRAVEDAD.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}
                </select>
                <input type="date" value={filtFechaDesde} onChange={e=>setFiltFechaDesde(e.target.value)} style={{...inpStyle,fontSize:13}}/>
                <input type="date" value={filtFechaHasta} onChange={e=>setFiltFechaHasta(e.target.value)} style={{...inpStyle,fontSize:13}}/>
              </div>
              <div style={{background:C.cream,borderRadius:8,padding:12,marginBottom:16,fontSize:13,color:C.dark}}>
                El informe incluirá <strong>{partesFiltrados.length} parte(s)</strong>
                {filtCurso&&` · ${filtCurso}`}{filtGravedad&&` · ${GRAVEDAD.find(g=>g.id===filtGravedad)?.label}`}
                {filtFechaDesde&&` · Desde: ${fmtD(filtFechaDesde)}`}{filtFechaHasta&&` · Hasta: ${fmtD(filtFechaHasta)}`}
              </div>
              <Btn onClick={()=>setPrintInforme(true)} disabled={partesFiltrados.length===0} color={C.teal} style={{width:"100%",fontSize:15,padding:"14px"}}>
                🖨️ Ver Informe y Guardar como PDF (Ctrl+P)
              </Btn>
            </Card>
          </div>
        )}

        {/* ══ ADMIN ALUMNOS ══ */}
        {tab==="admin_panel"&&(
          <div>
            <h2 style={{color:C.dark,marginTop:0}}>👥 Gestión de Alumnos</h2>
            <Card>
              <h3 style={{marginTop:0,color:C.dark}}>Añadir alumno</h3>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {[["nombre","Nombre completo *"],["curso","Curso / Aula *"],["tutor","Tutor de grupo"],["email","Email familia"],["telefono","Teléfono familia"]].map(([k,ph])=>(
                  <input key={k} value={nuevoAlumno[k]} onChange={e=>setNuevoAlumno(p=>({...p,[k]:e.target.value}))} placeholder={ph} style={inpStyle}/>
                ))}
              </div>
              <Btn onClick={()=>{ if(!nuevoAlumno.nombre||!nuevoAlumno.curso) return; setAlumnos(prev=>[...prev,{...nuevoAlumno,id:Date.now()}]); setNuevoAlumno({nombre:"",curso:"",tutor:"",email:"",telefono:""});}} color={C.teal} style={{marginTop:12}}>➕ Añadir Alumno</Btn>
            </Card>
            <Card style={{padding:0,overflow:"hidden"}}>
              <div style={{padding:"12px 20px",background:C.cream,borderBottom:`1px solid #e5e7eb`,fontWeight:600,fontSize:13,color:C.dark}}>{alumnos.length} alumno(s)</div>
              {alumnos.map(a=>(
                <div key={a.id} style={{padding:"12px 20px",borderBottom:`1px solid ${C.cream}`,fontSize:13,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontWeight:600,color:C.dark}}>{a.nombre} <span style={{color:C.gray,fontWeight:400}}>— {a.curso}</span></div>
                    <div style={{color:C.gray,marginTop:2}}>Tutor: {a.tutor} · 📧 {a.email} · 📱 {a.telefono}</div>
                  </div>
                  <button onClick={()=>setAlumnos(prev=>prev.filter(x=>x.id!==a.id))} style={{background:"#FDF0EF",color:C.salmon,border:"none",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:600}}>🗑</button>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ══ ADMIN PROFESORES ══ */}
        {tab==="admin_profesores"&&(
          <div>
            <h2 style={{color:C.dark,marginTop:0}}>👨‍🏫 Gestión de Profesores</h2>
            <Card>
              <h3 style={{marginTop:0,color:C.dark}}>Añadir profesor</h3>
              <div style={{display:"flex",gap:10}}>
                <input value={nuevoProfesor} onChange={e=>setNuevoProfesor(e.target.value)} placeholder="Nombre completo del profesor" style={{...inpStyle,flex:1}}/>
                <Btn onClick={()=>{ if(!nuevoProfesor.trim()) return; setProfesores(prev=>[...prev,nuevoProfesor.trim()]); setNuevoProfesor(""); }} color={C.teal}>➕ Añadir</Btn>
              </div>
            </Card>
            <Card style={{padding:0,overflow:"hidden"}}>
              <div style={{padding:"12px 20px",background:C.cream,borderBottom:`1px solid #e5e7eb`,fontWeight:600,fontSize:13,color:C.dark}}>{profesores.length} profesor(es)</div>
              {profesores.map((p,i)=>(
                <div key={i} style={{padding:"12px 20px",borderBottom:`1px solid ${C.cream}`,fontSize:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontWeight:500,color:C.dark}}>👨‍🏫 {p}</span>
                  <button onClick={()=>setProfesores(prev=>prev.filter((_,j)=>j!==i))} style={{background:"#FDF0EF",color:C.salmon,border:"none",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:600}}>🗑</button>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>

      {/* Modal ver parte */}
      {showParte&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:20}}>
          <div style={{background:C.white,borderRadius:16,maxWidth:560,width:"100%",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{background:`linear-gradient(90deg,${C.dark},${C.blue})`,color:"#fff",padding:"16px 24px",borderRadius:"16px 16px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontWeight:700}}>GalvánDesk · Parte de Incidencia</div><div style={{fontSize:12,opacity:.8}}>Ref: PARTE-{showParte.id}</div></div>
              <button onClick={()=>setShowParte(null)} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",borderRadius:8,padding:"6px 14px",cursor:"pointer"}}>✕</button>
            </div>
            <div style={{padding:24}}>
              {(()=>{ const g=gObj(showParte.gravedad); return <div style={{background:g.bg,border:`2px solid ${g.color}`,borderRadius:10,padding:12,marginBottom:20,textAlign:"center"}}><strong style={{color:g.color,fontSize:16}}>{g.label} — {g.desc}</strong></div>; })()}
              {showParte.esGrupal&&<div style={{background:"#E8F5F3",borderRadius:8,padding:"8px 14px",fontSize:13,color:C.teal,fontWeight:600,marginBottom:12}}>📢 Parte generado como parte de grupo</div>}
              {[["Alumno",showParte.alumno],["Curso",showParte.curso],["Tutor",showParte.tutor],["Tipo",showParte.tipo],["Hora",showParte.hora||"No especificada"],["Fecha y hora",fmt(showParte.ts)],["Profesor",showParte.profesor]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.cream}`,fontSize:14}}>
                  <span style={{color:C.gray,fontWeight:600}}>{k}</span><span style={{color:C.dark}}>{v}</span>
                </div>
              ))}
              <div style={{marginTop:16,background:C.cream,borderRadius:8,padding:14,fontSize:14,lineHeight:1.6,color:C.dark}}>{showParte.descripcion}</div>
              <div style={{marginTop:12,background:"#EEF5F8",borderRadius:8,padding:12,fontSize:13}}>
                <strong style={{color:C.blue}}>📬 Familia:</strong> 📧 {showParte.email} · 📱 {showParte.telefono}
              </div>
              <button onClick={()=>{setShowParte(null);setPrintParte(showParte);}}
                style={{marginTop:16,width:"100%",background:C.salmon,color:"#fff",border:"none",borderRadius:10,padding:"12px",cursor:"pointer",fontWeight:700,fontSize:14}}>
                🖨️ Imprimir / Guardar como PDF (Ctrl+P)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
