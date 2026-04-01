import React, { createContext, useContext, useEffect, useState } from 'react'
import { initialData } from '../data/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }){
  const [role, setRole] = useState('viewer')
  const [transactions, setTransactions] = useState(initialData.transactions)
  const [filters, setFilters] = useState({ query: '', type: 'all' })
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
  },[])

  // Persist to localStorage on changes (client only)
  useEffect(()=>{
    if(typeof window === 'undefined') return
    localStorage.setItem('transactions', JSON.stringify(transactions))
  },[transactions])
  useEffect(()=>{
    if(typeof window === 'undefined') return
    localStorage.setItem('role', role)
  },[role])
  useEffect(()=>{
    if(typeof window === 'undefined') return
    localStorage.setItem('history', JSON.stringify(history))
  },[history])

  const addTransaction = (t) => setTransactions(s => [t, ...s])

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

  return (
    <AppContext.Provider value={{role,setRole,transactions,addTransaction,updateTransaction,filters,setFilters,history,undoHistoryEntry}}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = ()=> useContext(AppContext)
