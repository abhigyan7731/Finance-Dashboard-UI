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
    <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #eee',alignItems:'center',gap:8}}>
      <input style={{minWidth:110}} value={editForm.date} onChange={e=>setEditForm(f=>({...f,date:e.target.value}))} />
      <input style={{flex:1}} value={editForm.category} onChange={e=>setEditForm(f=>({...f,category:e.target.value}))} />
      <select style={{width:100}} value={editForm.type} onChange={e=>setEditForm(f=>({...f,type:e.target.value}))}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <input style={{width:90,textAlign:'right'}} value={editForm.amount} onChange={e=>setEditForm(f=>({...f,amount:e.target.value}))} />
      <input type="date" style={{width:130}} value={editForm.dueDate||''} onChange={e=>setEditForm(f=>({...f,dueDate:e.target.value}))} />
      <input placeholder="notes" style={{width:160}} value={editForm.notes||''} onChange={e=>setEditForm(f=>({...f,notes:e.target.value}))} />
      <div style={{width:140,textAlign:'center',display:'flex',gap:6,justifyContent:'center'}}>
        <button className="btn-primary" onClick={()=>onSave(t.id)}>Save</button>
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

export default function Transactions(){
  const { transactions, filters, setFilters, role, addTransaction, updateTransaction, deleteTransaction, history } = useApp()
  const [sortMode, setSortMode] = useState('date_desc')
  const [virtualize, setVirtualize] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [amountMin, setAmountMin] = useState('')
  const [amountMax, setAmountMax] = useState('')
  const [categoryMulti, setCategoryMulti] = useState([])
  const [notesQuery, setNotesQuery] = useState('')
  const [form, setForm] = useState({date:'',category:'',amount:'',type:'expense', dueDate:'', notes:''})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({date:'',category:'',amount:'',type:'expense',dueDate:'',notes:''})
  const [confirmState, setConfirmState] = useState({show:false,type:null,ids:[]})

  const categories = useMemo(()=>{
    const set = new Set(); transactions.forEach(t=> set.add(t.category)); return Array.from(set).sort()
  },[transactions])

  const filtered = useMemo(()=>{
    const q = (filters.query||'').toLowerCase().trim()
    const list = transactions.filter(t=>{
      if(filters.type && filters.type!=='all' && t.type!==filters.type) return false
      if(q){
        if((t.category||'').toLowerCase().includes(q)) return true
        if((t.date||'').toLowerCase().includes(q)) return true
        if(String(t.amount).toLowerCase().includes(q)) return true
      }
      // advanced filters
      if(amountMin){ if(t.amount < Number(amountMin)) return false }
      if(amountMax){ if(t.amount > Number(amountMax)) return false }
      if(categoryMulti && categoryMulti.length>0){ if(!categoryMulti.includes(t.category)) return false }
      if(notesQuery){ if(!(t.notes||'').toLowerCase().includes(notesQuery.toLowerCase())) return false }

      // if q existed and matched already we'd have returned true above; otherwise allow
      if(q) return (t.category||'').toLowerCase().includes(q) || (t.date||'').toLowerCase().includes(q) || String(t.amount).toLowerCase().includes(q)
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
  },[transactions,filters,sortMode,amountMin,amountMax,categoryMulti,notesQuery])

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
          <EditableRow t={t} editForm={editForm} setEditForm={setEditForm} onSave={(id)=>{ const payload = {date:editForm.date, category:editForm.category, type:editForm.type, amount: parseFloat(editForm.amount) * (editForm.type==='expense'? -1:1), dueDate: editForm.dueDate||undefined, notes: editForm.notes||''}; updateTransaction(id,payload); setEditingId(null) }} onCancel={()=>setEditingId(null)} />
        ) : (
          <Row t={t} role={role} onStartEdit={()=>{ setEditingId(t.id); setEditForm({date:t.date,category:t.category,amount:Math.abs(t.amount),type:t.type,dueDate:t.dueDate||'',notes:t.notes||''}) }} />
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

  const toggleSelect = (id)=>{
    setSelectedIds(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id])
  }
  const toggleSelectAll = ()=>{
    if(selectedIds.length === filtered.length) setSelectedIds([])
    else setSelectedIds(filtered.map(t=>t.id))
  }

  const bulkDelete = ()=>{
    if(selectedIds.length===0) return
    setConfirmState({show:true,type:'bulk',ids:selectedIds})
  }

  const bulkTag = (category)=>{
    selectedIds.forEach(id=> updateTransaction(id,{category}))
    setSelectedIds([])
  }

  const performDelete = (ids)=>{
    ids.forEach(id=> deleteTransaction(id))
    setSelectedIds([])
    setConfirmState({show:false,type:null,ids:[]})
  }

  const handleAdd = (e)=>{
    e.preventDefault()
    const t = { id: 't'+Date.now(), date: form.date || new Date().toISOString().slice(0,10), amount: parseFloat(form.amount)* (form.type==='expense'? -1:1), category: form.category || 'Misc', type: form.type, dueDate: form.dueDate || undefined, notes: form.notes || '' }
    addTransaction(t)
    setForm({date:'',category:'',amount:'',type:'expense',dueDate:'',notes:''})
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
          <button className="btn-ghost" onClick={()=>setAdvancedOpen(a=>!a)}>{advancedOpen? 'Hide advanced':'Advanced'}</button>
        </div>
      </div>

      {advancedOpen && (
        <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            <div className="small">Amount</div>
            <input placeholder="min" style={{width:80}} value={amountMin} onChange={e=>setAmountMin(e.target.value)} />
            <input placeholder="max" style={{width:80}} value={amountMax} onChange={e=>setAmountMax(e.target.value)} />
          </div>
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            <div className="small">Categories</div>
            <select multiple value={categoryMulti} onChange={e=> setCategoryMulti(Array.from(e.target.selectedOptions).map(o=>o.value))} style={{minWidth:160}}>
              {categories.map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            <div className="small">Notes</div>
            <input placeholder="Search notes" value={notesQuery} onChange={e=>setNotesQuery(e.target.value)} />
          </div>
        </div>
      )}

      <div className="transactions-list">
          <div className="tx-row-header" style={{display:'flex',alignItems:'center'}}>
            <div style={{width:40,textAlign:'center'}}><input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length===filtered.length && filtered.length>0} /></div>
            <div style={{minWidth:120}}>Date</div>
            <div style={{flex:1}}>Category</div>
            <div style={{width:100,textAlign:'center'}}>Type</div>
            <div style={{width:110,textAlign:'right'}}>Amount</div>
            <div style={{width:160,textAlign:'center'}}>History</div>
          </div>

          {selectedIds.length>0 && (
            <div style={{display:'flex',gap:8,alignItems:'center',padding:'8px 0'}}>
              <div className="small">{selectedIds.length} selected</div>
              <button className="btn-ghost" onClick={bulkDelete}>Delete</button>
              <select onChange={e=>bulkTag(e.target.value)} defaultValue="">
                <option value="">Tag category...</option>
                {categories.map(c=> <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
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
              <EditableRow key={t.id} t={t} editForm={editForm} setEditForm={setEditForm} onSave={(id)=>{ const payload = {date:editForm.date, category:editForm.category, type:editForm.type, amount: parseFloat(editForm.amount) * (editForm.type==='expense'? -1:1), dueDate: editForm.dueDate||undefined, notes: editForm.notes||''}; updateTransaction(id,payload); setEditingId(null) }} onCancel={()=>setEditingId(null)} />
            ) : (
              <div key={t.id} style={{display:'flex',alignItems:'center'}}>
                <div style={{width:40,textAlign:'center'}}><input type="checkbox" checked={selectedIds.includes(t.id)} onChange={()=>toggleSelect(t.id)} /></div>
                <Row t={t} role={role} onStartEdit={()=>{ setEditingId(t.id); setEditForm({date:t.date,category:t.category,amount:Math.abs(t.amount),type:t.type,dueDate:t.dueDate||'',notes:t.notes||''}) }} />
                <div style={{width:160,textAlign:'center'}}>
                  {(() => {
                    const entries = history.filter(h=>h.txId===t.id).sort((a,b)=> new Date(b.when)-new Date(a.when))
                    if(entries.length===0) return <div className="small">-</div>
                    const last = entries[0]
                    return <div className="small">{new Date(last.when).toLocaleString()}</div>
                  })()}
                </div>
                <div style={{width:80,textAlign:'center'}}>
                  <button className="btn-ghost" onClick={()=> setConfirmState({show:true,type:'single',ids:[t.id]}) }>Delete</button>
                </div>
              </div>
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

      {confirmState.show && (
        <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(2,6,23,0.5)'}}>
          <div className="card" style={{maxWidth:440,width:'90%'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h4 style={{margin:0}}>Confirm Delete</h4>
              <div className="small">{confirmState.ids.length} item(s)</div>
            </div>
            <div style={{marginTop:12}} className="small">Are you sure you want to delete {confirmState.type==='bulk' ? `${confirmState.ids.length} transactions` : 'this transaction'}? This action can be undone from History.</div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:12}}>
              <button className="btn-ghost" onClick={()=>setConfirmState({show:false,type:null,ids:[]})}>Cancel</button>
              <button className="btn-primary" onClick={()=>performDelete(confirmState.ids)}>Delete</button>
            </div>
          </div>
        </div>
      )}

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
