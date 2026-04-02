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
    <header className="fd-header header" style={{gap:12}}>
      <div className="fd-logo-wrap">
        <div className="fd-logo-mark" aria-hidden>
          <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="50%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
            </defs>
            <circle cx="32" cy="32" r="20" fill="url(#g1)" opacity="0.95" />
            <path d="M20 34c3-6 10-10 18-10" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
            <circle cx="44" cy="22" r="3" fill="white" opacity="0.9" />
          </svg>
        </div>
        <h1 className="fd-logo" style={{margin:0}}>Finance<br/>Dashboard <span className="fd-logo-accent"></span></h1>
        <span className="fd-logo-badge">v2.0 PRO</span>
        <div className="small" style={{marginTop:6}}>A simple interactive demo</div>
      </div>

      <div className="fd-header-right">
        <div className="fd-controls" style={{display:'flex',alignItems:'center',gap:12}}>
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
