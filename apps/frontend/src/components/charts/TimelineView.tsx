import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface TimelineEvent {
  id: string
  type: 'evaluation' | 'exam'
  date: string
  title: string
  description: string
  icon: string
  color: string
}

interface TimelineViewProps {
  events: TimelineEvent[]
}

export function TimelineView({ events }: TimelineViewProps) {
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState<'all' | 'evaluation' | 'exam'>('all')

  const filteredEvents = events
    .filter((event) => selectedType === 'all' || event.type === selectedType)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleEventClick = (event: TimelineEvent) => {
    if (event.type === 'evaluation') {
      navigate(`/avaliacoes/${event.id}`)
    } else {
      navigate(`/exames/${event.id}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
            selectedType === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          aria-label="Mostrar todos os eventos"
        >
          Todos
        </button>
        <button
          onClick={() => setSelectedType('evaluation')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
            selectedType === 'evaluation'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          aria-label="Mostrar apenas avaliações"
        >
          📋 Avaliações
        </button>
        <button
          onClick={() => setSelectedType('exam')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
            selectedType === 'exam'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          aria-label="Mostrar apenas exames"
        >
          🔬 Exames
        </button>
      </div>

      {/* Timeline */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Nenhum evento encontrado
        </div>
      ) : (
        <div className="relative">
          {/* Linha vertical */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />

          {/* Eventos */}
          <div className="space-y-6">
            {filteredEvents.map((event, index) => (
              <div key={event.id} className="relative pl-20">
                {/* Ícone */}
                <div
                  className={`absolute left-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg ${event.color}`}
                  role="img"
                  aria-label={event.title}
                >
                  {event.icon}
                </div>

                {/* Conteúdo */}
                <div
                  onClick={() => handleEventClick(event)}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleEventClick(event)
                    }
                  }}
                  aria-label={`Ver detalhes de ${event.title}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(event.date)} • {formatTime(event.date)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.type === 'evaluation'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      }`}
                    >
                      {event.type === 'evaluation' ? 'Avaliação' : 'Exame'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{event.description}</p>
                </div>

                {/* Conector */}
                {index < filteredEvents.length - 1 && (
                  <div className="absolute left-8 top-16 w-12 h-6 border-l-2 border-b-2 border-gray-200 dark:border-gray-700 rounded-bl-lg" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
