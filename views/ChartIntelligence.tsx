import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries } from 'lightweight-charts';

const SYMBOLS = [
  { symbol: 'AAPL', name: 'Apple', type: 'Stock' },
  { symbol: '^GSPC', name: 'S&P 500', type: 'Index' },
  { symbol: 'BTCUSD', name: 'Bitcoin', type: 'Crypto' },
  { symbol: 'EURUSD', name: 'EUR/USD', type: 'Forex' },
  { symbol: 'GLD', name: 'Gold ETF', type: 'Commodity' },
];

interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma20?: number | null;
  sma50?: number | null;
  ema12?: number | null;
  rsi?: number | null;
  bb_upper?: number | null;
  bb_lower?: number | null;
}

const ChartIntelligence = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const rsiChartRef = useRef<any>(null);

  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(false);
  const [interpretation, setInterpretation] = useState('');
  const [interpreting, setInterpreting] = useState(false);
  const [showSMA, setShowSMA] = useState(true);
  const [showBB, setShowBB] = useState(true);
  const [latestData, setLatestData] = useState<any>(null);

  const fetchChartData = useCallback(async (symbol: string) => {
    setLoading(true);
    try {
      const response = await fetch('/jax-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'data', symbol, days: 60 }),
      });
      const result = await response.json();
      if (result.success && result.candles) {
        setCandles(result.candles);
        setLatestData(result.latest);
      }
    } catch (error) {
      console.error('Chart fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInterpretation = useCallback(async () => {
    setInterpreting(true);
    setInterpretation('');
    try {
      const response = await fetch('/jax-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'interpret', symbol: selectedSymbol }),
      });
      const result = await response.json();
      if (result.success) {
        setInterpretation(result.interpretation);
      }
    } catch (error) {
      console.error('Interpretation error:', error);
    } finally {
      setInterpreting(false);
    }
  }, [selectedSymbol]);

  // Main chart
  useEffect(() => {
    if (!chartContainerRef.current || candles.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#1a1a2e' }, textColor: '#e0e0e0' },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      grid: { vertLines: { color: '#2a2a3e' }, horzLines: { color: '#2a2a3e' } },
      timeScale: { timeVisible: false, borderColor: '#3a3a4e' },
      rightPriceScale: { borderColor: '#3a3a4e' },
      crosshair: { mode: 1 },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#4ade80', downColor: '#ef4444',
      borderUpColor: '#4ade80', borderDownColor: '#ef4444',
      wickUpColor: '#4ade80', wickDownColor: '#ef4444',
    });
    candleSeries.setData(candles.map(c => ({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close })));

    if (showSMA) {
      const sma20Series = chart.addSeries(LineSeries, { color: '#fbbf24', lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
      sma20Series.setData(candles.filter(c => c.sma20).map(c => ({ time: c.time, value: c.sma20! })));

      const sma50Series = chart.addSeries(LineSeries, { color: '#8b5cf6', lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
      sma50Series.setData(candles.filter(c => c.sma50).map(c => ({ time: c.time, value: c.sma50! })));
    }

    if (showBB) {
      const bbUpper = chart.addSeries(LineSeries, { color: '#06b6d4', lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false });
      bbUpper.setData(candles.filter(c => c.bb_upper).map(c => ({ time: c.time, value: c.bb_upper! })));

      const bbLower = chart.addSeries(LineSeries, { color: '#06b6d4', lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false });
      bbLower.setData(candles.filter(c => c.bb_lower).map(c => ({ time: c.time, value: c.bb_lower! })));
    }

    chart.timeScale().fitContent();
    chartRef.current = chart;

    const handleResize = () => chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); chart.remove(); };
  }, [candles, showSMA, showBB]);

  // RSI chart
  useEffect(() => {
    if (!rsiContainerRef.current || candles.length === 0) return;

    const rsiChart = createChart(rsiContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#1a1a2e' }, textColor: '#e0e0e0' },
      width: rsiContainerRef.current.clientWidth,
      height: 120,
      grid: { vertLines: { color: '#2a2a3e' }, horzLines: { color: '#2a2a3e' } },
      timeScale: { timeVisible: false, borderColor: '#3a3a4e' },
      rightPriceScale: { borderColor: '#3a3a4e', scaleMargins: { top: 0.1, bottom: 0.1 } },
    });

    const rsiSeries = rsiChart.addSeries(LineSeries, { color: '#a855f7', lineWidth: 2, priceLineVisible: false });
    rsiSeries.setData(candles.filter(c => c.rsi).map(c => ({ time: c.time, value: c.rsi! })));

    rsiChart.timeScale().fitContent();
    rsiChartRef.current = rsiChart;

    const handleResize = () => rsiChart.applyOptions({ width: rsiContainerRef.current!.clientWidth });
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); rsiChart.remove(); };
  }, [candles]);

  useEffect(() => { fetchChartData(selectedSymbol); }, [selectedSymbol, fetchChartData]);

  const rsiStatus = latestData?.rsi ? (latestData.rsi > 70 ? 'Overbought' : latestData.rsi < 30 ? 'Oversold' : 'Neutral') : 'N/A';
  const rsiColor = latestData?.rsi ? (latestData.rsi > 70 ? 'text-red-400' : latestData.rsi < 30 ? 'text-green-400' : 'text-yellow-400') : '';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chart Intelligence</h1>
          <p className="text-sm text-gray-400 mt-1">JAX-CHART-ANALYST • AI-Powered Technical Analysis</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400">LIVE</span>
        </div>
      </div>

      {/* Symbol Selector */}
      <div className="flex gap-2 flex-wrap">
        {SYMBOLS.map(s => (
          <button key={s.symbol} onClick={() => setSelectedSymbol(s.symbol)}
            className={`px-4 py-2 rounded-lg font-mono text-sm transition ${selectedSymbol === s.symbol ? 'bg-purple-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}>
            {s.name} <span className="text-xs opacity-60">({s.symbol})</span>
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      {latestData && (
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-gray-400">Price</div>
            <div className="text-xl font-bold font-mono">${latestData.price?.toFixed(2)}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-gray-400">Day Range</div>
            <div className="text-sm font-mono">${latestData.dayLow?.toFixed(2)} - ${latestData.dayHigh?.toFixed(2)}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-gray-400">RSI (14)</div>
            <div className={`text-xl font-bold font-mono ${rsiColor}`}>{latestData.rsi?.toFixed(1)}</div>
            <div className={`text-xs ${rsiColor}`}>{rsiStatus}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-gray-400">SMA 20</div>
            <div className="text-xl font-bold font-mono text-yellow-400">${latestData.sma20?.toFixed(2)}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-gray-400">Change</div>
            <div className={`text-xl font-bold font-mono ${latestData.change_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {latestData.change_pct >= 0 ? '+' : ''}{latestData.change_pct?.toFixed(2)}%
            </div>
          </div>
        </div>
      )}

      {/* Indicator Controls */}
      <div className="flex gap-4 items-center bg-slate-800 rounded-lg p-3">
        <span className="text-sm text-gray-400">Indicators:</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showSMA} onChange={(e) => setShowSMA(e.target.checked)} className="rounded" />
          <span className="text-sm text-yellow-400">SMA 20/50</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showBB} onChange={(e) => setShowBB(e.target.checked)} className="rounded" />
          <span className="text-sm text-cyan-400">Bollinger Bands</span>
        </label>
        <div className="ml-auto flex gap-2">
          <button onClick={fetchInterpretation} disabled={interpreting}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 rounded-lg text-sm font-medium transition flex items-center gap-2">
            {interpreting ? 'Analyzing...' : '🤖 AI Analysis'}
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-slate-800 rounded-lg p-4">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center text-gray-400">Loading chart data...</div>
        ) : (
          <>
            <div ref={chartContainerRef} className="w-full" />
            <div className="mt-2 text-xs text-gray-500">RSI (14)</div>
            <div ref={rsiContainerRef} className="w-full" />
          </>
        )}
      </div>

      {/* AI Interpretation */}
      {interpretation && (
        <div className="bg-gradient-to-r from-purple-900/30 to-slate-800 rounded-lg p-6 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🤖</span>
            <h3 className="text-lg font-bold text-purple-300">JAX-CHART-ANALYST Interpretation</h3>
          </div>
          <div className="prose prose-invert prose-sm max-w-none">
            {interpretation.split('\n').map((line, i) => (
              <p key={i} className={line.startsWith('**') ? 'font-bold text-purple-200' : 'text-gray-300'}>{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-slate-800 rounded-lg p-4 text-xs text-gray-400">
        <h4 className="font-bold mb-2 text-gray-300">Chart Legend</h4>
        <div className="grid grid-cols-4 gap-4">
          <div><span className="inline-block w-3 h-3 bg-green-500 mr-2"></span>Bullish Candle</div>
          <div><span className="inline-block w-3 h-3 bg-red-500 mr-2"></span>Bearish Candle</div>
          <div><span className="inline-block w-3 h-0.5 bg-yellow-400 mr-2 align-middle"></span>SMA 20</div>
          <div><span className="inline-block w-3 h-0.5 bg-purple-500 mr-2 align-middle"></span>SMA 50</div>
          <div><span className="inline-block w-3 h-0.5 border-t border-dashed border-cyan-400 mr-2 align-middle"></span>Bollinger Bands</div>
          <div><span className="inline-block w-3 h-0.5 bg-purple-400 mr-2 align-middle"></span>RSI (14)</div>
          <div className="col-span-2">RSI &gt; 70: Overbought | RSI &lt; 30: Oversold</div>
        </div>
      </div>
    </div>
  );
};

export default ChartIntelligence;
