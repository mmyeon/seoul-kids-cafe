'use client';

type Tab = 'list' | 'map';

interface MobileTabBarProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'list', label: '목록' },
  { id: 'map', label: '지도' },
];

export default function MobileTabBar({ activeTab, onChange }: MobileTabBarProps) {
  return (
    <div className="md:hidden bg-white px-4 pt-2 pb-3">
      <div className="flex rounded-xl overflow-hidden ring-1 ring-gray-200">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={[
              'flex-1 py-2 text-sm font-medium transition-colors cursor-pointer',
              activeTab === id
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-500 hover:text-blue-400',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
