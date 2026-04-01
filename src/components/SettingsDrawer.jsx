import React, {useEffect, useState} from 'react'
import { useApp } from '../context/AppContext'

export default function SettingsDrawer({onClose}){
  const { } = useApp()
  const [currency, setCurrency] = useState(()=> localStorage.getItem('pref_currency') || 'USD')
  const [locale, setLocale] = useState(()=> localStorage.getItem('pref_locale') || 'en-US')
  const [firstDay, setFirstDay] = useState(()=> localStorage.getItem('pref_firstDay') || '0')
  const [dark, setDark] = useState(()=> localStorage.getItem('pref_dark') === '1')

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
      <div className="modal">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h4 style={{margin:0}}>Profile & Settings</h4>
          <button className="btn-ghost" onClick={onClose}>Close</button>
        </div>
        <div style={{marginTop:12,display:'grid',gap:8}}>
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

          <label style={{display:'flex',alignItems:'center',gap:8}}>
            <input type="checkbox" checked={dark} onChange={e=>setDark(e.target.checked)} />
            <span className="small">Dark mode</span>
          </label>

          <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:8}}>
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={save}>Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}
