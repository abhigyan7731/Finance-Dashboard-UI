import React from 'react'
import { useApp } from '../context/AppContext'

export default function History(){
  const { history, undoHistoryEntry, role } = useApp()

  return (
    <div className="card">
      <h3 style={{marginTop:0}}>Edit History</h3>
      <div style={{maxHeight:240,overflow:'auto'}}>
        {(!history || history.length===0) ? (
          <div className="small">No edits yet</div>
        ) : (
          history.map(entry=> (
            <div key={entry.id} style={{padding:'8px 0',borderBottom:'1px solid #eee',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{flex:1}}>
                {(() => {
                  const beforeCat = entry.before ? (entry.before.category || '(no category)') : '(created)'
                  const afterCat = entry.after ? (entry.after.category || '(no category)') : '(deleted)'
                  return (
                    <div style={{fontWeight:700}}>{beforeCat} → {afterCat}</div>
                  )
                })()}
                <div className="small">Tx: {entry.txId} · {new Date(entry.when).toLocaleString()}</div>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <div className="small">{entry.undone ? 'undone' : ''}</div>
                {role==='admin' && !entry.undone && (
                  <button className="btn-primary" onClick={()=>undoHistoryEntry(entry.id)}>Undo</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
