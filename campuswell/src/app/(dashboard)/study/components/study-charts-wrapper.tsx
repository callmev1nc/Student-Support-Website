'use client'

import dynamic from 'next/dynamic'

const FocusChart = dynamic(
  () => import('./focus-chart').then((m) => m.FocusChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-8">
        <div className="size-6 animate-spin rounded-full border-2 border-wsu-red border-t-transparent" />
      </div>
    ),
  },
)

export { FocusChart as StudyChartsWrapper }
