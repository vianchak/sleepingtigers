'use client';

import React, { useRef, useState } from 'react';
import { Printer, Check, Receipt } from 'lucide-react';
import { toPng } from 'html-to-image';

interface ReceiptCardProps {
  leagueName: string;
  leagueId: string;
  locale: string;
  leader: {
    displayName: string;
    wins: number;
    losses: number;
    ties: number;
    fpts: number;
  };
  allPlayLeader?: {
    team: { displayName: string };
    wins: number;
    losses: number;
    winPercentage: number;
  } | null;
  benchCrime?: {
    team: { displayName: string; fpts: number; ppts: number };
  } | null;
  unlucky?: {
    team: { displayName: string; fptsAgainst: number };
  } | null;
  parashaResident?: {
    team: { displayName: string };
    winPercentage: number;
  } | null;
}

export default function ReceiptCard({
  leagueName,
  leagueId,
  locale,
  leader,
  allPlayLeader,
  benchCrime,
  unlucky,
  parashaResident,
}: ReceiptCardProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const benchPointsLeft = benchCrime
    ? Math.max(0, benchCrime.team.ppts - benchCrime.team.fpts)
    : 0;

  const isPaperTiger =
    allPlayLeader && allPlayLeader.team.displayName !== leader.displayName;

  const handleExport = async () => {
    if (!receiptRef.current || exporting) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#f4f1ea',
      });
      const link = document.createElement('a');
      link.download = `fantasy-receipt-${leagueName.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
      setExported(true);
      setTimeout(() => setExported(false), 2500);
    } catch (err) {
      console.error('Failed to export receipt PNG:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Physical Thermal Paper Slip */}
      <div
        ref={receiptRef}
        className="w-full max-w-[380px] receipt-paper receipt-zigzag-top rounded-b-xl p-5 pt-6 relative font-mono text-[#181a20] select-none"
      >
        {/* Angled Rubber Stamp */}
        <div className="stamp-verdict absolute top-4 right-4 z-10 bg-[#f4f1ea]/95">
          {isPaperTiger
            ? locale === 'uk'
              ? 'ПАПЕРОВИЙ ТИГР'
              : 'PAPER TIGER ALERT'
            : locale === 'uk'
              ? 'АУДИТ ПРОЙДЕНО'
              : 'VERIFIED AUDIT'}
        </div>

        {/* Receipt Header */}
        <div className="border-b-2 border-dashed border-[#181a20]/20 pb-3 mb-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.18em] uppercase text-[#181a20]/60">
            <Receipt className="w-3.5 h-3.5 text-[#181a20]" />
            <span>
              {locale === 'uk'
                ? 'ОФІЦІЙНИЙ ЧЕК ЛІГИ // SLEEPER'
                : 'OFFICIAL LEAGUE RECEIPT // SLEEPER'}
            </span>
          </div>
          <h3 className="font-heading font-bold text-lg uppercase tracking-tight text-[#181a20] mt-0.5 truncate pr-24">
            {leagueName}
          </h3>
          <div className="text-[10px] text-[#181a20]/60 flex items-center justify-between mt-0.5">
            <span>ID: #{leagueId.slice(-6)}</span>
            <span>{locale === 'uk' ? 'ТЕРМІНАЛ #01' : 'TERM #01'}</span>
          </div>
        </div>

        {/* Itemized Audit Lines */}
        <div className="space-y-2 text-xs">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[#181a20]/70 uppercase">
              01. {locale === 'uk' ? 'Лідер таблиці' : '#1 Standings Seed'}
            </span>
            <span className="font-bold text-right truncate">
              {leader.displayName} ({leader.wins}-{leader.losses})
            </span>
          </div>

          {allPlayLeader && (
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[#181a20]/70 uppercase">
                02. {locale === 'uk' ? 'Справжній #1 (All-Play)' : 'True #1 (All-Play)'}
              </span>
              <span className="font-bold text-right truncate">
                {allPlayLeader.team.displayName} (
                {(allPlayLeader.winPercentage * 100).toFixed(0)}%)
              </span>
            </div>
          )}

          {benchCrime && (
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[#181a20]/70 uppercase">
                03. {locale === 'uk' ? 'Злочин лавки (PTS)' : 'Bench Crime (PTS)'}
              </span>
              <span className="font-bold text-rose-700 text-right truncate">
                {benchCrime.team.displayName} (-{benchPointsLeft.toFixed(1)})
              </span>
            </div>
          )}

          {unlucky && (
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[#181a20]/70 uppercase">
                04. {locale === 'uk' ? 'Жертва розкладу' : 'Schedule Victim'}
              </span>
              <span className="font-bold text-right truncate">
                {unlucky.team.displayName} ({unlucky.team.fptsAgainst.toFixed(0)} PA)
              </span>
            </div>
          )}

          {parashaResident && (
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[#181a20]/70 uppercase">
                05. {locale === 'uk' ? 'Дно таблиці' : 'Cellar Dweller'}
              </span>
              <span className="font-bold text-rose-700 text-right truncate">
                {parashaResident.team.displayName} (
                {(parashaResident.winPercentage * 100).toFixed(0)}% WR)
              </span>
            </div>
          )}
        </div>

        {/* Total / Verdict Box */}
        <div className="border-t-2 border-dashed border-[#181a20]/20 mt-3.5 pt-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#181a20]/60">
              {locale === 'uk' ? 'ВЕРДИКТ КОМІСАРА' : 'COMMISSIONER VERDICT'}
            </div>
            <div className="font-heading font-bold text-sm uppercase tracking-tight text-[#181a20]">
              {isPaperTiger
                ? locale === 'uk'
                  ? `${leader.displayName} — Везунчик розкладу`
                  : `${leader.displayName} riding schedule luck`
                : locale === 'uk'
                  ? `${leader.displayName} — Беззаперечний лідер`
                  : `${leader.displayName} is undisputed #1`}
            </div>
          </div>
          <div className="text-right font-mono">
            <div className="text-[10px] text-[#181a20]/60">PF</div>
            <div className="text-sm font-bold text-[#181a20]">
              {leader.fpts.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Barcode Footer */}
        <div className="mt-4 pt-2.5 border-t border-[#181a20]/15 flex flex-col items-center">
          <div
            className="w-full h-6 opacity-75"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, #181a20 0px, #181a20 2px, transparent 2px, transparent 4px, #181a20 4px, #181a20 5px, transparent 5px, transparent 8px, #181a20 8px, #181a20 11px, transparent 11px, transparent 13px)',
            }}
          />
          <span className="text-[9px] tracking-[0.28em] text-[#181a20]/60 mt-1 uppercase">
            * {leagueName.slice(0, 14).toUpperCase()} AUDIT *
          </span>
        </div>
      </div>

      {/* Action Bar Below Receipt (Soft Pastel Sage Button) */}
      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className="mt-3 w-full max-w-[380px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-200 hover:bg-emerald-100 text-zinc-900 font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer disabled:opacity-50"
      >
        {exported ? (
          <>
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>
              {locale === 'uk' ? 'Чек збережено (PNG)' : 'Receipt Printed (PNG)'}
            </span>
          </>
        ) : (
          <>
            <Printer className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>
              {exporting
                ? locale === 'uk'
                  ? 'Друк чека...'
                  : 'Printing Receipt...'
                : locale === 'uk'
                  ? 'Роздрукувати чек у чат (PNG)'
                  : 'Print Receipt for Group Chat (PNG)'}
            </span>
          </>
        )}
      </button>
    </div>
  );
}
