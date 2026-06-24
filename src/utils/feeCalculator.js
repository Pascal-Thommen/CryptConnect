export function calcSendFee(asset, destination, amount) {
  if (destination === 'interno') return 0
  return amount * 0.01
}

export function calcSwapFee(from, to, amount) {
  if (from === 'fiat' || to === 'fiat') return amount * 0.01
  return 0
}
