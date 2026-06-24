import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'

export function useAutoYield() {
  const { cryptoTotalPYG, autoYieldAPY, autoYieldStartDate } = useApp()
  const [todayYield, setTodayYield] = useState(0)
  const [accumulatedYield, setAccumulatedYield] = useState(0)

  useEffect(() => {
    const update = () => {
      const dailyYield = cryptoTotalPYG * autoYieldAPY / 365
      const now = new Date()
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const secondsSinceMidnight = (now - midnight) / 1000
      const earned = dailyYield * (secondsSinceMidnight / 86400)
      setTodayYield(earned)

      const daysSinceStart = Math.max(0, (now - autoYieldStartDate) / (1000 * 60 * 60 * 24))
      const accumulated = cryptoTotalPYG * autoYieldAPY / 365 * daysSinceStart
      setAccumulatedYield(accumulated)
    }

    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [cryptoTotalPYG, autoYieldAPY, autoYieldStartDate])

  return { todayYield, accumulatedYield }
}
