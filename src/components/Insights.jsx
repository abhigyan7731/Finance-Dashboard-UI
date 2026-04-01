import React, { useMemo } from 'react'
import { useApp } from '../context/AppContext'

function fmt(n){ return '$' + Number(n).toFixed(2) }

export default function Insights(){
  const { transactions, filteredTransactions, dateRange } = useApp()
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

  // determine current period from dateRange if available, otherwise use current month
  const { periodFrom, periodTo, prevFrom, prevTo } = useMemo(()=>{
    const ms = 24*60*60*1000
    if(dateRange && dateRange.from && dateRange.to){
      const from = new Date(dateRange.from); from.setHours(0,0,0,0)
      const to = new Date(dateRange.to); to.setHours(23,59,59,999)
      const len = Math.round((to - from) / ms) + 1
      const prevTo = new Date(from); prevTo.setDate(prevTo.getDate() - 1); prevTo.setHours(23,59,59,999)
      const prevFrom = new Date(prevTo); prevFrom.setDate(prevFrom.getDate() - (len-1)); prevFrom.setHours(0,0,0,0)
      return { periodFrom: from, periodTo: to, prevFrom, prevTo }
    }
    // default: current calendar month
    const now = new Date()
    const from = new Date(now.getFullYear(), now.getMonth(), 1); from.setHours(0,0,0,0)
    const to = new Date(now.getFullYear(), now.getMonth()+1, 0); to.setHours(23,59,59,999)
    const prevTo = new Date(from); prevTo.setDate(prevTo.getDate() - 1); prevTo.setHours(23,59,59,999)
    const prevFrom = new Date(prevTo); prevFrom.setDate(1); prevFrom.setHours(0,0,0,0)
    return { periodFrom: from, periodTo: to, prevFrom, prevTo }
  },[dateRange])

  // top categories in current period (tx is already filtered when dateRange is set)
  const topThisPeriod = useMemo(()=>{
    const map = {}
    tx.filter(t=>t.amount<0).forEach(t=> map[t.category] = (map[t.category]||0) + Math.abs(t.amount))
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([cat,amt])=>({cat,amt}))
  },[tx])

  // compute previous period totals for same categories
  const topWithChange = useMemo(()=>{
    return topThisPeriod.map(({cat,amt})=>{
      let prevAmt = 0
      transactions.forEach(t=>{
        const d = new Date(t.date); d.setHours(12,0,0,0)
        if(d >= prevFrom && d <= prevTo && t.category===cat && t.amount<0) prevAmt += Math.abs(t.amount)
      })
      const diff = amt - prevAmt
      const pct = prevAmt === 0 ? null : (diff / prevAmt) * 100
      return {cat, amt, prevAmt, diff, pct}
    })
  },[topThisPeriod,transactions,prevFrom,prevTo])

  // Upcoming bills: dueDate within next 30 days from today
  const upcomingBills = useMemo(()=>{
    const out = []
    const today = new Date(); today.setHours(0,0,0,0)
    const end = new Date(today); end.setDate(end.getDate()+30)
    transactions.forEach(t=>{
      if(t.dueDate && t.type==='expense'){
        const d = new Date(t.dueDate)
        if(d >= today && d <= end) out.push({...t, dueDate: t.dueDate})
      }
    })
    out.sort((a,b)=> new Date(a.dueDate) - new Date(b.dueDate))
    return out
  },[transactions])

  const anomalies = useMemo(()=>{
    const list = tx.filter(t=> t.amount<0)
    list.sort((a,b)=> Math.abs(b.amount) - Math.abs(a.amount))
    return list.slice(0,5)
  },[tx])

  const noData = transactions.length === 0

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
              <div style={{fontWeight:700}}>{fmt(totals.income)}</div>
            </div>
            <div>
              <div className="small">Total Expenses</div>
              <div style={{fontWeight:700}}>{fmt(totals.expense)}</div>
            </div>
            <div>
              <div className="small">Balance</div>
              <div style={{fontWeight:700}}>{fmt(totals.balance)}</div>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginTop:12}}>
            <div>
              <div className="small">Upcoming bills (30 days)</div>
              {upcomingBills.length===0 ? <div className="small">No upcoming bills</div> : (
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {upcomingBills.map(b=> (
                    <div key={b.id} style={{display:'flex',justifyContent:'space-between'}}>
                      <div style={{fontWeight:600}}>{b.category}</div>
                      <div className="small">{b.dueDate} — {fmt(Math.abs(b.amount))}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="small">Top categories (period)</div>
              {topWithChange.length===0 ? <div className="small">No spending in period</div> : (
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {topWithChange.map(t=> (
                    <div key={t.cat} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div>
                        <div style={{fontWeight:700}}>{t.cat}</div>
                        <div className="small">{fmt(t.amt)}</div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontWeight:700,color: t.diff>0 ? '#16a34a' : (t.diff<0 ? '#ef4444' : 'inherit')}}>
                          {t.pct===null? '—' : (
                            <span>{t.diff>0? '▲': (t.diff<0? '▼':'—')} {Math.abs(t.pct).toFixed(1)}%</span>
                          )}
                        </div>
                        <div className="small">vs previous period</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="small">Anomalies — largest expenses (period)</div>
              {anomalies.length===0 ? <div className="small">No large expenses in period</div> : (
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {anomalies.map(a=> (
                    <div key={a.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div style={{fontWeight:700}}>{a.category}</div>
                      <div style={{display:'flex',gap:8,alignItems:'center'}}>
                        <div className="anomaly-badge" style={{color:'#fff',background:'#c0392b',padding:'4px 8px',borderRadius:8}}>-{fmt(Math.abs(a.amount))}</div>
                        <div className="small">{a.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{marginTop:12}} className="small">Highest spending category (view)</div>
          <div style={{fontWeight:700}}>{highestCategory.cat} — {fmt(highestCategory.amount)}</div>

        </>
      )}
    </div>
  )
}
