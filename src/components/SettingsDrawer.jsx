import React, {useEffect, useState} from 'react'
import { useApp } from '../context/AppContext'

export default function SettingsDrawer({onClose}){
  const { } = useApp()
  const [currency, setCurrency] = useState(()=> localStorage.getItem('pref_currency') || 'USD')
  const [locale, setLocale] = useState(()=> localStorage.getItem('pref_locale') || 'en-US')
  const [firstDay, setFirstDay] = useState(()=> localStorage.getItem('pref_firstDay') || '0')
  const [dark, setDark] = useState(()=> localStorage.getItem('pref_dark') === '1')
  const [accent, setAccent] = useState(()=> localStorage.getItem('pref_accent') || 'teal')

  useEffect(()=>{ if(dark) document.body.classList.add('dark') ; else document.body.classList.remove('dark') },[dark])

  const save = ()=>{
    localStorage.setItem('pref_currency', currency)
    localStorage.setItem('pref_locale', locale)
    localStorage.setItem('pref_firstDay', firstDay)
    localStorage.setItem('pref_dark', dark? '1':'0')
    if(onClose) onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal profile-panel">
        <div className="profile-header">
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div className={`profile-avatar ${accent}`} aria-hidden>
              <div className="initials">JD</div>
            </div>
            <div>
              <h3 style={{margin:0}}>Jordan Doe</h3>
              <div className="small">Member since 2021 · Premium</div>
            </div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <button className="btn-ghost" onClick={onClose}>Close</button>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-grid">
            <div>
              <label className="small">Currency</label>
              <select value={currency} onChange={e=>setCurrency(e.target.value)}>
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="EUR">EUR</option>
              </select>

              <label className="small">Locale</label>
              <select value={locale} onChange={e=>setLocale(e.target.value)}>
                <option value="en-US">en-US</option>
                <option value="en-GB">en-GB</option>
                <option value="hi-IN">hi-IN</option>
              </select>

              <label className="small">First day of week</label>
              <select value={firstDay} onChange={e=>setFirstDay(e.target.value)}>
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
              </select>

              <label className="small" style={{marginTop:8}}>Accent</label>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <button className={`accent-pill teal ${accent==='teal'?'active':''}`} onClick={()=>setAccent('teal')}></button>
                <button className={`accent-pill purple ${accent==='purple'?'active':''}`} onClick={()=>setAccent('purple')}></button>
                <button className={`accent-pill neon ${accent==='neon'?'active':''}`} onClick={()=>setAccent('neon')}></button>
              </div>
            </div>

            <div>
              <label className="small">Appearance</label>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                <label style={{display:'flex',alignItems:'center',gap:8}}>
                  <input type="checkbox" checked={dark} onChange={e=>setDark(e.target.checked)} />
                  <span className="small">Dark mode</span>
                </label>

                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <div className="small">Profile glow</div>
                  <div style={{flex:1}}>
                    <input type="range" min={0} max={100} defaultValue={40} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{display:'flex',justifyContent:'flex-end',gap:12,marginTop:16}}>
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary save-btn" onClick={()=>{ save(); localStorage.setItem('pref_accent',accent) }}>Save settings</button>
          </div>
        </div>
      </div>
    </div>
  )
}
