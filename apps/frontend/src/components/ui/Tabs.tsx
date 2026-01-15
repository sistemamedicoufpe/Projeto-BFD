import { ReactNode, useState } from 'react'

export interface Tab {
  id: string
  label: string
  icon?: string
  content: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (tabId: string) => void
}

export function Tabs({ tabs, defaultTab, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    onChange?.(tabId)
  }

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div
        className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto"
        role="tablist"
        aria-label="Abas de navegação"
      >
        <nav className="flex -mb-px" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              className={`
                group inline-flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4
                border-b-2 font-medium text-sm sm:text-base whitespace-nowrap
                min-h-[44px] transition-colors
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
            >
              {tab.icon && (
                <span role="img" aria-hidden="true" className="text-lg sm:text-xl">
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            hidden={activeTab !== tab.id}
            className={activeTab === tab.id ? 'animate-fade-in' : ''}
          >
            {activeTab === tab.id && tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}
