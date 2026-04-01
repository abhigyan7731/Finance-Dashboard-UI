import React, {useMemo, useState, useRef, useEffect} from 'react'

// convert points to smoothed cubic-bezier path (Catmull-Rom to Bezier)
function catmullRom2bezier(points, closed){
  const size = points.length
  if(size===0) return ''
  if(size===1) return `M ${points[0].x} ${points[0].y}`
  let d = `M ${points[0].x} ${points[0].y}`
  for(let i=0;i<size-1;i++){
    const p0 = i>0 ? points[i-1] : points[i]
    const p1 = points[i]
    const p2 = points[i+1]
    const p3 = i+2<size ? points[i+2] : p2
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return d
}

export default function LineChart({series=[]}){
  const w = 540, h = 160, pad = 12
  const [hover, setHover] = useState(null)
  const [tooltip, setTooltip] = useState(null)
  const [mounted, setMounted] = useState(false)
  const svgRef = useRef()

  const pts = useMemo(()=>{
    if(!series || series.length===0) return []
    const values = series.map(s=>s.value)
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1
    return series.map((s,i)=>{
      const x = pad + (i/(series.length-1||1)) * (w - pad*2)
      const y = pad + (1 - (s.value - min)/range) * (h - pad*2)
      return {x,y,value:s.value,label:s.label}
    })
  },[series])

  const path = useMemo(()=> catmullRom2bezier(pts),[pts])

  // area path (close to bottom)
  const areaPath = useMemo(()=>{
    if(pts.length===0) return ''
    const d = catmullRom2bezier(pts)
    const last = pts[pts.length-1]
    const first = pts[0]
    return `${d} L ${last.x} ${h-pad} L ${first.x} ${h-pad} Z`
  },[pts])

  useEffect(()=>{ // entrance animation flag
    const t = setTimeout(()=>setMounted(true),20)
    return ()=>clearTimeout(t)
  },[])

  const onPointEnter = (p, e)=>{
    setHover(p)
    const rect = svgRef.current.getBoundingClientRect()
    setTooltip({x: rect.left + p.x, y: rect.top + p.y, value: p.value, label: p.label})
  }
  const onPointLeave = ()=>{ setHover(null); setTooltip(null) }

  return (
    <div style={{position:'relative'}}>
      <svg ref={svgRef} viewBox={`0 0 ${w} ${h}`} style={{width:'100%',height:h}} className={mounted? 'chart-animate chart-in': 'chart-animate'}>
        <defs>
          <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.03" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="transparent" />

        {areaPath && <path d={areaPath} fill="url(#areaGrad)" opacity={0.95} />}

        <path d={path} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

        {pts.map((p,i)=> (
          <g key={i} transform={`translate(${p.x},${p.y})`}>
            <circle r={hover===p?7:4} fill="var(--accent)" stroke="#fff" strokeWidth={1.5} style={{filter: hover===p? 'url(#glow)': 'none', transition:'r 140ms'}} onMouseEnter={(e)=>onPointEnter(p,e)} onMouseLeave={onPointLeave} />
          </g>
        ))}
      </svg>

      {tooltip && (
        <div className="chart-tooltip" style={{position:'fixed',left:tooltip.x+12,top:tooltip.y-24,background:'rgba(2,6,23,0.9)',color:'#fff',padding:'6px 8px',borderRadius:6,fontSize:12,whiteSpace:'nowrap',pointerEvents:'none'}}>
          <div style={{fontSize:11,opacity:0.9}}>{tooltip.label}</div>
          <div style={{fontWeight:700}}>${Number(tooltip.value).toFixed(2)}</div>
        </div>
      )}
    </div>
  )
}
