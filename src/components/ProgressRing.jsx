import React from 'react'

export default function ProgressRing({size=96, stroke=8, progress=0, label="", subtitle=""}){
  const r = (size - stroke)/2
  const cx = size/2, cy = size/2
  const c = 2*Math.PI*r
  const offset = c * (1 - Math.max(0, Math.min(1, progress)))
  return (
    <div style={{width:size,height:size,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
      <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
        <circle cx={cx} cy={cy} r={r} stroke="rgba(2,6,23,0.06)" strokeWidth={stroke} fill="none" />
        <circle cx={cx} cy={cy} r={r} stroke="var(--accent)" strokeWidth={stroke} fill="none" strokeDasharray={`${c}`} strokeDashoffset={offset} strokeLinecap="round" style={{transition:'stroke-dashoffset 420ms ease'}} />
      </svg>
      <div style={{position:'absolute',pointerEvents:'none',textAlign:'center'}}>
        <div style={{fontSize:12,color:'rgba(15,23,42,0.7)'}}>{label}</div>
        <div style={{fontSize:16,fontWeight:800,color:'var(--accent)'}}>{subtitle}</div>
      </div>
    </div>
  )
}
