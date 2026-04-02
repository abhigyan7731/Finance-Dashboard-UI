import React, { useMemo } from 'react'
import Header from './components/Header'
import SummaryCards from './components/SummaryCards'
import LineChart from './components/LineChart'
import PieChart from './components/PieChart'
import MiniSpark from './components/MiniSpark'
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
  const { transactions, filteredTransactions } = useApp()
  const series = useMemo(()=> buildSeries(filteredTransactions),[filteredTransactions])
  const categoryMap = useMemo(()=>{
    const map = {}
    filteredTransactions.forEach(t=> map[t.category] = (map[t.category]||0) + Math.abs(t.amount))
    return map
  },[filteredTransactions])

  return (
    <div className="container">
      <Header />
      <QuickActions />
      <div className="grid" style={{gridTemplateColumns:'1fr',gap:16}}>
        <div className="card">
          <SummaryCards />
          <div style={{display:'flex',gap:12,marginTop:12,alignItems:'stretch',flexWrap:'wrap'}}>
            <div className="card" style={{flex:1,minWidth:160,display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <div className="small">This week</div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                <div style={{fontWeight:700}}>{series.length? series.slice(-7).length:0} pts</div>
                <MiniSpark series={series.slice(Math.max(0, series.length-7)).map(s=>({value:s.value}))} />
              </div>
            </div>
            <div className="card" style={{width:220,display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <div className="small">This month</div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                <div style={{fontWeight:700}}>{series.length? Math.min(30, series.length):0} pts</div>
                <MiniSpark series={series.slice(Math.max(0, series.length-30)).map(s=>({value:s.value}))} />
              </div>
            </div>
          </div>
          <div style={{display:'flex',gap:16,marginTop:12,flexWrap:'wrap'}}>
            <div style={{flex:1,minWidth:260}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                <div style={{display:'flex',flexDirection:'column'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div className="small">Balance Trend</div>
                    <div className="small" title="Shows cumulative balance over time">i</div>
                  </div>
                  <div className="small" style={{opacity:0.8}}>Net worth</div>
                </div>
                <MiniSpark series={series.slice(Math.max(0, series.length-12))} />
              </div>
              <LineChart series={series} />
            </div>
            <div style={{width:180}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div className="small">Spending Breakdown</div>
                <div className="small" title="Category share of expenses">i</div>
              </div>
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
