import React, {useMemo, useState, useEffect} from 'react'

function polarToCartesian(cx, cy, r, angle){
  const a = (angle-90) * Math.PI / 180.0
  return [cx + (r * Math.cos(a)), cy + (r * Math.sin(a))]
}

// create donut segment path (outer arc then inner arc)
function describeDonutSegment(cx, cy, rOuter, rInner, startAngle, endAngle){
  const [sx,sy] = polarToCartesian(cx,cy,rOuter,endAngle)
  const [ex,ey] = polarToCartesian(cx,cy,rOuter,startAngle)
  const [isx,isy] = polarToCartesian(cx,cy,rInner,startAngle)
  const [iex,iey] = polarToCartesian(cx,cy,rInner,endAngle)
  const large = endAngle - startAngle > 180 ? 1 : 0
  return `M ${sx} ${sy} A ${rOuter} ${rOuter} 0 ${large} 0 ${ex} ${ey} L ${isx} ${isy} A ${rInner} ${rInner} 0 ${large} 1 ${iex} ${iey} Z`
}

export default function PieChart({data={}}){
  const total = Object.values(data).reduce((s,v)=>s+v,0) || 1
  let angle = 0
  const cx=80, cy=80, rOuter=72, rInner=42
  const entries = Object.entries(data)
  const colors = ['#ef4444','#f59e0b','#6366f1','#10b981','#3b82f6','#a78bfa']
  const [hover, setHover] = useState(null)
  const [centerValue, setCenterValue] = useState(total)

  useEffect(()=>{
    if(hover==null){ setCenterValue(total); return }
    // animate center value to hovered value
    let raf
    const start = Date.now()
    const from = centerValue
    const to = hover.value
    const dur = 300
    const step = ()=>{
      const t = Math.min(1,(Date.now()-start)/dur)
      setCenterValue(Math.round((from + (to-from)*t)*100)/100)
      if(t<1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return ()=> cancelAnimationFrame(raf)
  },[hover])

  const segments = entries.map(([k,v],i)=>{
    const portion = v/total
    const start = angle
    const end = angle + portion*360
    angle = end
    return {key:k, value:v, start, end, color: colors[i%colors.length]}
  })

  return (
    <div style={{width:160,height:160,position:'relative'}} className="chart-animate chart-in">
      <svg viewBox="0 0 160 160" width={160} height={160} style={{overflow:'visible'}}>
        <defs>
          <filter id="segGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {segments.map((s,i)=> (
          <path key={s.key} d={describeDonutSegment(cx,cy,rOuter,rInner,s.start,s.end)} fill={s.color} stroke="#fff" strokeWidth={1} style={{transformOrigin:`${cx}px ${cy}px`, transition:'transform 180ms'}} onMouseEnter={()=>setHover(s)} onMouseLeave={()=>setHover(null)} transform={hover && hover.key===s.key ? `scale(1.03)` : undefined} />
        ))}
        {/* center circle to smooth hole */}
        <circle cx={cx} cy={cy} r={rInner-2} fill="rgba(255,255,255,0.75)" stroke="rgba(255,255,255,0.5)" />
      </svg>

      <div style={{position:'absolute',left:0,top:0,right:0,bottom:0,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:12,color:'rgba(15,23,42,0.7)'}}>Total</div>
          <div style={{fontSize:18,fontWeight:800,color:'var(--accent)',transition:'transform 180ms'}}>{`$${Number(centerValue).toFixed(2)}`}</div>
        </div>
      </div>
    </div>
  )
}
