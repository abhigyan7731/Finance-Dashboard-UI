import React from 'react'

function toPath(points,w,h){
  if(points.length===0) return ''
  const max = Math.max(...points.map(p=>p.value))
  const min = Math.min(...points.map(p=>p.value))
  const range = max - min || 1
  return points.map((p,i)=>{
    const x = (i/(points.length-1||1)) * w
    const y = h - ((p.value - min)/range)*h
    return `${i===0?'M':'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
  }).join(' ')
}

export default function LineChart({series}){
  const w=500,h=160
  const path = toPath(series,w,h)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:'100%',height:160}}>
      <rect width="100%" height="100%" fill="transparent"></rect>
      <path d={path} fill="none" stroke="#2563eb" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
