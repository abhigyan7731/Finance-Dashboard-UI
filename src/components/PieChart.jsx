import React from 'react'

function polarToCartesian(cx, cy, r, angle){
  const a = (angle-90) * Math.PI / 180.0
  return [cx + (r * Math.cos(a)), cy + (r * Math.sin(a))]
}

export default function PieChart({data}){
  const total = Object.values(data).reduce((s,v)=>s+v,0)
  let angle = 0
  const cx=80, cy=80, r=70
  const segments = Object.entries(data).map(([k,v],i)=>{
    const portion = v/total
    const start = angle
    const end = angle + portion*360
    angle = end
    const [sx,sy] = polarToCartesian(cx,cy,r,end)
    const [ex,ey] = polarToCartesian(cx,cy,r,start)
    const large = end - start > 180 ? 1 : 0
    return {d:`M ${cx} ${cy} L ${sx} ${sy} A ${r} ${r} 0 ${large} 0 ${ex} ${ey} Z`, key:k, value:v}
  })
  const colors = ['#ef4444','#f59e0b','#6366f1','#10b981','#3b82f6','#a78bfa']
  return (
    <svg viewBox="0 0 160 160" width={160} height={160}>
      {segments.map((s,i)=> <path key={s.key} d={s.d} fill={colors[i%colors.length]} stroke="#fff" />)}
    </svg>
  )
}
