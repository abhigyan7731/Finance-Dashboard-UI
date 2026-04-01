import React from 'react'
import { useApp } from '../context/AppContext'

function format(n){
  const sign = n<0?'-':''
  return sign + '$' + Math.abs(n).toFixed(2)
}

export default function SummaryCards(){
  const { transactions } = useApp()
  const total = transactions.reduce((s,t)=>s + t.amount,0)
  const income = transactions.filter(t=>t.amount>0).reduce((s,t)=>s+t.amount,0)
  const expense = transactions.filter(t=>t.amount<0).reduce((s,t)=>s+t.amount,0)

  return (
    <div className="summary">
      <div className="card">
        <div className="small">Total Balance</div>
        <div className="big">{format(total)}</div>
      </div>
      <div className="card">
        <div className="small">Income</div>
        <div className="big">{format(income)}</div>
      </div>
      <div className="card">
        <div className="small">Expenses</div>
        <div className="big">{format(expense)}</div>
      </div>
    </div>
  )
}
