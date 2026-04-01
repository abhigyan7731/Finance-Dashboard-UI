import React from 'react'

function Chip({text,cta,onClick,variant='neutral'}){
  return (
    <div className={`chip ${variant}`} style={{display:'flex',gap:8,alignItems:'center',padding:'8px 10px',borderRadius:999,background:'rgba(255,255,255,0.6)'}}>
      <div style={{width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:999,background:'rgba(0,0,0,0.06)'}} className="icon-scale">★</div>
      <div style={{fontSize:13}}>{text}</div>
      {cta && <button className="btn-ghost" onClick={onClick}>{cta}</button>}
    </div>
  )
}

export default function SmartInsights({insights=[], onView}){
  if(!insights || insights.length===0) return null
  return (
    <div className="card">
      <h3 style={{marginTop:0}}>Smart Insights</h3>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {insights.map((it,i)=> (
          <Chip key={i} text={it.text} cta={it.cta} onClick={()=>onView && onView(it)} />
        ))}
      </div>
    </div>
  )
}
