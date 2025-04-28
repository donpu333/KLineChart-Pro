import { KLineChartPro } from '@klinecharts/pro'
import { CustomDatafeed } from './customDatafeed'
import '@klinecharts/pro/dist/klinecharts-pro.css'

const chart = new KLineChartPro({
  container: document.getElementById('chart-container'),
  datafeed: new CustomDatafeed(),
  theme: 'dark',
  locale: 'ru',
  symbol: {
    exchange: 'BINANCE',
    market: 'FUTURES',
    ticker: 'BTCUSDT',
    shortName: 'BTC/USDT'
  },
  period: {
    multiplier: 15,
    timespan: 'minute',
    text: '15m'
  },
  styles: {
    candle: {
      type: 'candle_solid',
      bar: {
        upColor: '#089981',
        downColor: '#b22833'
      }
    },
    grid: {
      horizontal: { color: '#0f0f0f' },
      vertical: { color: '#0f0f0f' }
    }
  }
})