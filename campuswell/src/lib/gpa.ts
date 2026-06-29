/**
 * Pure helpers for grade calculations. Unit-testable, no side effects.
 *
 * GPA conversion uses the WSU 7-point scale.
 * Gate the "GPA" label behind the SHOW_GPA flag until a stakeholder
 * confirms the conversion formula.
 */
const SHOW_GPA = false

export type GradeInput = {
  score: number
  maxScore: number
  weight?: number | null
}

/**
 * Weighted average of grades as a percentage (0–100).
 * Uses `weight` when provided, otherwise equal-weight.
 */
export function weightedAverage(grades: GradeInput[]): number {
  if (grades.length === 0) return 0

  const hasWeights = grades.some((g) => g.weight != null)

  if (!hasWeights) {
    const avg =
      grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) /
      grades.length
    return Math.round(avg * 100) / 100
  }

  let weightedSum = 0
  let totalWeight = 0
  for (const g of grades) {
    const w = g.weight ?? 1
    weightedSum += (g.score / g.maxScore) * 100 * w
    totalWeight += w
  }

  if (totalWeight === 0) return 0
  return Math.round((weightedSum / totalWeight) * 100) / 100
}

/**
 * Convert a percentage (0–100) to a WSU 7-point GPA.
 * Only exported for use when SHOW_GPA is true.
 */
export function toGpa(percent: number): number {
  if (percent >= 85) return 7.0
  if (percent >= 75) return 6.0
  if (percent >= 65) return 5.0
  if (percent >= 50) return 4.0
  return 0.0
}

export { SHOW_GPA }
