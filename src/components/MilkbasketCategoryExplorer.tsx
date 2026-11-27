import { useState } from 'react';
import {
  Milk,
  Leaf,
  Apple,
  Cookie,
  ArrowRight,
  ChevronRight,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import {
  MILKBASKET_TAXONOMY,
  type CategoryCluster,
  type SubCategory,
} from '@/data/milkbasketTaxonomy';
import { navigate, PATHS } from '@/lib/router';

const ICON_MAP: Record<string, React.ElementType> = {
  Milk,
  Leaf,
  Apple,
  Cookie,
};

export interface MilkbasketCategoryExplorerProps {
  onSelectCategory?: (clusterId: string, subId?: string) => void;
  className?: string;
}

export function MilkbasketCategoryExplorer({
  onSelectCategory,
  className = '',
}: MilkbasketCategoryExplorerProps = {}) {
  const [selectedClusterId, setSelectedClusterId] = useState<string>(
    MILKBASKET_TAXONOMY[0].id
  );

  const activeCluster =
    MILKBASKET_TAXONOMY.find((c: CategoryCluster) => c.id === selectedClusterId) ||
    MILKBASKET_TAXONOMY[0];

  const IconComp = ICON_MAP[activeCluster.iconName] || ShoppingBag;

  const handleClusterClick = (clusterId: string) => {
    setSelectedClusterId(clusterId);
    if (onSelectCategory) {
      onSelectCategory(clusterId);
    }
  };

  const handleSubClick = (clusterId: string, subId: string) => {
    if (onSelectCategory) {
      onSelectCategory(clusterId, subId);
    } else {
      navigate(PATHS.order);
    }
  };

  return (
    <div className={`rounded-3xl border border-ink-100 bg-white p-6 sm:p-8 shadow-card ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800">
            <Sparkles className="h-3.5 w-3.5 text-brand-600" />
            <span>Milkbasket-Style Visual Category Explorer</span>
          </div>
          <h3 className="mt-2 font-display text-xl sm:text-2xl font-bold text-ink-950">
            Daily Kitchen Pantry &amp; Morning Milk Taxonomy
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-ink-600">
            Organized hierarchy: Pure morning dairy pouches, fresh farm harvests, and healthy bites delivered to your doorstep.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(PATHS.order)}
          className="btn-primary shrink-0 px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-soft"
        >
          <span>Order Fresh Daily</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Primary Category Clusters */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MILKBASKET_TAXONOMY.map((cluster: CategoryCluster) => {
          const ClusterIcon = ICON_MAP[cluster.iconName] || ShoppingBag;
          const isSelected = cluster.id === activeCluster.id;
          return (
            <button
              key={cluster.id}
              type="button"
              onClick={() => handleClusterClick(cluster.id)}
              className={`rounded-2xl p-4 text-left transition-all border ${
                isSelected
                  ? 'border-brand-600 bg-brand-50/70 text-brand-950 shadow-soft ring-2 ring-brand-300'
                  : 'border-ink-100 bg-white text-ink-800 hover:border-brand-200 hover:bg-ink-50/60'
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                  isSelected
                    ? 'bg-brand-600 text-white'
                    : 'bg-ink-100 text-ink-600'
                }`}
              >
                <ClusterIcon className="h-5 w-5" />
              </span>
              <h4 className="mt-3 font-display text-xs sm:text-sm font-bold leading-snug">
                {cluster.name}
              </h4>
              {cluster.vernacularName && (
                <p className="mt-0.5 text-[11px] text-brand-800 font-medium">
                  {cluster.vernacularName}
                </p>
              )}
              <p className="mt-2 text-[10px] text-ink-400 font-semibold uppercase tracking-wider">
                {cluster.subcategories.length} Aisles
              </p>
            </button>
          );
        })}
      </div>

      {/* Subcategory Grid for Selected Cluster */}
      <div className="mt-6 rounded-2xl bg-ink-50/60 p-5 border border-ink-100">
        <div className="flex items-center gap-2 mb-4">
          <IconComp className="h-4 w-4 text-brand-700" />
          <span className="font-bold text-xs uppercase tracking-wider text-ink-700">
            {activeCluster.name} · Curated Aisles
          </span>
          <span className="text-xs text-ink-400">({activeCluster.description})</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {activeCluster.subcategories.map((sub: SubCategory) => (
            <div
              key={sub.id}
              onClick={() => handleSubClick(activeCluster.id, sub.id)}
              className="group flex cursor-pointer items-center justify-between rounded-xl bg-white p-3.5 border border-ink-100 shadow-2xs transition-all hover:border-brand-300 hover:shadow-soft"
            >
              <div>
                <p className="text-xs sm:text-sm font-bold text-ink-900 group-hover:text-brand-800 transition-colors">
                  {sub.name}
                </p>
                {sub.vernacularName && (
                  <p className="text-[11px] text-ink-500 font-medium mt-0.5">
                    {sub.vernacularName}
                  </p>
                )}
                <span className="mt-1 inline-block text-[10px] text-brand-700 font-bold bg-brand-50 px-2 py-0.5 rounded">
                  {sub.itemCount} Fresh Options Available
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-ink-400 group-hover:text-brand-700 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
