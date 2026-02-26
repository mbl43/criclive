/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Users, Activity, RefreshCw, AlertCircle, ChevronRight } from 'lucide-react';
import type { CricbuzzResponse } from './types';

const MATCH_ID = '139415';
const REFRESH_INTERVAL = 15000; // 15 seconds for more "live" feel

export default function App() {
  const [data, setData] = useState<CricbuzzResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/score/${MATCH_ID}`);
      if (!response.ok) throw new Error('Failed to fetch score');
      const json = await response.json();
      setData(json);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Syncing...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <RefreshCw className="w-16 h-16 text-yellow-400 animate-spin" />
            <div className="absolute inset-0 blur-xl bg-yellow-400/20 animate-pulse" />
          </div>
          <p className="text-yellow-400 font-black tracking-[0.3em] uppercase text-xs">Loading Live Feed</p>
        </div>
      </div>
    );
  }

  const miniscore = data?.miniscore;
  const header = data?.matchHeader;
  const team1 = header?.team1;
  const team2 = header?.team2;
  
  // Find scores for each team from the innings list
  const team1Innings = miniscore?.matchScoreDetails.inningsScoreList.find(s => s.batTeamId === team1?.id);
  const team2Innings = miniscore?.matchScoreDetails.inningsScoreList.find(s => s.batTeamId === team2?.id);

  const isTeam1Batting = miniscore?.batTeam.teamId === team1?.id;
  const isTeam2Batting = miniscore?.batTeam.teamId === team2?.id;

  // Determine who batted first based on the innings list
  const inningsList = miniscore?.matchScoreDetails.inningsScoreList || [];
  const firstInningsTeamId = inningsList[0]?.batTeamId;
  
  const teamBattedFirst = firstInningsTeamId === team1?.id ? team1 : team2;
  const teamBattedSecond = firstInningsTeamId === team1?.id ? team2 : team1;
  
  const firstInningsData = firstInningsTeamId === team1?.id ? team1Innings : team2Innings;
  const secondInningsData = firstInningsTeamId === team1?.id ? team2Innings : team1Innings;

  const isFirstTeamBatting = miniscore?.batTeam.teamId === teamBattedFirst?.id;
  const isSecondTeamBatting = miniscore?.batTeam.teamId === teamBattedSecond?.id;

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans overflow-x-hidden">
      {/* Immersive Background */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=2000"
          alt="Cricket Stadium"
          className="w-full h-full object-cover opacity-20 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/90" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto p-4 md:p-6 flex flex-col gap-4">
        
        {/* Top Status Bar */}
        <div className="flex justify-between items-center px-4 py-1 bg-slate-900/80 backdrop-blur-md rounded-t-xl border-x border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Live Broadcast</span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
            {header?.matchDescription} • {header?.seriesName}
          </div>
        </div>

        {/* Main Scoreboard - High Contrast Broadcast Style */}
        <div className="flex flex-col shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] rounded-b-2xl overflow-hidden border-x border-b border-white/10">
          
          {/* Teams Header */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-stretch">
            
            {/* Left Team Score (Batted First) */}
            <div className={`relative p-6 transition-all duration-500 ${isFirstTeamBatting ? 'bg-indigo-600' : 'bg-slate-900/90 opacity-80'}`}>
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-black px-4 py-1 rounded text-xs font-black tracking-tighter shadow-lg">{teamBattedFirst?.shortName}</div>
                {isFirstTeamBatting && <Activity className="w-4 h-4 text-amber-300 animate-bounce" />}
              </div>
              <div className="flex items-baseline gap-3">
                <h1 className={`text-6xl font-black tracking-tighter ${isFirstTeamBatting ? 'text-amber-300' : 'text-white/60'}`}>
                  {firstInningsData ? `${firstInningsData.score}-${firstInningsData.wickets}` : '---'}
                </h1>
                <span className="text-xl font-bold opacity-60">
                  {firstInningsData ? `(${firstInningsData.overs})` : ''}
                </span>
              </div>
              {isFirstTeamBatting && (
                <div className="absolute top-0 right-0 p-2">
                  <span className="text-[8px] font-black uppercase bg-amber-400 text-black px-2 py-0.5 rounded-bl-lg">Batting</span>
                </div>
              )}
            </div>

            {/* Center Status / Result */}
            <div className="bg-amber-600 px-8 py-6 flex flex-col items-center justify-center text-center border-y md:border-y-0 md:border-x border-white/20 shadow-inner">
              <div className="bg-white/20 px-4 py-1 rounded-full mb-2">
                <Trophy className="w-5 h-5 text-white drop-shadow-md" />
              </div>
              <h2 className="text-2xl font-black uppercase leading-none tracking-tighter text-white drop-shadow-lg max-w-[200px]">
                {miniscore?.matchScoreDetails.customStatus || header?.status}
              </h2>
            </div>

            {/* Right Team Score (Batted Second / Current) */}
            <div className={`relative p-6 flex flex-col items-end transition-all duration-500 ${isSecondTeamBatting ? 'bg-teal-600' : 'bg-slate-900/90 opacity-80'}`}>
              <div className="flex items-center gap-4 mb-2">
                {isSecondTeamBatting && <Activity className="w-4 h-4 text-amber-300 animate-bounce" />}
                <div className="bg-black px-4 py-1 rounded text-xs font-black tracking-tighter shadow-lg">{teamBattedSecond?.shortName}</div>
              </div>
              <div className="flex items-baseline gap-3 flex-row-reverse">
                <h1 className={`text-6xl font-black tracking-tighter ${isSecondTeamBatting ? 'text-amber-300' : 'text-white/60'}`}>
                  {secondInningsData ? `${secondInningsData.score}-${secondInningsData.wickets}` : '---'}
                </h1>
                <span className="text-xl font-bold opacity-60">
                  {secondInningsData ? `(${secondInningsData.overs})` : ''}
                </span>
              </div>
              {isSecondTeamBatting && (
                <div className="absolute top-0 left-0 p-2">
                  <span className="text-[8px] font-black uppercase bg-amber-400 text-black px-2 py-0.5 rounded-br-lg">Batting</span>
                </div>
              )}
            </div>
          </div>

          {/* Key Stats Strip */}
          <div className="bg-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-6 border-y border-white/10">
            <div className="flex gap-8">
              <StatItem label="CRR" value={miniscore?.currentRunRate} />
              <StatItem label="RRR" value={miniscore?.requiredRunRate || '0.00'} />
              <StatItem 
                label="P'SHIP" 
                value={`${miniscore?.partnerShip.runs} (${miniscore?.partnerShip.balls})`} 
                color="text-amber-300"
              />
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full border border-white/10">
                  <span className="text-[10px] font-black text-white/50 uppercase">Target:</span>
                  <span className="text-sm font-black text-amber-400">{miniscore?.target || 'N/A'}</span>
               </div>
               <div className="text-xs font-black uppercase tracking-widest text-white/80">
                 {miniscore?.matchScoreDetails.state}
               </div>
            </div>
          </div>

          {/* Last Wicket Alert */}
          <div className="bg-rose-700 px-6 py-2 text-sm font-black flex items-center gap-3">
            <div className="bg-white text-rose-700 px-2 py-0.5 rounded text-[10px] uppercase">Last Wicket</div>
            <span className="italic tracking-tight">{miniscore?.lastWicket || 'No wickets yet'}</span>
          </div>

          {/* Recent Balls Visualization */}
          <div className="bg-violet-600 px-6 py-4 flex items-center gap-6 overflow-x-auto no-scrollbar">
            <span className="text-xs font-black uppercase tracking-tighter text-white/60 whitespace-nowrap">Last Over ({miniscore?.overs}):</span>
            <div className="flex gap-3">
              {miniscore?.recentOvsStats.split(/\s+/).filter(b => b && b !== '').map((ball, i) => {
                const isSeparator = ball === '|';
                return (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={i}
                    className={`flex items-center justify-center text-base font-black shadow-lg transition-all ${
                      isSeparator 
                        ? 'w-4 h-10 bg-white/10 border-x border-white/20 rounded-sm' 
                        : `w-10 h-10 rounded-full border-2 ${
                            ball === '4' ? 'bg-amber-400 text-black border-amber-200' :
                            ball === '6' ? 'bg-emerald-500 text-white border-emerald-300' :
                            ball === 'W' ? 'bg-rose-600 text-white border-rose-400' :
                            'bg-white text-black border-zinc-300'
                          }`
                    }`}
                  >
                    {!isSeparator && ball}
                    {isSeparator && <div className="w-[2px] h-6 bg-white/40" />}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Player Performance Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 bg-slate-950/50">
            <PlayerBox 
              role="BATTER"
              name={miniscore?.batsmanStriker.name}
              score={miniscore?.batsmanStriker.runs}
              balls={miniscore?.batsmanStriker.balls}
              stats={[
                { label: '4s', value: miniscore?.batsmanStriker.fours },
                { label: '6s', value: miniscore?.batsmanStriker.sixes },
                { label: 'SR', value: miniscore?.batsmanStriker.strikeRate },
              ]}
              isActive
            />
            <PlayerBox 
              role="BATTER"
              name={miniscore?.batsmanNonStriker.name}
              score={miniscore?.batsmanNonStriker.runs}
              balls={miniscore?.batsmanNonStriker.balls}
              stats={[
                { label: '4s', value: miniscore?.batsmanNonStriker.fours },
                { label: '6s', value: miniscore?.batsmanNonStriker.sixes },
                { label: 'SR', value: miniscore?.batsmanNonStriker.strikeRate },
              ]}
            />
            <PlayerBox 
              role="BOWLER"
              name={miniscore?.bowlerStriker.name}
              score={miniscore?.bowlerStriker.wickets}
              runsConceded={miniscore?.bowlerStriker.runs}
              overs={miniscore?.bowlerStriker.overs}
              stats={[
                { label: 'ECON', value: miniscore?.bowlerStriker.economy },
              ]}
              isBowler
            />
          </div>

          {/* Bottom Info Bar */}
          <div className="bg-black px-6 py-3 flex justify-between items-center border-t border-white/10">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Next To Bat</span>
              <div className="flex gap-2">
                <ChevronRight className="w-3 h-3 text-amber-400" />
                <span className="text-xs font-bold text-teal-400">Match In Progress...</span>
              </div>
            </div>
            <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">
              Updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Probabilities & Win Chance */}
        {data?.winProbability && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-6 flex items-center gap-2">
                <Activity className="w-3 h-3 text-indigo-500" /> Win Probability
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-black uppercase">
                  <span>{data.winProbability.team1.shortName}</span>
                  <span>{data.winProbability.team2.shortName}</span>
                </div>
                <div className="relative h-6 bg-slate-800 rounded-lg overflow-hidden flex border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${data.winProbability.team1.percent}%` }}
                    className="h-full bg-indigo-600 flex items-center px-3 text-[10px] font-black shadow-[inset_-4px_0_12px_rgba(0,0,0,0.3)]"
                  >
                    {data.winProbability.team1.percent}%
                  </motion.div>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${data.winProbability.team2.percent}%` }}
                    className="h-full bg-teal-600 flex items-center justify-end px-3 text-[10px] font-black shadow-[inset_4px_0_12px_rgba(0,0,0,0.3)]"
                  >
                    {data.winProbability.team2.percent}%
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
               <AlertCircle className="w-8 h-8 text-amber-500/50 mb-2" />
               <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Broadcast Notice</p>
               <p className="text-sm font-bold text-white/80 mt-1">Live commentary and highlights available in the full match center.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatItem({ label, value, color = "text-white" }: { label: string, value: any, color?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] font-black uppercase tracking-tighter text-white/40 leading-none mb-1">{label}</span>
      <span className={`text-lg font-black tracking-tighter leading-none ${color}`}>{value}</span>
    </div>
  );
}

function PlayerBox({ role, name, score, balls, runsConceded, overs, stats, isActive, isBowler }: any) {
  return (
    <div className={`p-6 border-r border-white/5 last:border-r-0 relative group transition-all duration-500 hover:bg-white/5 ${isActive ? 'bg-indigo-500/10' : ''}`}>
      {/* Role Badge */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <span className="bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-black tracking-[0.2em] rounded-full border border-white/10 text-white/80 uppercase">
          {role}
        </span>
        {isActive && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-tighter animate-pulse">On Strike</span>
            <div className="w-2.5 h-2.5 bg-amber-400 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-6 mb-6 relative z-10">
        {/* Player Silhouette Placeholder */}
        <div className="relative">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden border border-white/10 shadow-2xl transition-transform group-hover:scale-105 duration-500 ${isActive ? 'bg-indigo-600/40' : 'bg-slate-800/40'}`}>
            <Users className={`w-12 h-12 ${isActive ? 'text-indigo-300/40' : 'text-slate-500/40'}`} />
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
          </div>
          {/* Status Ring */}
          <div className={`absolute -inset-1 rounded-2xl border-2 border-dashed opacity-20 ${isActive ? 'border-amber-400 animate-[spin_10s_linear_infinite]' : 'border-white/0'}`} />
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-black uppercase tracking-tight text-white/90 truncate max-w-[120px] group-hover:text-amber-300 transition-colors">
            {name || '---'}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-amber-400 tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
              {isBowler ? `${score}-${runsConceded}` : score}
            </span>
            <span className="text-lg font-bold text-white/30 tracking-tighter">
              {isBowler ? `(${overs})` : `(${balls})`}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 relative z-10">
        {stats.map((s: any, i: number) => (
          <div key={i} className="bg-black/40 backdrop-blur-sm rounded-lg p-2 border border-white/5 flex flex-col items-center transition-transform hover:translate-y-[-2px]">
            <span className="text-[9px] font-black text-white/30 uppercase leading-none mb-1.5 tracking-tighter">{s.label}</span>
            <span className="text-xs font-black text-white/90">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Decorative background number */}
      <div className="absolute -bottom-4 -right-2 text-8xl font-black text-white/[0.02] italic group-hover:text-white/[0.04] transition-all duration-700 select-none pointer-events-none">
        {isBowler ? 'BWL' : 'BAT'}
      </div>
    </div>
  );
}
