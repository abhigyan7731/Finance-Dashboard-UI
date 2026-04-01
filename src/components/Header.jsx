import React, {useState} from 'react'
import { useApp } from '../context/AppContext'
import SettingsDrawer from './SettingsDrawer'

export default function Header(){
  const { role, setRole, dateRange, setRangePreset, setDateRange } = useApp()
  const { lastUpdated } = useApp()
  const [mode, setMode] = useState(dateRange?.preset || '30')
  const [custom, setCustom] = useState({from: dateRange?.from || '', to: dateRange?.to || ''})
  const [openSettings, setOpenSettings] = useState(false)

  const applyCustom = ()=>{
    setRangePreset('custom', {from: custom.from, to: custom.to})
    setMode('custom')
  }

  return (
    <div className="header" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
      <div>
        <h1 style={{margin:0,color:'#ffffff'}}>Finance Dashboard</h1>
        <div className="small">A simple interactive demo</div>
      </div>

      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <label className="small" style={{marginRight:6}}>Range</label>
            <select value={mode} onChange={e=>{ setMode(e.target.value); if(e.target.value !== 'custom') setRangePreset(e.target.value) }}>
              <option value="this_week">This week</option>
              <option value="this_month">This month</option>
              <option value="custom">Custom</option>
            </select>
            <div style={{display:'flex',gap:6,marginLeft:8,alignItems:'center'}}>
              <button className="chip" onClick={()=>{ setRangePreset('today'); setMode('today') }}>Today</button>
              <button className="chip" onClick={()=>{ setRangePreset('7'); setMode('7') }}>7 days</button>
              <button className="chip" onClick={()=>{ setRangePreset('30'); setMode('30') }}>30 days</button>
              <button className="chip" onClick={()=>{ setRangePreset('year'); setMode('year') }}>This year</button>
            </div>
          </div>

          {mode === 'custom' && (
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <input type="date" value={custom.from} onChange={e=>setCustom(c=>({...c,from:e.target.value}))} />
              <input type="date" value={custom.to} onChange={e=>setCustom(c=>({...c,to:e.target.value}))} />
              <button className="btn-ghost" onClick={applyCustom}>Apply</button>
            </div>
          )}

        </div>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end'}}>
            {role==='viewer' && lastUpdated && <div className="small">Last updated at {new Date(lastUpdated).toLocaleString()}</div>}
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <button className="btn-ghost" onClick={()=>setOpenSettings(s=>!s)} title="Open profile & settings">Profile</button>
              <label className="small">Role</label>
              <select value={role} onChange={e=>setRole(e.target.value)}>
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {openSettings && <SettingsDrawer onClose={()=>setOpenSettings(false)} />}
    </div>
  )
}
