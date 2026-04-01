import React, { useMemo } from 'react'
import Header from './components/Header'
import SummaryCards from './components/SummaryCards'
import LineChart from './components/LineChart'
import PieChart from './components/PieChart'
import Transactions from './components/Transactions'
import Insights from './components/Insights'
import History from './components/History'
import { useApp } from './context/AppContext'
import QuickActions from './components/QuickActions'
import ProgressRing from './components/ProgressRing'
import SmartInsights from './components/SmartInsights'

function buildSeries(transactions){
  const byDate = [...transactions].sort((a,b)=> new Date(a.date)-new Date(b.date))
  let balance = 0
  const points = byDate.map(t=>{
    balance += t.amount
    return {date:t.date, value:Math.round(balance*100)/100}
  })
  return points
}

export default function App(){
  const { transactions } = useApp()
  const series = useMemo(()=> buildSeries(transactions),[transactions])
  const categoryMap = useMemo(()=>{
    const map = {}
    transactions.forEach(t=> map[t.category] = (map[t.category]||0) + Math.abs(t.amount))
    return map
  },[transactions])

  return (
    <div className="container">
      <Header />
      <QuickActions />
      <div className="grid" style={{gridTemplateColumns:'1fr',gap:16}}>
        <div className="card">
          <SummaryCards />
          <div style={{display:'flex',gap:16,marginTop:12,flexWrap:'wrap'}}>
            <div style={{flex:1,minWidth:260}}>
              <div className="small">Balance Trend</div>
              <LineChart series={series} />
            </div>
            <div style={{width:180}}>
              <div className="small">Spending Breakdown</div>
              <PieChart data={categoryMap} />
            </div>
          </div>
        </div>

        <div className="row">
          <div style={{flex:2}}>
            <Transactions />
          </div>
          <div style={{flex:1,display:'flex',flexDirection:'column',gap:12}}>
            <div style={{display:'grid',gap:12}}>
              <div style={{display:'flex',gap:12}}>
                <div style={{flex:1}}><ProgressRing progress={0.42} label="Save" subtitle="₹50,000" /></div>
                <div style={{flex:1}}><SmartInsights insights={[]} /></div>
              </div>
            </div>
            <Insights />
            <History />
          </div>
        </div>
      </div>
    </div>
  )
}
