import React from 'react'
import { useApp } from '../context/AppContext'

export default function QuickActions(){
  const { transactions, addTransaction } = useApp()

  const exportAll = ()=>{
    const rows = [['Date','Category','Type','Amount'], ...transactions.map(t=>[t.date,t.category,t.type,String(t.amount)])]
    const csv = rows.map(r=> r.map(cell=> `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_export_all_${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const addSample = ()=>{
    const t = { id: 't'+Date.now(), date: new Date().toISOString().slice(0,10), amount: -49.99, category: 'Sample', type: 'expense' }
    addTransaction(t)
  }

  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
      <div className="quick-actions">
        <button className="btn-primary" onClick={addSample}>Add Transaction</button>
        <button className="btn-primary" onClick={exportAll}>Export All</button>
        <button className="btn-ghost">Filter Tags</button>
      </div>
      <div style={{fontSize:13,color:'rgba(255,255,255,0.6)'}}>Simple / Advanced: <select style={{marginLeft:8}}><option>Simple</option><option>Advanced</option></select></div>
    </div>
  )
}
