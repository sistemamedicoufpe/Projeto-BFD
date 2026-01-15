import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'

// Registra componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface DataPoint {
  date: string
  value: number
  label?: string
}

interface EvolutionChartProps {
  title: string
  datasets: {
    label: string
    data: DataPoint[]
    color: string
  }[]
  yAxisLabel?: string
  maxValue?: number
}

export function EvolutionChart({ title, datasets, yAxisLabel, maxValue = 30 }: EvolutionChartProps) {
  // Calcula tendência para cada dataset
  const calculateTrend = (data: DataPoint[]): {
    trend: 'improving' | 'declining' | 'stable'
    change: number
    velocity: number
  } => {
    if (data.length < 2) {
      return { trend: 'stable', change: 0, velocity: 0 }
    }

    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const first = sortedData[0]
    const last = sortedData[sortedData.length - 1]

    const change = last.value - first.value

    // Calcula diferença em dias
    const firstDate = new Date(first.date)
    const lastDate = new Date(last.date)
    const daysDiff = Math.round((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
    const monthsDiff = daysDiff / 30

    const velocity = monthsDiff > 0 ? change / monthsDiff : 0

    // Considera estável se mudança for menor que 1 ponto
    if (Math.abs(change) < 1) {
      return { trend: 'stable', change, velocity }
    }

    return {
      trend: change > 0 ? 'improving' : 'declining',
      change,
      velocity
    }
  }

  const datasetTrends = datasets.map(dataset => ({
    label: dataset.label,
    color: dataset.color,
    ...calculateTrend(dataset.data)
  }))

  // Extrai todas as datas únicas e ordena
  const allDates = Array.from(
    new Set(datasets.flatMap((dataset) => dataset.data.map((d) => d.date)))
  ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const chartData = {
    labels: allDates.map(formatDate),
    datasets: datasets.map((dataset) => ({
      label: dataset.label,
      data: allDates.map((date) => {
        const point = dataset.data.find((d) => d.date === date)
        return point ? point.value : null
      }),
      borderColor: dataset.color,
      backgroundColor: dataset.color + '33', // 20% opacity
      tension: 0.3,
      spanGaps: true, // Conecta pontos mesmo com valores null
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: dataset.color,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    })),
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-color') || '#111827',
          font: {
            size: 12,
            family: 'Inter, sans-serif',
          },
          padding: 15,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: title,
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color') || '#111827',
        font: {
          size: 16,
          family: 'Inter, sans-serif',
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || ''
            const value = context.parsed.y
            return `${label}: ${value !== null ? value : 'N/A'}`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: maxValue,
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel || '',
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-color') || '#6B7280',
          font: {
            size: 12,
            family: 'Inter, sans-serif',
          },
        },
        ticks: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-color') || '#6B7280',
          font: {
            size: 11,
            family: 'Inter, sans-serif',
          },
        },
        grid: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--grid-color') || 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Data',
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-color') || '#6B7280',
          font: {
            size: 12,
            family: 'Inter, sans-serif',
          },
        },
        ticks: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-color') || '#6B7280',
          font: {
            size: 11,
            family: 'Inter, sans-serif',
          },
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  }

  return (
    <div className="w-full space-y-4">
      <div className="h-[400px]">
        <Line data={chartData} options={options} />
      </div>

      {/* Indicadores de Tendência */}
      {datasetTrends.length > 0 && (
        <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {datasetTrends.map((trend, index) => (
            <div
              key={index}
              className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex-1 min-w-[200px]"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: trend.color }}
                aria-hidden="true"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {trend.label}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      trend.trend === 'improving'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : trend.trend === 'declining'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {trend.trend === 'improving' && '📈 Melhora'}
                    {trend.trend === 'declining' && '📉 Declínio'}
                    {trend.trend === 'stable' && '➡️ Estável'}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {trend.change > 0 ? '+' : ''}
                    {trend.change.toFixed(1)} pts
                  </span>
                  {trend.velocity !== 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      ({trend.velocity > 0 ? '+' : ''}
                      {trend.velocity.toFixed(2)} pts/mês)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
