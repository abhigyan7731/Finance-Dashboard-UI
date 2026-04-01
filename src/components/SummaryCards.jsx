import React, {useMemo, useEffect, useRef, useState} from 'react'
import { useApp } from '../context/AppContext'

function format(n){
  const sign = n<0?'-':''
  return sign + '$' + Math.abs(n).toFixed(2)
}

export default function SummaryCards(){
  const { transactions } = useApp()
  const total = transactions.reduce((s,t)=>s + t.amount,0)
  const income = transactions.filter(t=>t.amount>0).reduce((s,t)=>s+t.amount,0)
  const expense = transactions.filter(t=>t.amount<0).reduce((s,t)=>s+t.amount,0)
  // helper: last N days totals
  const lastNDays = (n=7)=>{
    const days = []
    for(let i=n-1;i>=0;i--){
      const d = new Date(); d.setDate(d.getDate()-i)
      days.push(d.toISOString().slice(0,10))
    }
    return days
  }

  const sparkData = useMemo(()=>{
    const days = lastNDays(7)
    const map = {}
    days.forEach(d=>map[d]=0)
    transactions.forEach(t=>{ if(map[t.date]!==undefined) map[t.date]+=t.amount })
    return days.map(d=>map[d])
  },[transactions])

  // pulse when values change
  const totalRef = useRef(total)
  const [pulseKey, setPulseKey] = useState(0)
  useEffect(()=>{ if(totalRef.current !== total){ setPulseKey(k=>k+1); totalRef.current = total } },[total])

  const Card = ({label,amount,spark})=>{
    return (
      <div className="card" style={{display:'flex',flexDirection:'column',gap:8}}>
        <div className="hero-label small">{label}</div>
        <div className={`hero-amount ${pulseKey%2===0?'':'pulse'}`}>{format(amount)}</div>
        <div className="sparkline">
          <svg viewBox="0 0 100 28" width="100%" height={28} preserveAspectRatio="none">
            <polyline fill="none" stroke="rgba(15,23,42,0.12)" strokeWidth={2} points={spark.map((v,i)=>`${(i/(spark.length-1||1))*100},${28 - ((v - Math.min(...spark)) / ((Math.max(...spark)-Math.min(...spark))||1))*24}`).join(' ')} />
            <polyline fill="none" stroke="var(--accent)" strokeWidth={2} points={spark.map((v,i)=>`${(i/(spark.length-1||1))*100},${28 - ((v - Math.min(...spark)) / ((Math.max(...spark)-Math.min(...spark))||1))*24}`).join(' ')} />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="summary" style={{display:'flex',gap:12}}>
      <Card label="Total Balance" amount={total} spark={sparkData} />
      <Card label="Income" amount={income} spark={sparkData.map(v=> v>0?v:0)} />
      <Card label="Expenses" amount={Math.abs(expense)} spark={sparkData.map(v=> v<0?Math.abs(v):0)} />
    </div>
  )
}
