import React, { useMemo } from 'react'
import { useApp } from '../context/AppContext'

export default function Insights(){
  const { transactions, filteredTransactions } = useApp()
  const tx = filteredTransactions || transactions

  const totals = useMemo(()=>{
    const income = tx.filter(t=>t.amount>0).reduce((s,t)=>s+t.amount,0)
    const expense = tx.filter(t=>t.amount<0).reduce((s,t)=>s+Math.abs(t.amount),0)
    return {income, expense, balance: income - expense}
  },[tx])

  const highestCategory = useMemo(()=>{
    const map = {}
    tx.filter(t=>t.amount<0).forEach(t=> map[t.category] = (map[t.category]||0) + Math.abs(t.amount))
    const entries = Object.entries(map)
    if(entries.length===0) return {cat:'-', amount:0}
    entries.sort((a,b)=>b[1]-a[1])
    return {cat:entries[0][0], amount:entries[0][1]}
  },[tx])

  const monthlyCompare = useMemo(()=>{
    const perMonth = {}
    tx.forEach(t=>{
      const m = t.date.slice(0,7)
      perMonth[m] = (perMonth[m]||0) + t.amount
    })
    const months = Object.keys(perMonth).sort()
    return {months, perMonth}
  },[tx])

  // month over month change (last two months)
  const mom = useMemo(()=>{
    const months = Object.keys(monthlyCompare.perMonth||{}).sort()
    if(months.length < 2) return null
    const last = monthlyCompare.perMonth[months[months.length-1]]
    const prev = monthlyCompare.perMonth[months[months.length-2]]
    const diff = last - prev
    const pct = prev === 0 ? null : (diff / Math.abs(prev)) * 100
    return {months, lastMonth: months[months.length-1], prevMonth: months[months.length-2], diff, pct}
  },[monthlyCompare])

  const noData = tx.length === 0

  return (
    <div className="card">
      <h3 style={{marginTop:0}}>Insights</h3>
      {noData ? (
        <div className="small">No transaction data to show insights.</div>
      ) : (
        <>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            <div>
              <div className="small">Total Income</div>
              <div style={{fontWeight:700}}>${totals.income.toFixed(2)}</div>
            </div>
            <div>
              <div className="small">Total Expenses</div>
              <div style={{fontWeight:700}}>${totals.expense.toFixed(2)}</div>
            </div>
            <div>
              <div className="small">Balance</div>
              <div style={{fontWeight:700}}>${totals.balance.toFixed(2)}</div>
            </div>
          </div>

          <div style={{marginTop:12}} className="small">Highest spending category</div>
          <div style={{fontWeight:700}}>{highestCategory.cat} — ${highestCategory.amount.toFixed(2)}</div>

          <div style={{marginTop:12}} className="small">Monthly totals</div>
          <div style={{maxHeight:160,overflow:'auto'}}>
            {monthlyCompare.months.map(m=> (
              <div key={m} style={{display:'flex',justifyContent:'space-between'}}>
                <div>{m}</div>
                <div style={{fontWeight:600}}>${monthlyCompare.perMonth[m].toFixed(2)}</div>
              </div>
            ))}
          </div>

          {mom && (
            <div style={{marginTop:12}}>
              <div className="small">Month-over-month change</div>
              <div style={{fontWeight:700}}>
                {mom.lastMonth}: ${mom.diff.toFixed(2)} {mom.pct!==null ? `(${mom.pct.toFixed(1)}%)` : ''} vs {mom.prevMonth}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
