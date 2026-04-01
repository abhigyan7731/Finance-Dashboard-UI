import React, { useMemo, useState } from 'react'
import { FixedSizeList as List } from 'react-window'
import { useApp } from '../context/AppContext'

function Row({t, role, onStartEdit}){
  const badgeClass = t.type === 'income' ? 'badge income' : 'badge expense'
  const amountClass = t.amount < 0 ? 'amount negative' : 'amount positive'
  return (
    <div className="tx-card">
      <div style={{minWidth:120}}>{t.date}</div>
      <div style={{flex:1}}>{t.category}</div>
      <div style={{width:100,textAlign:'center'}}><span className={badgeClass}>{t.type}</span></div>
      <div style={{width:110,textAlign:'right'}}><span className={amountClass}>{t.amount<0?`-$${Math.abs(t.amount).toFixed(2)}`:`$${t.amount.toFixed(2)}`}</span></div>
      <div style={{width:100,textAlign:'center'}}>
        {role==='admin' && <button className="btn-ghost" onClick={onStartEdit}>Edit</button>}
      </div>
    </div>
  )
}

// Editable row (renders when admin is editing this transaction)
function EditableRow({t, editForm, setEditForm, onSave, onCancel}){
  return (
    <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #eee',alignItems:'center'}}>
      <input style={{minWidth:120}} value={editForm.date} onChange={e=>setEditForm(f=>({...f,date:e.target.value}))} />
      <input style={{flex:1}} value={editForm.category} onChange={e=>setEditForm(f=>({...f,category:e.target.value}))} />
      <select style={{width:100}} value={editForm.type} onChange={e=>setEditForm(f=>({...f,type:e.target.value}))}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <input style={{width:110,textAlign:'right'}} value={editForm.amount} onChange={e=>setEditForm(f=>({...f,amount:e.target.value}))} />
      <div style={{width:100,textAlign:'center',display:'flex',gap:6,justifyContent:'center'}}>
        <button className="btn-primary" onClick={()=>onSave(t.id)}>Save</button>
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

export default function Transactions(){
  const { transactions, filters, setFilters, role, addTransaction, updateTransaction } = useApp()
  const [sortMode, setSortMode] = useState('date_desc')
  const [virtualize, setVirtualize] = useState(false)
  const [form, setForm] = useState({date:'',category:'',amount:'',type:'expense'})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({date:'',category:'',amount:'',type:'expense'})

  const filtered = useMemo(()=>{
    const q = (filters.query||'').toLowerCase().trim()
    const list = transactions.filter(t=>{
      if(filters.type!=='all' && t.type!==filters.type) return false
      if(q){
        if(t.category.toLowerCase().includes(q)) return true
        if(t.date.toLowerCase().includes(q)) return true
        if(String(t.amount).toLowerCase().includes(q)) return true
        return false
      }
      return true
    })

    return list.sort((a,b)=>{
      if(sortMode.startsWith('date')){
        return sortMode==='date_desc' ? new Date(b.date)-new Date(a.date) : new Date(a.date)-new Date(b.date)
      }
      if(sortMode.startsWith('amount')){
        return sortMode==='amount_desc' ? Math.abs(b.amount)-Math.abs(a.amount) : Math.abs(a.amount)-Math.abs(b.amount)
      }
      return 0
    })
  },[transactions,filters,sortMode])

  // pagination
  const total = filtered.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const paged = useMemo(()=>{
    const start = (page-1)*pageSize
    return filtered.slice(start, start+pageSize)
  },[filtered,page,pageSize])

  // Row renderer for react-window
  const RowVirtual = ({ index, style }) => {
    const t = filtered[index]
    return (
      <div style={style}>
        {editingId===t.id ? (
          <EditableRow t={t} editForm={editForm} setEditForm={setEditForm} onSave={(id)=>{ const payload = {date:editForm.date, category:editForm.category, type:editForm.type, amount: parseFloat(editForm.amount) * (editForm.type==='expense'? -1:1)}; updateTransaction(id,payload); setEditingId(null) }} onCancel={()=>setEditingId(null)} />
        ) : (
          <Row t={t} role={role} onStartEdit={()=>{ setEditingId(t.id); setEditForm({date:t.date,category:t.category,amount:Math.abs(t.amount),type:t.type}) }} />
        )}
      </div>
    )
  }

  // CSV export (exports filtered results)
  const exportCsv = ()=>{
    const rows = [['Date','Category','Type','Amount'], ...filtered.map(t=>[t.date,t.category,t.type,String(t.amount)])]
    const csv = rows.map(r=> r.map(cell=> `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_export_${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleAdd = (e)=>{
    e.preventDefault()
    const t = { id: 't'+Date.now(), date: form.date || new Date().toISOString().slice(0,10), amount: parseFloat(form.amount)* (form.type==='expense'? -1:1), category: form.category || 'Misc', type: form.type }
    addTransaction(t)
    setForm({date:'',category:'',amount:'',type:'expense'})
  }

  return (
    <div className="card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <h3 style={{margin:0}}>Transactions</h3>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <input style={{minWidth:180}} placeholder="Search (category or date)" value={filters.query} onChange={e=>setFilters(f=>({...f,query:e.target.value}))} />
          <select value={filters.type} onChange={e=>setFilters(f=>({...f,type:e.target.value}))}>
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select value={sortMode} onChange={e=>setSortMode(e.target.value)}>
            <option value="date_desc">Date: newest</option>
            <option value="date_asc">Date: oldest</option>
            <option value="amount_desc">Amount: high→low</option>
            <option value="amount_asc">Amount: low→high</option>
          </select>
        </div>
      </div>

      <div className="transactions-list">
          <div className="tx-row-header">
          <div style={{minWidth:120}}>Date</div>
          <div style={{flex:1}}>Category</div>
          <div style={{width:100,textAlign:'center'}}>Type</div>
          <div style={{width:110,textAlign:'right'}}>Amount</div>
        </div>
        {filtered.length===0 && <div className="small">No transactions found</div>}
        {virtualize ? (
          <div style={{height:380}}>
            <List height={380} itemCount={filtered.length} itemSize={52} width={'100%'}>
              {RowVirtual}
            </List>
          </div>
        ) : (
          paged.map(t=> (
            editingId===t.id ? (
              <EditableRow key={t.id} t={t} editForm={editForm} setEditForm={setEditForm} onSave={(id)=>{ const payload = {date:editForm.date, category:editForm.category, type:editForm.type, amount: parseFloat(editForm.amount) * (editForm.type==='expense'? -1:1)}; updateTransaction(id,payload); setEditingId(null) }} onCancel={()=>setEditingId(null)} />
            ) : (
              <Row key={t.id} t={t} role={role} onStartEdit={()=>{ setEditingId(t.id); setEditForm({date:t.date,category:t.category,amount:Math.abs(t.amount),type:t.type}) }} />
            )
          ))
        )}
      </div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <label style={{display:'flex',alignItems:'center',gap:6}}>
            <input type="checkbox" checked={virtualize} onChange={e=>{ setVirtualize(e.target.checked); setPage(1) }} />
            <span className="small">Virtualize list</span>
          </label>
          <button className="btn-ghost" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page<=1}>Prev</button>
          <div className="small">Page {page} / {pageCount}</div>
          <button className="btn-ghost" onClick={() => setPage(p => Math.min(pageCount, p+1))} disabled={page>=pageCount}>Next</button>
          <select value={pageSize} onChange={e=>{ setPageSize(Number(e.target.value)); setPage(1) }}>
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
          </select>
        </div>
        <div>
          <button className="btn-primary" onClick={exportCsv}>Export CSV</button>
        </div>
      </div>

      {role==='admin' && (
        <form onSubmit={handleAdd} style={{marginTop:12,display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:8}}>
          <input value={form.date} onChange={e=>setForm({...form,date:e.target.value})} placeholder="YYYY-MM-DD" />
          <input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="Category" />
          <input value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="Amount" />
            <div style={{display:'flex',gap:8}}>
            <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <button type="submit" className="btn-primary">Add</button>
          </div>
        </form>
      )}
    </div>
  )
}
