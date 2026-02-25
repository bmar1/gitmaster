import { LanguageStats } from '../types';

export function LanguageBreakdown({ languages }: { languages: LanguageStats[] }) {
  if (languages.length === 0) return null;

  const topLanguages = languages.slice(0, 12);
  const maxPercentage = topLanguages[0]?.percentage || 1;

  return (
    <div className="animate-rise">
      <div className="flex w-full h-3 rounded-full overflow-hidden mb-8 bg-linen">
        {topLanguages.map((lang) => (
          <div
            key={lang.name}
            className="h-full bar-animate transition-all duration-300"
            style={{
              width: `${lang.percentage}%`,
              backgroundColor: lang.color,
              minWidth: lang.percentage > 0.5 ? '4px' : '0',
            }}
            title={`${lang.name}: ${lang.percentage}%`}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {topLanguages.map((lang, idx) => (
          <div key={lang.name} className="flex items-center gap-3 group" style={{ animationDelay: `${idx * 0.05}s` }}>
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: lang.color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-code text-sm text-walnut font-medium truncate">{lang.name}</span>
                <span className="font-code text-xs text-faded flex-shrink-0">{lang.percentage}%</span>
              </div>
              <div className="mt-1 h-1 rounded-full bg-linen overflow-hidden">
                <div
                  className="h-full rounded-full bar-animate"
                  style={{
                    width: `${(lang.percentage / maxPercentage) * 100}%`,
                    backgroundColor: lang.color,
                    animationDelay: `${idx * 0.08}s`,
                  }}
                />
              </div>
            </div>
            <span className="font-code text-[11px] text-faded/60 flex-shrink-0">
              {lang.fileCount} file{lang.fileCount !== 1 ? 's' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
