import { HOUSEHOLD_SCALE_DEFINITIONS, type HouseholdSizeType, type HouseholdScaleDefinition, computeHouseholdScale } from '@/lib/firestoreService';

interface HouseholdScaleBadgeProps {
  code?: HouseholdSizeType;
  memberCount?: number;
  className?: string;
  showDetails?: boolean;
}

export function HouseholdScaleBadge({
  code,
  memberCount,
  className = '',
  showDetails = false,
}: HouseholdScaleBadgeProps) {
  const definition: HouseholdScaleDefinition = code
    ? HOUSEHOLD_SCALE_DEFINITIONS[code] || HOUSEHOLD_SCALE_DEFINITIONS.S
    : computeHouseholdScale(memberCount ?? 1);

  return (
    <div className={`inline-flex items-center gap-2 rounded-2xl border ${definition.borderColor} bg-white p-2 sm:p-2.5 shadow-2xs ${className}`}>
      {/* Colorful Icon Container */}
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${definition.bgGradient} text-white shadow-soft text-base`}
        title={`${definition.badge}: ${definition.label}`}
      >
        {definition.icon}
      </span>

      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-mono text-xs font-black uppercase tracking-wider text-ink-950">
            [{definition.badge}]
          </span>
          <span className={`text-[11px] font-bold ${definition.textColor}`}>
            {definition.label}
          </span>
        </div>
        <span className="mt-1 text-[10px] font-semibold text-ink-500">
          Capacity: {definition.countRange}
        </span>
        {showDetails && (
          <p className="mt-0.5 text-[9px] text-ink-400 leading-tight">
            {definition.description}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Colorful Classification Pill: Family vs Family Support Staff
 */
export function MemberClassificationBadge({
  classification,
  roleLabel,
}: {
  classification?: 'family' | 'family_support_staff';
  roleLabel: string;
}) {
  const isFamily = classification === 'family';

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border shadow-2xs ${
          isFamily
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : 'bg-indigo-50 text-indigo-900 border-indigo-300'
        }`}
      >
        {isFamily ? '🏡 Family Member' : '🤝 Family Support Staff'}
      </span>
      <span className="text-[11px] font-semibold text-ink-600">
        ({roleLabel})
      </span>
    </div>
  );
}
