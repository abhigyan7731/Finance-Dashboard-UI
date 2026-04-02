import React, {useState} from 'react'
import { useApp } from '../context/AppContext'

export default function QuickActions(){
  const { transactions, addTransaction, setRangePreset, setRole, role } = useApp()
  const [mode, setMode] = useState('30')

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
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,gap:12}}>
      <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <label className="small" style={{marginRight:6}}>Range</label>
          <select value={mode} onChange={e=>{ setMode(e.target.value); setRangePreset(e.target.value) }}>
            <option value="today">Today</option>
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="this_month">This month</option>
            <option value="year">This year</option>
          </select>
        </div>

        <div style={{display:'flex',gap:6}}>
          <button className="chip" onClick={()=>{ setRangePreset('7'); setMode('7') }}>7 days</button>
          <button className="chip" onClick={()=>{ setRangePreset('30'); setMode('30') }}>30 days</button>
          <button className="chip" onClick={()=>{ setRangePreset('this_month'); setMode('this_month') }}>This month</button>
        </div>

        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <label className="small">Role</label>
          <select value={role} onChange={e=>setRole(e.target.value)}>
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <button className="btn-primary" onClick={addSample}>Add Transaction</button>
        <button className="btn-primary" onClick={exportAll}>Export</button>
        <button className="btn-ghost">Filters</button>
      </div>
    </div>
  )
}
