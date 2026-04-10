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
    <div className="md:hidden flex bg-white border-b border-gray-200">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={[
            'flex-1 py-2.5 text-sm font-medium transition-colors',
            activeTab === id
              ? 'bg-blue-500 text-white'
              : 'text-gray-500 hover:text-blue-400',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
