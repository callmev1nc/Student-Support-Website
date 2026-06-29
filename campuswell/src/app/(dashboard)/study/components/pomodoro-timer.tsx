'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { saveFocusSession } from '@/app/actions/study'
import { Play, Pause, RotateCcw, Loader2, Timer } from 'lucide-react'
import { FocusStats } from './focus-stats'

type SessionRow = {
  id: string
  startedAt: string
  endedAt: string
  durationSeconds: number
  mode: string
  completed: boolean
  taskId: string | null
}

const POMODORO = 25 * 60
const SHORT_BREAK = 5 * 60
const LONG_BREAK = 15 * 60

type Mode = 'POMODORO' | 'SHORT_BREAK' | 'LONG_BREAK'

function getDuration(mode: Mode): number {
  switch (mode) {
    case 'POMODORO': return POMODORO
    case 'SHORT_BREAK': return SHORT_BREAK
    case 'LONG_BREAK': return LONG_BREAK
  }
}

function getLabel(mode: Mode): string {
  switch (mode) {
    case 'POMODORO': return 'Focus'
    case 'SHORT_BREAK': return 'Short Break'
    case 'LONG_BREAK': return 'Long Break'
  }
}

interface PomodoroTimerProps {
  recentSessions: SessionRow[]
}

export function PomodoroTimer({ recentSessions }: PomodoroTimerProps) {
  const [mode, setMode] = useState<Mode>('POMODORO')
  const [timeLeft, setTimeLeft] = useState(getDuration('POMODORO'))
  const [running, setRunning] = useState(false)
  const [saving, setSaving] = useState(false)
  const startedAtRef = useRef<Date | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  function switchMode(newMode: Mode) {
    clearTimer()
    setRunning(false)
    setMode(newMode)
    setTimeLeft(getDuration(newMode))
    startedAtRef.current = null
  }

  function toggle() {
    if (running) {
      clearTimer()
      setRunning(false)
    } else {
      startedAtRef.current = startedAtRef.current ?? new Date()
      setRunning(true)
    }
  }

  function reset() {
    clearTimer()
    setRunning(false)
    setTimeLeft(getDuration(mode))
    startedAtRef.current = null
  }

  useEffect(() => {
    if (!running) return

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer()
          setRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return clearTimer
  }, [running, clearTimer])

  useEffect(() => {
    if (timeLeft === 0 && startedAtRef.current) {
      const started = startedAtRef.current
      const ended = new Date()
      const durationSec = Math.round((ended.getTime() - started.getTime()) / 1000)

      setSaving(true)

      const formData = new FormData()
      formData.set('startedAt', started.toISOString())
      formData.set('endedAt', ended.toISOString())
      formData.set('durationSeconds', String(durationSec))
      formData.set('mode', mode)

      saveFocusSession(formData).finally(() => {
        setSaving(false)
        startedAtRef.current = null
      })

      // Switch to break
      if (mode === 'POMODORO') {
        // Simple rotation: focus → short break
        setMode('SHORT_BREAK')
        setTimeLeft(getDuration('SHORT_BREAK'))
      } else {
        setMode('POMODORO')
        setTimeLeft(getDuration('POMODORO'))
      }
    }
  }, [timeLeft, mode])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pomodoro Timer</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          {/* Mode selector */}
          <div className="flex gap-2">
            {(['POMODORO', 'SHORT_BREAK', 'LONG_BREAK'] as Mode[]).map((m) => (
              <Button
                key={m}
                variant={mode === m ? 'default' : 'outline'}
                size="sm"
                onClick={() => switchMode(m)}
                disabled={running}
              >
                {getLabel(m)}
              </Button>
            ))}
          </div>

          {/* Timer display */}
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl font-bold tracking-wider tabular-nums text-foreground">
              {display}
            </div>

            <div className="flex gap-3">
              <Button onClick={toggle} size="lg">
                {running ? (
                  <><Pause className="size-4" /> Pause</>
                ) : (
                  <><Play className="size-4" /> {timeLeft === getDuration(mode) ? 'Start' : 'Resume'}</>
                )}
              </Button>
              <Button variant="outline" size="icon" onClick={reset} disabled={running}>
                <RotateCcw className="size-4" />
              </Button>
            </div>
          </div>

          {saving && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              Saving session...
            </div>
          )}
        </CardContent>
      </Card>

      <FocusStats recentSessions={recentSessions} />
    </div>
  )
}
