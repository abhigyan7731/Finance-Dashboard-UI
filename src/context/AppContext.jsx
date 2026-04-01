import React, { createContext, useContext, useEffect, useState } from 'react'
import { initialData } from '../data/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }){
  const [role, setRole] = useState('viewer')
  const [transactions, setTransactions] = useState(initialData.transactions)
  const [filters, setFilters] = useState({ query: '', type: 'all' })
  const [dateRange, setDateRange] = useState(()=>{
    // default: last 30 days
    const end = new Date()
    const start = new Date(); start.setDate(end.getDate()-29)
    return { from: start.toISOString().slice(0,10), to: end.toISOString().slice(0,10), preset: '30' }
  })
  // helper to set ranges by preset keys
  const setRangePreset = (key, custom={})=>{
    const today = new Date()
    let from, to = today
    if(key === 'today'){
      from = new Date(today)
    } else if(key === '7'){
      from = new Date(); from.setDate(today.getDate()-6)
    } else if(key === '30'){
      from = new Date(); from.setDate(today.getDate()-29)
    } else if(key === 'year'){
      from = new Date(today.getFullYear(),0,1)
    } else if(key === 'this_week'){
      const d = new Date(today)
      const day = d.getDay() || 7 // make Sunday=7
      from = new Date(d); from.setDate(d.getDate() - (day-1))
    } else if(key === 'this_month'){
      from = new Date(today.getFullYear(), today.getMonth(), 1)
    } else if(key === 'custom'){
      from = custom.from ? new Date(custom.from) : new Date(today)
      to = custom.to ? new Date(custom.to) : today
    } else {
      // fallback last 30 days
      from = new Date(); from.setDate(today.getDate()-29)
    }
    setDateRange({ from: from.toISOString().slice(0,10), to: to.toISOString().slice(0,10), preset: key })
  }
  const [history, setHistory] = useState(() => {
    try{
      const raw = typeof window !== 'undefined' ? localStorage.getItem('history') : null
      return raw ? JSON.parse(raw) : []
    }catch(e){ return [] }
  })

  // Load from localStorage on client only
  useEffect(()=>{
    if(typeof window === 'undefined') return
    const savedRole = localStorage.getItem('role')
    if(savedRole) setRole(savedRole)
    const raw = localStorage.getItem('transactions')
    if(raw) setTransactions(JSON.parse(raw))
    const dr = localStorage.getItem('dateRange')
    if(dr) setDateRange(JSON.parse(dr))
  },[])

  // Persist to localStorage on changes (client only)
  useEffect(()=>{
    if(typeof window === 'undefined') return
    localStorage.setItem('transactions', JSON.stringify(transactions))
  },[transactions])
  useEffect(()=>{
    if(typeof window === 'undefined') return
    localStorage.setItem('dateRange', JSON.stringify(dateRange))
  },[dateRange])
  useEffect(()=>{
    if(typeof window === 'undefined') return
    localStorage.setItem('role', role)
  },[role])
  useEffect(()=>{
    if(typeof window === 'undefined') return
    localStorage.setItem('history', JSON.stringify(history))
  },[history])

  const addTransaction = (t) => setTransactions(s => [t, ...s])

  const deleteTransaction = (id) => {
    setTransactions(s => {
      const prev = s.find(x=>x.id===id)
      if(!prev) return s
      // push history entry for deletion
      pushHistoryEntry({ id: Date.now(), txId: id, before: prev, after: null, when: new Date().toISOString(), undone: false })
      return s.filter(x=> x.id !== id)
    })
  }

  const pushHistoryEntry = (entry) => setHistory(h => [entry, ...h])

  const updateTransaction = (id, patch) => {
    setTransactions(s => {
      const prev = s.find(x=>x.id===id)
      if(!prev) return s
      const next = {...prev, ...patch}
      // push history entry
      pushHistoryEntry({ id: Date.now(), txId: id, before: prev, after: next, when: new Date().toISOString(), undone: false })
      return s.map(x=> x.id===id ? next : x)
    })
  }

  const undoHistoryEntry = (entryId) => {
    setHistory(h => h.map(e => e.id===entryId ? {...e, undone: true} : e))
    // find entry to revert
    const entry = history.find(e=>e.id===entryId)
    if(!entry) return
    setTransactions(s => s.map(x=> x.id===entry.txId ? entry.before : x))
  }

  // filtered transactions based on dateRange (inclusive)
  const filteredTransactions = React.useMemo(()=>{
    if(!dateRange) return transactions
    const from = new Date(dateRange.from)
    const to = new Date(dateRange.to)
    // normalize times
    from.setHours(0,0,0,0)
    to.setHours(23,59,59,999)
    return transactions.filter(t=>{
      const d = new Date(t.date)
      return d >= from && d <= to
    })
  },[transactions,dateRange])

  return (
    <AppContext.Provider value={{role,setRole,transactions,addTransaction,updateTransaction,filters,setFilters,history,undoHistoryEntry,dateRange,setDateRange,setRangePreset,filteredTransactions}}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = ()=> useContext(AppContext)
