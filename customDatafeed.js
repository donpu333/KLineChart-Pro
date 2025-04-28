export class CustomDatafeed {
  constructor() {
    this.subscriptions = new Map()
  }

  async searchSymbols(search = '') {
    try {
      const response = await fetch('https://fapi.binance.com/fapi/v1/exchangeInfo')
      const data = await response.json()
      
      return data.symbols
        .filter(s => s.symbol.includes(search.toUpperCase()))
        .map(s => ({
          exchange: 'BINANCE',
          market: 'FUTURES',
          ticker: s.symbol,
          shortName: s.symbol,
          name: `${s.symbol} Perpetual Contract`,
          priceCurrency: 'USDT'
        }))
    } catch (error) {
      console.error('Error fetching symbols:', error)
      return []
    }
  }

  async getHistoryKLineData(symbol, period, from, to) {
    const interval = this.getBinanceInterval(period)
    const limit = 1000
    
    try {
      const response = await fetch(
        `https://fapi.binance.com/fapi/v1/klines?` +
        `symbol=${symbol.ticker}&interval=${interval}&limit=${limit}`
      )
      const data = await response.json()
      
      return data.map(item => ({
        timestamp: item[0], // Оставляем в миллисекундах (без деления на 1000)
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
        volume: parseFloat(item[5])
      }))
    } catch (error) {
      console.error('Error fetching history:', error)
      return []
    }
  }

  subscribe(symbol, period, callback) {
    const interval = this.getBinanceInterval(period)
    const wsUrl = `wss://fstream.binance.com/ws/${symbol.ticker.toLowerCase()}@kline_${interval}`
    
    const ws = new WebSocket(wsUrl)
    const key = `${symbol.ticker}_${interval}`
    
    ws.onmessage = (event) => {
      const { k: kline } = JSON.parse(event.data)
      callback({
        timestamp: kline.t, // Оставляем в миллисекундах (без деления на 1000)
        open: parseFloat(kline.o),
        high: parseFloat(kline.h),
        low: parseFloat(kline.l),
        close: parseFloat(kline.c),
        volume: parseFloat(kline.v),
        isClosed: kline.x
      })
    }
    
    this.subscriptions.set(key, ws)
  }

  unsubscribe(symbol, period) {
    const interval = this.getBinanceInterval(period)
    const key = `${symbol.ticker}_${interval}`
    
    if (this.subscriptions.has(key)) {
      this.subscriptions.get(key).close()
      this.subscriptions.delete(key)
    }
  }

  getBinanceInterval(period) {
    const map = {
      '1m': '1m',
      '5m': '5m',
      '15m': '15m',
      '30m': '30m',
      '1h': '1h',
      '4h': '4h',
      '1d': '1d'
    }
    return map[`${period.multiplier}${period.timespan[0]}`] || '15m'
  }
}