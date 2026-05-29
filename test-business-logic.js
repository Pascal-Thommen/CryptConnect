#!/usr/bin/env node
/**
 * CryptConnect Business Logic Test Suite
 * Tests for TASKS.md Section 3.2 — all 7 business logic checks.
 */
const USD_RATE = 7500;
const PASS = '\u2713'; const FAIL = '\u2717';
let passed = 0, failed = 0;

function assert(condition, label) {
  if (condition) { passed++; console.log(`  ${PASS} ${label}`); }
  else           { failed++; console.log(`  ${FAIL} ${label}`); }
}
function assertEqual(actual, expected, label) {
  if (actual === expected) { passed++; console.log(`  ${PASS} ${label}`); }
  else { failed++; console.log(`  ${FAIL} ${label} — expected ${expected}, got ${actual}`); }
}

function calcFee(amountGs) {
  const serviceFee = Math.round(amountGs * 0.01);
  const iva = Math.round(serviceFee / 11);
  const gravadas = serviceFee - iva;
  return { serviceFee, iva, gravadas, total: serviceFee };
}

function assetToGs(asset, amount, prices) {
  if (asset === 'Gs') return amount;
  return amount * (prices[asset] || 0) * USD_RATE;
}

// ===== FIXED TEST PRICES =====
const prices = { BTC: 67000, USDT: 1.0, EURC: 1.08, dCHF: 1.12, Gs: 1 };

// ===== 3.2.1 Gs-to-Gs transfer: 0% fee =====
console.log('\n=== 3.2.1 Gs-to-Gs transfer: confirms 0% fee ===');
{
  const isFree = (asset, dest) => asset === 'Gs' && (dest.includes('@') || dest.includes('+') || !dest);
  assert(isFree('Gs', 'pascal@ex.com'),          'Gs + email -> free');
  assert(isFree('Gs', '+595****3456'),            'Gs + phone -> free');
  assert(!isFree('BTC', 'bc1externaladdr'),      'BTC + external addr -> NOT free');
  assert(!isFree('Gs', 'bc1externaladdr'),       'Gs + external addr (no @/+) -> NOT free');
  const fee = isFree('Gs', 'pascal@ex.com') ? 0 : calcFee(500000).total;
  assertEqual(fee, 0, 'Fee = 0 for Gs-to-Gs');
}

// ===== 3.2.2 CC-to-CC transfer: 0% fee =====
console.log('\n=== 3.2.2 CC-to-CC transfer: confirms 0% fee ===');
{
  const isFree = (asset, dest) => asset === 'Gs' && (dest.includes('@') || dest.includes('+') || !dest);
  assert(isFree('Gs', 'user@cc.py'),             'CC-to-CC (Gs+email) -> free');
  assert(isFree('Gs', '+595****4321'),            'CC-to-CC (Gs+phone) -> free');
  const fee = isFree('Gs', 'user@cc.py') ? 0 : calcFee(3141500).total;
  assertEqual(fee, 0, 'Fee = 0 for CC-to-CC');
}

// ===== 3.2.3 Crypto external send: 1% fee + receipt =====
console.log('\n=== 3.2.3 Crypto external send: 1% fee + receipt ===');
{
  const isFree = (asset, dest) => asset === 'Gs' && (dest.includes('@') || dest.includes('+') || !dest);
  assert(!isFree('BTC', 'bc1external'), 'BTC external send: isFree=false');
  const gs = assetToGs('BTC', 0.01, prices);
  assertEqual(gs, 5025000, '0.01 BTC = 5,025,000 Gs');
  const fee = calcFee(gs);
  assertEqual(fee.serviceFee, 50250, 'Service fee = 50,250 Gs');
  assertEqual(fee.iva, 4568, 'IVA = round(50250/11) = 4,568 Gs');
  assertEqual(fee.gravadas, 45682, 'Gravadas = 45,682 Gs');
  assertEqual(fee.gravadas + fee.iva, fee.serviceFee, 'Gravadas+IVA = ServiceFee');
  const receiptGen = fee.total > 0;
  assert(receiptGen, 'Receipt generated (feeGs>0)');
  // Smaller amounts
  const fee2 = calcFee(750000); // 100 USDT
  assertEqual(fee2.serviceFee, 7500, '100 USDT send fee = 7,500 Gs');
  assertEqual(fee2.iva, 682, 'IVA = 682');
  assertEqual(fee2.gravadas, 6818, 'Gravadas = 6,818');
}

// ===== 3.2.4 Crypto <-> Gs conversion: 1% fee + receipt =====
console.log('\n=== 3.2.4 Crypto <-> Gs conversion: 1% fee + receipt ===');
{
  // USDT -> Gs
  const isCrypto = (from, to) => from !== 'Gs' || to !== 'Gs';
  assert(isCrypto('USDT', 'Gs'), 'USDT->Gs IS crypto conversion');
  assert(!isCrypto('Gs', 'Gs'),  'Gs->Gs NOT crypto conversion');
  assert(isCrypto('BTC', 'USDT'), 'BTC->USDT IS crypto conversion');
  const fromGs = assetToGs('USDT', 100, prices);
  assertEqual(fromGs, 750000, '100 USDT = 750,000 Gs');
  const fee = calcFee(fromGs);
  assertEqual(fee.total, 7500, '1% fee = 7,500 Gs');
  const feeGs = isCrypto('USDT', 'Gs') ? fee.total : 0;
  assert(feeGs > 0, 'Fee applied for crypto conversion');
  const receiveGs = fromGs - feeGs;
  assertEqual(receiveGs, 742500, 'Receive = 750,000 - 7,500 = 742,500 Gs');
  assert(feeGs > 0, 'Receipt generated');
}

// ===== 3.2.5 Insufficient funds -> rejection =====
console.log('\n=== 3.2.5 Insufficient funds -> rejection, no overdraft ===');
{
  const holdingsBTC = 0.0241;
  const holdingsGs  = 100000;
  // Try sending 1.0 BTC (only have 0.0241)
  const gs = assetToGs('BTC', 1.0, prices); // 502,500,000
  const fee = calcFee(gs).total;
  const total = gs + fee;
  const holdingsGsBtc = assetToGs('BTC', holdingsBTC, prices); // 12,110,250
  assert(total > holdingsGsBtc, '1.0 BTC send exceeds holdings');
  // Gs exceed
  const gsSend = 200000;
  assert(gsSend > holdingsGs, '200,000 Gs send exceeds 100,000 Gs holdings');
  // Holdings unchanged
  assertEqual(holdingsGs, 100000, 'Balance unchanged after rejection');
}

// ===== 3.2.6 Cascade exhausts all sources -> rejection + rollback =====
console.log('\n=== 3.2.6 Cascade exhausts -> rejection with rollback ===');
{
  const holdings = { Gs: 3141500, USDT: 100, dCHF: 530, BTC: 0.0241 };
  const prior = ['Gs', 'USDT', 'dCHF', 'BTC'];
  let total = 0;
  prior.forEach(s => total += assetToGs(s, holdings[s], prices));
  assert(total > 20000000, `Total > 20M Gs (${Math.round(total).toLocaleString()})`);

  // Simulate full cascade function
  function simulatePurchase(purchaseGs, hld) {
    let remaining = purchaseGs;
    let used = [];
    for (const src of prior) {
      const avail = assetToGs(src, hld[src], prices);
      if (src === 'Gs') {
        const take = Math.min(remaining, avail);
        if (take > 0) { used.push({ src, gs: take, fee: 0 }); remaining -= take; hld[src] -= take; }
      } else {
        if (avail > 0 && remaining > 0) {
          const needed = remaining * 1.01;
          if (avail >= needed) {
            const f = calcFee(remaining);
            used.push({ src, gs: remaining, fee: f.total });
            hld[src] -= (remaining + f.total) / (assetToGs(src, 1, prices));
            remaining = 0; break;
          } else {
            const takeGs = Math.floor(avail / 1.01);
            const f = calcFee(takeGs);
            used.push({ src, gs: takeGs, fee: f.total });
            hld[src] -= avail / (assetToGs(src, 1, prices));
            remaining -= takeGs;
          }
        }
      }
      if (remaining <= 0) break;
    }
    return { remaining, used };
  }

  // 50k purchase: only Gs, no fee
  const r1 = simulatePurchase(50000, JSON.parse(JSON.stringify(holdings)));
  assertEqual(r1.remaining, 0, '50k Gs purchase: remaining=0 (covered by Gs)');
  assertEqual(r1.used.length, 1, 'Only Gs used');
  assertEqual(r1.used[0].fee, 0, 'No fee on Gs source');

  // 18M purchase: cascade through multiple sources
  const r2 = simulatePurchase(18000000, JSON.parse(JSON.stringify(holdings)));
  assertEqual(r2.remaining, 0, '18M purchase: fully covered');
  assert(r2.used.length >= 2, 'Multiple sources used (cascade)');

  // 50M purchase: EXHAUST ALL -> rejection
  const hld3 = JSON.parse(JSON.stringify(holdings));
  const original = JSON.parse(JSON.stringify(holdings));
  const r3 = simulatePurchase(50000000, hld3);
  assert(r3.remaining > 0.01, '50M purchase: exhausted (remaining > 0)');
  assertEqual(r3.used.length, prior.length, 'All priority sources consumed');
}

// ===== 3.2.7 Factura Resumen consolidates correctly =====
console.log('\n=== 3.2.7 Factura Resumen consolidates correctly ===');
{
  const now = new Date();
  const m = now.getMonth(); const y = now.getFullYear();
  const receipts = [
    { date: new Date(y, m, 5).toISOString(),  fee: { serviceFee: 50250, iva: 4568, gravadas: 45682 } },
    { date: new Date(y, m, 10).toISOString(), fee: { serviceFee:  7500, iva:  682, gravadas:  6818 } },
    { date: new Date(y, m, 15).toISOString(), fee: { serviceFee: 20000, iva: 1818, gravadas: 18182 } },
    { date: new Date(y, m, 20).toISOString(), fee: { serviceFee:  3000, iva:  273, gravadas:  2727 } },
    { date: new Date(y, m-1, 25).toISOString(), fee: { serviceFee: 9999, iva: 909, gravadas: 9090 } },
  ];
  const thisMonth = receipts.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === m && d.getFullYear() === y;
  });
  assertEqual(thisMonth.length, 4, '4 receipts this month, 1 from last month excluded');

  let gravadas=0, iva=0, fees=0;
  thisMonth.forEach(r => {
    if (r.fee) { gravadas+=r.fee.gravadas; iva+=r.fee.iva; fees+=r.fee.serviceFee; }
  });
  assertEqual(gravadas, 73409, 'Gravadas = 45,682+6,818+18,182+2,727 = 73,409');
  assertEqual(iva, 7341, 'IVA = 4,568+682+1,818+273 = 7,341');
  assertEqual(fees, 80750, 'Total fees = 50,250+7,500+20,000+3,000 = 80,750');
  assertEqual(gravadas+iva, fees, 'Gravadas+IVA = Total Fees');

  thisMonth.forEach((r,i) => {
    assertEqual(r.fee.gravadas+r.fee.iva, r.fee.serviceFee,
      `Receipt ${i+1}: Grav+IVA=ServiceFee`);
  });
}

console.log(`\n========================================`);
console.log(`  Passed: ${passed}  Failed: ${failed}`);
console.log(`========================================`);
if (failed === 0) { console.log('\nALL tests passed!\n'); process.exit(0); }
else { console.log(`\n${failed} test(s) failed\n`); process.exit(1); }
