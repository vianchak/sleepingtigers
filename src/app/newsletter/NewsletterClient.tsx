'use client';

import { useState, useEffect } from 'react';
import { saveNewsletterArchive } from './storage-actions';
import { Loader2, Flame, FlameKindling, AlertTriangle, Save, ArchiveRestore } from 'lucide-react';

export default function NewsletterClient({ 
  leagueId, 
  currentWeek, 
  initialArchives,
  readOnly = false
}: { 
  leagueId: string, 
  currentWeek: number,
  initialArchives: number[],
  readOnly?: boolean
}) {
  const [week, setWeek] = useState(currentWeek > 0 ? currentWeek : 1);
  const [loading, setLoading] = useState(false);
  const [newsletter, setNewsletter] = useState<any>(null);
  
  const [archives, setArchives] = useState<number[]>(initialArchives || []);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/newsletters/${leagueId}/index.json`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setArchives(data);
      })
      .catch(() => {}); // ignore if file doesn't exist
  }, [leagueId]);

  const handleGenerate = async () => {
    setLoading(true);
    setIsSaved(false);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId, week })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate newsletter');
      }
      
      setNewsletter(data);
    } catch (error) {
      console.error("Failed to generate newsletter:", error);
      alert(`Failed to generate newsletter. Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadArchive = async (archiveWeek: number) => {
    setLoading(true);
    setWeek(archiveWeek);
    try {
      const res = await fetch(`/newsletters/${leagueId}/week-${archiveWeek}.json`);
      if (!res.ok) {
        alert("Archive not found!");
        return;
      }
      const data = await res.json();
      if (data) {
        setNewsletter(data);
        setIsSaved(true);
      } else {
        alert("Archive not found!");
      }
    } catch (error) {
      console.error("Failed to load archive:", error);
      alert("Failed to load archive.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!newsletter) return;
    setSaving(true);
    try {
      const res = await saveNewsletterArchive(leagueId, week, newsletter);
      if (res.success) {
        setIsSaved(true);
        if (!archives.includes(week)) {
          setArchives([...archives, week].sort((a, b) => b - a));
        }
        alert(`Week ${week} successfully published to archive!`);
      } else {
        alert("Failed to save: " + res.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save archive");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border-2 border-orange-200 shadow-sm print:hidden">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3 text-orange-600 uppercase tracking-tight">
            <Flame className="h-8 w-8 text-red-600 fill-red-600" />
            ЩОТИЖНЕВЕ ГОРІННЯ
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Because fantasy is pain, and we are all suffering.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {!readOnly && (
            <>
              <div className="flex items-center gap-2">
                <select 
                  className="p-2 rounded-md border-2 border-orange-300 bg-white font-bold text-orange-700 focus:ring-orange-500 focus:border-orange-500"
                  value={week} 
                  onChange={(e) => setWeek(Number(e.target.value))}
                >
                  {[...Array(14)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>Week {i + 1}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="bg-orange-600 text-white hover:bg-orange-700 px-6 py-2 rounded-md font-bold uppercase tracking-wide flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlameKindling className="h-5 w-5" />}
                {loading ? 'Igniting...' : 'Light the Fire'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Archives Tab Bar */}
      {archives.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 bg-white/50 p-3 rounded-xl border border-slate-200 shadow-sm print:hidden">
          <div className="text-slate-500 font-bold text-sm px-3 uppercase tracking-wider flex items-center gap-2 border-r border-slate-300">
            <ArchiveRestore className="w-4 h-4" />
            Editions
          </div>
          {archives.sort((a,b) => a - b).map(w => (
            <button
              key={w}
              onClick={() => handleLoadArchive(w)}
              className={`px-4 py-1.5 rounded-full font-bold text-sm transition-all ${
                newsletter && week === w 
                  ? 'bg-orange-600 text-white shadow-md scale-105'
                  : 'bg-white text-slate-600 hover:bg-orange-100 hover:text-orange-700 border border-slate-200 shadow-sm'
              }`}
            >
              Week {w}
            </button>
          ))}
        </div>
      )}
      {newsletter && (
        <div className="flex justify-end gap-3 print:hidden">
          {!readOnly && !isSaved && (
            <button 
              onClick={handlePublish}
              disabled={saving}
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md font-bold uppercase tracking-wide flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Publish to Archive
            </button>
          )}
          {!readOnly && isSaved && (
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-md font-bold uppercase tracking-wide flex items-center gap-2">
              ✓ Published
            </span>
          )}
          <button 
            onClick={() => window.print()}
            className="bg-zinc-800 text-white hover:bg-zinc-900 px-4 py-2 rounded-md font-bold uppercase tracking-wide flex items-center gap-2 transition-colors"
          >
            Save as PDF
          </button>
        </div>
      )}

      {/* Generated Content */}
      {newsletter && (
        <div 
          className="bg-[#fffdfa] text-zinc-900 border-4 border-zinc-900 p-8 sm:p-12 shadow-2xl relative overflow-hidden print:shadow-none"
          style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        >
          {/* Flame gradient border */}
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400"></div>
          
          {/* Newspaper Header */}
          <div className="text-center border-b-4 border-zinc-900 pb-8 mb-8 mt-4">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-widest mb-2 text-zinc-900" style={{ fontFamily: 'Impact, sans-serif' }}>
              ВІСНИК <span className="text-orange-600">ГОРІННЯ</span>
            </h2>
            <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest border-y-2 border-zinc-900 py-3 mt-6 text-zinc-800">
              <span>Vol. {week}</span>
              <span className="text-red-600 flex items-center gap-1"><Flame className="w-4 h-4 fill-red-600" /> OFFICIAL MELTDOWN REPORT</span>
              <span>Price: Your Sanity</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content: Lead & Matchups */}
            <div className="lg:col-span-2 space-y-10">
              <section>
                <h3 className="text-4xl font-black leading-tight mb-5 text-zinc-900 uppercase tracking-tight">
                  {newsletter.leadStory.headline}
                </h3>
                <p className="text-lg leading-relaxed text-zinc-800 font-serif drop-cap">
                  {newsletter.leadStory.content}
                </p>
              </section>

              <div className="border-t-4 border-zinc-900 pt-8">
                <h3 className="text-2xl font-black mb-6 flex items-center gap-2 text-zinc-900 uppercase tracking-wide">
                  <FlameKindling className="h-7 w-7 text-orange-600" /> Week {week} Dumpster Fires
                </h3>
                <div className="space-y-6">
                  {newsletter.matchups.map((m: any, i: number) => (
                    <div key={i} className="bg-orange-50 p-6 rounded border-2 border-orange-200">
                      <div className="font-black text-xl mb-3 text-zinc-900 border-b-2 border-orange-300 pb-2 uppercase tracking-tight">
                        {m.scoreText}
                      </div>
                      <p className="text-zinc-800 font-serif leading-relaxed text-base">{m.recap}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar: Awards & Rankings */}
            <div className="space-y-10 border-l-0 lg:border-l-4 border-zinc-900 lg:pl-8">
              <div className="bg-zinc-900 text-white p-6 rounded-lg shadow-md border-b-4 border-orange-600">
                <h3 className="text-2xl font-black mb-5 flex items-center gap-2 text-white uppercase border-b border-zinc-700 pb-3 tracking-wide">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" /> 
                  Tragedy Awards
                </h3>
                <div className="space-y-5 font-serif text-zinc-100">
                  <div>
                    <span className="font-bold text-orange-400 block text-sm uppercase tracking-wider mb-1">Honor Roll (Lucky Bastard)</span>
                    <span className="text-base">{newsletter.awards.honorRoll}</span>
                  </div>
                  <div>
                    <span className="font-bold text-orange-400 block text-sm uppercase tracking-wider mb-1">Detention (Total Failure)</span> 
                    <span className="text-base">{newsletter.awards.detention}</span>
                  </div>
                  <div>
                    <span className="font-bold text-orange-400 block text-sm uppercase tracking-wider mb-1">Fraud Watch</span> 
                    <span className="text-base">{newsletter.awards.fraudWatch}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black mb-6 uppercase tracking-wide text-zinc-900 border-b-4 border-zinc-900 pb-2 flex items-center gap-2">
                  Power Rankings <Flame className="w-5 h-5 text-orange-600 fill-orange-600" />
                </h3>
                <div className="space-y-5">
                  {newsletter.powerRankings.map((team: any) => (
                    <div key={team.team} className="flex gap-4 items-start">
                      <div className="font-black text-3xl text-orange-600 w-8 mt-1">{team.rank}</div>
                      <div>
                        <div className="font-black text-zinc-900 uppercase tracking-tight text-lg">{team.team}</div>
                        <div className="text-sm text-zinc-700 font-serif leading-snug mt-1">{team.blurb}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
