import React from 'react'
import { useApp } from '../context/AppContext'

export default function Header(){
  const { role, setRole } = useApp()
  return (
    <div className="header">
      <div>
        <h1 style={{margin:0}}>Finance Dashboard</h1>
        <div className="small">A simple interactive demo</div>
      </div>
      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <label className="small">Role</label>
        <select value={role} onChange={e=>setRole(e.target.value)}>
          <option value="viewer">Viewer</option>
          <option value="admin">Admin</option>
        </select>
      </div>
    </div>
  )
}
