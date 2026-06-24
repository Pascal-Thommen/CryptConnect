import { useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'

const FALLBACK = {
  bitcoin: { pyg: 385200000, pyg_24h_change: 3.2 },
  ethereum: { pyg: 48100000, pyg_24h_change: -0.8 },
  tether: { pyg: 7580, pyg_24h_change: 0.01 },
}

export function useLivePrices() {
  const { setLivePrices } = useApp()

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=pyg&include_24hr_change=true',
          { signal: AbortSignal.timeout(8000) }
        )
        if (!res.ok) throw new Error('API error')
        const data = await res.json()
        setLivePrices({
          bitcoin: { pyg: data.bitcoin?.pyg || FALLBACK.bitcoin.pyg, pyg_24h_change: data.bitcoin?.pyg_24h_change || FALLBACK.bitcoin.pyg_24h_change },
          ethereum: { pyg: data.ethereum?.pyg || FALLBACK.ethereum.pyg, pyg_24h_change: data.ethereum?.pyg_24h_change || FALLBACK.ethereum.pyg_24h_change },
          tether: { pyg: data.tether?.pyg || FALLBACK.tether.pyg, pyg_24h_change: data.tether?.pyg_24h_change || FALLBACK.tether.pyg_24h_change },
        })
      } catch {
        // keep fallback prices already set
      }
    }

    fetchPrices()
    const id = setInterval(fetchPrices, 30000)
    return () => clearInterval(id)
  }, [setLivePrices])
}
