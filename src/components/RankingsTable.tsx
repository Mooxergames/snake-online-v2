'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Trophy, Crown, Medal } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import type { PlayerRanking, CountryEntry, SortField } from '@/lib/api';
import { snakeImg, countryEmoji, avatarColor } from '@/lib/assets';

const RANKINGS_API = 'https://api.snakeonline.io/api/rankings';

interface Props {
  initialGlobal: PlayerRanking[];
  initialCountries: CountryEntry[];
  locale: string;
}

export default function RankingsTable({ initialGlobal, initialCountries, locale }: Props) {
  const t = useTranslations('ranking');
  const [tab, setTab] = useState<'global' | 'local'>('global');
  const [sort, setSort] = useState<SortField>('trophy');
  const [country, setCountry] = useState<string>('');
  const [rows, setRows] = useState<PlayerRanking[]>(initialGlobal);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === 'global' && sort === 'trophy') { setRows(initialGlobal); return; }

    const url = tab === 'local' && country
      ? `${RANKINGS_API}/country/${encodeURIComponent(country)}?sort=${sort}&limit=50`
      : tab === 'global'
        ? `${RANKINGS_API}/global?sort=${sort}&limit=50`
        : null;

    if (!url) { setRows([]); return; }

    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(d => setRows(d?.data?.rankings || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [tab, sort, country, initialGlobal]);

  const RankBadge = ({ rank }: { rank: number }) => {
    if (rank === 1) return <span className="inline-flex items-center justify-center size-9 rounded-full bg-amber-400/15 ring-1 ring-amber-400/40"><Crown className="text-amber-400" size={16} /></span>;
    if (rank === 2) return <span className="inline-flex items-center justify-center size-9 rounded-full bg-slate-300/10 ring-1 ring-slate-300/30"><Medal className="text-slate-200" size={16} /></span>;
    if (rank === 3) return <span className="inline-flex items-center justify-center size-9 rounded-full bg-orange-400/15 ring-1 ring-orange-400/40"><Medal className="text-orange-400" size={16} /></span>;
    return <span className="inline-flex items-center justify-center size-9 rounded-full bg-bg-subtle text-text-tertiary text-sm font-mono">{rank}</span>;
  };

  const PlayerAvatar = ({ player }: { player: PlayerRanking }) => {
    if (player.avatarUrl) {
      return (
        <div className="relative size-11 rounded-full overflow-hidden ring-1 ring-border shrink-0 bg-bg-subtle">
          <img src={player.avatarUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
        </div>
      );
    }
    return (
      <div
        className="relative size-11 rounded-full flex items-center justify-center overflow-hidden ring-1 ring-border shrink-0"
        style={{ backgroundColor: avatarColor(player.selectedAvatar) + '22' }}
      >
        <span className="text-base font-bold" style={{ color: avatarColor(player.selectedAvatar) }}>
          {player.playerName?.charAt(0).toUpperCase() || '?'}
        </span>
      </div>
    );
  };

  const sortOptions: { value: SortField; label: string }[] = [
    { value: 'trophy', label: t('columns.trophies') },
    { value: 'bestScore', label: t('columns.bestScore') },
    { value: 'totalkills', label: t('columns.kills') },
    { value: 'gamePlayed', label: t('columns.games') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="inline-flex glass rounded-full p-1">
            {(['global', 'local'] as const).map(k => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={cn(
                  'px-5 py-2 text-sm font-medium rounded-full transition-all',
                  tab === k ? 'bg-brand-500 text-bg' : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {t(`tabs.${k}`)}
              </button>
            ))}
          </div>
          {tab === 'local' && (
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="glass rounded-full px-4 py-2 text-sm bg-bg-elevated"
            >
              <option value="">{t('selectCountry')}</option>
              {initialCountries.map(c => (
                <option key={c.country} value={c.country}>{countryEmoji(c.country)} {c.country} ({formatNumber(c.playerCount, locale)})</option>
              ))}
            </select>
          )}
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortField)}
          className="glass rounded-full px-4 py-2 text-sm bg-bg-elevated"
        >
          {sortOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-text-tertiary text-xs uppercase tracking-wider border-b border-border">
                <th className="px-4 py-4 w-20">{t('columns.rank')}</th>
                <th className="px-4 py-4">{t('columns.player')}</th>
                <th className="px-4 py-4 hidden sm:table-cell">Snake</th>
                <th className="px-4 py-4 text-right">{t('columns.trophies')}</th>
                <th className="px-4 py-4 text-right hidden md:table-cell">{t('columns.bestScore')}</th>
                <th className="px-4 py-4 text-right hidden md:table-cell">{t('columns.kills')}</th>
                <th className="px-4 py-4 text-right hidden lg:table-cell">{t('columns.country')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border animate-pulse">
                    <td className="px-4 py-3"><div className="size-9 rounded-full bg-bg-subtle" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-32 rounded bg-bg-subtle" /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><div className="size-12 rounded-lg bg-bg-subtle" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-bg-subtle ml-auto" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-16 rounded bg-bg-subtle ml-auto" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-12 rounded bg-bg-subtle ml-auto" /></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-10 rounded bg-bg-subtle ml-auto" /></td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-text-tertiary">{t('empty')}</td></tr>
              ) : rows.map(p => (
                <tr key={p.playerId + p.rank} className={cn(
                  'border-b border-border last:border-0 transition-colors hover:bg-white/[0.025]',
                  p.rank === 1 && 'bg-amber-500/[0.04]',
                )}>
                  <td className="px-4 py-3">
                    <RankBadge rank={p.rank} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <PlayerAvatar player={p} />
                      <div className="min-w-0">
                        <div className="font-medium text-text-primary truncate max-w-[180px] flex items-center gap-2">
                          {p.playerName || 'Unknown'}
                          {(p.flagUrl || p.selectedFlag) && (
                            p.flagUrl
                              ? <img src={p.flagUrl} alt="" loading="lazy" className="h-3.5 w-auto rounded-sm shrink-0" />
                              : <span className="text-sm shrink-0">{countryEmoji(p.selectedFlag)}</span>
                          )}
                        </div>
                        {p.badgeName && <div className="text-[11px] text-text-tertiary font-mono">{p.badgeName}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {(p.snakeUrl || p.selectedSnake) && (
                      <div className="size-12 rounded-lg bg-bg-subtle flex items-center justify-center overflow-hidden">
                        <img
                          src={p.snakeUrl || snakeImg(p.selectedSnake)}
                          alt={p.selectedSnake}
                          loading="lazy"
                          className="w-4/5 h-4/5 object-contain"
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    <span className="inline-flex items-center gap-1.5 text-amber-400">
                      <Trophy size={14} /> {formatNumber(p.trophy || 0, locale)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-text-secondary hidden md:table-cell">{formatNumber(p.bestScore || 0, locale)}</td>
                  <td className="px-4 py-3 text-right font-mono text-text-secondary hidden md:table-cell">{formatNumber(p.bestKills || 0, locale)}</td>
                  <td className="px-4 py-3 text-right text-text-secondary hidden lg:table-cell">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-sm">{countryEmoji(p.location)}</span>
                      {p.location || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
