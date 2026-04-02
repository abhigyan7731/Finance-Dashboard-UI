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
    <header className="fd-header header" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
      <div className="fd-logo-wrap">
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <h1 className="fd-logo" style={{margin:0}}>Finance <span className="fd-logo-accent">Dashboard</span></h1>
          <span className="fd-logo-badge">v2.0 PRO</span>
        </div>
        <div className="small" style={{marginTop:6}}>A simple interactive demo</div>
      </div>

      <div className="fd-controls" style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button className="btn-ghost" onClick={()=>setOpenSettings(s=>!s)} title="Open profile & settings" style={{display:'flex',alignItems:'center',gap:10}}>
            <div className="profile-avatar teal" style={{width:36,height:36,borderRadius:10}} aria-hidden>
              <div className="initials" style={{fontSize:12}}>JD</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
              <div style={{fontSize:12,fontWeight:700}}>Jordan Doe</div>
              <div className="small" style={{fontSize:11}}>Product Manager</div>
            </div>
          </button>
        </div>
      </div>
      {openSettings && <SettingsDrawer onClose={()=>setOpenSettings(false)} />}
    </header>
  )
}
