import React, {useMemo} from 'react'

export default function MiniSpark({series=[]}){
  const pts = useMemo(()=>{
    if(!series || series.length===0) return []
    const values = series.map(s=>s.value)
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1
    return series.map((s,i)=>({x:(i/(series.length-1||1))*100, y: 100 - ((s.value - min)/range)*80}))
  },[series])

  const path = useMemo(()=>{
    if(pts.length===0) return ''
    return pts.map(p=>`${p.x},${p.y}`).join(' ')
  },[pts])

  return (
    <div style={{width:120,height:40}}>
      <svg viewBox="0 0 100 100" style={{width:'100%',height:'100%'}}>
        <polyline fill="none" stroke="rgba(15,23,42,0.12)" strokeWidth={2} points={path} />
        <polyline fill="none" stroke="var(--accent)" strokeWidth={2} points={path} />
      </svg>
    </div>
  )
}
