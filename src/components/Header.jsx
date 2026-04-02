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

      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <button className="btn-ghost" onClick={()=>setOpenSettings(s=>!s)} title="Open profile & settings">Profile</button>
      </div>
      {openSettings && <SettingsDrawer onClose={()=>setOpenSettings(false)} />}
    </div>
  )
}
