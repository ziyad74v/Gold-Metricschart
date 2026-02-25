const priceChartElement = document.getElementById("price-chart");
const volumeChartElement = document.getElementById("volume-chart");
const chartStackElement = document.querySelector(".chart-stack");
const timeframeButtons = Array.from(document.querySelectorAll(".tf-btn[data-interval]"));
const maToggleButton = document.getElementById("ma-toggle");
const fullscreenToggleButton = document.getElementById("fullscreen-toggle");
const alertMenuButton = document.getElementById("alert-menu-button");
const alertPopover = document.getElementById("alert-popover");
const alertPriceInput = document.getElementById("alert-price");
const alertToggleButton = document.getElementById("alert-toggle");
const alertStatus = document.getElementById("alert-status");
const ohlcTf = document.getElementById("ohlc-tf");
const ohlcOpen = document.getElementById("ohlc-open");
const ohlcHigh = document.getElementById("ohlc-high");
const ohlcLow = document.getElementById("ohlc-low");
const ohlcClose = document.getElementById("ohlc-close");
const ohlcChange = document.getElementById("ohlc-change");
const quoteLast = document.getElementById("quote-last");
const quoteChange = document.getElementById("quote-change");
const quoteTime = document.getElementById("quote-time");
const statVolume = document.getElementById("stat-volume");
const statAvgVolume = document.getElementById("stat-avg-volume");
const statRange = document.getElementById("stat-range");
const statPrevClose = document.getElementById("stat-prev-close");
const statOpen = document.getElementById("stat-open");
const statDayRange = document.getElementById("stat-day-range");
const aboutContent = document.getElementById("about-content");
const aboutToggle = document.getElementById("about-toggle");
const seasonalsChartElement = document.getElementById("seasonals-chart");
const seasonalsLegendElement = document.getElementById("seasonals-legend");
const seasonalsHoverCombo = document.getElementById("seasonals-hover-combo");
const seasonalsRightLabels = document.getElementById("seasonals-right-labels");
const summaryNeedle = document.getElementById("gauge-summary-needle");
const summaryValue = document.getElementById("gauge-summary-value");
const summaryShell = document.getElementById("gauge-summary-shell");
const summaryResult = document.getElementById("gauge-summary-result");
const maNeedle = document.getElementById("gauge-ma-needle");
const maValue = document.getElementById("gauge-ma-value");
const maShell = document.getElementById("gauge-ma-shell");
const maResult = document.getElementById("gauge-ma-result");
const indicatorsNeedle = document.getElementById("gauge-indicators-needle");
const indicatorsValue = document.getElementById("gauge-indicators-value");
const indicatorsShell = document.getElementById("gauge-indicators-shell");
const indicatorsResult = document.getElementById("gauge-indicators-result");

const chart = LightweightCharts.createChart(
    priceChartElement,
    {
        layout: {
            background: { color: "#000000" },
            textColor: "#eaecef",
        },
        grid: {
            vertLines: { color: "#1e2329" },
            horzLines: { color: "#1e2329" },
        },
        timeScale: {
            timeVisible: true,
            secondsVisible: false,
            borderColor: "#1e2329",
            rightOffset: 0,
            barSpacing: 6,
            minBarSpacing: 2,
            fixLeftEdge: true,
        },
        rightPriceScale: {
            borderColor: "#1e2329",
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        handleScroll: true,
        handleScale: true,
        width: priceChartElement.clientWidth,
        height: priceChartElement.clientHeight,
    }
);

const volumeChart = LightweightCharts.createChart(
    volumeChartElement,
    {
        layout: {
            background: { color: "#000000" },
            textColor: "#a8b3bf",
        },
        grid: {
            vertLines: { color: "#1e2329" },
            horzLines: { color: "#1e2329" },
        },
        timeScale: {
            timeVisible: true,
            secondsVisible: false,
            borderColor: "#1e2329",
            rightOffset: 0,
            barSpacing: 6,
            minBarSpacing: 2,
            fixLeftEdge: true,
        },
        rightPriceScale: {
            borderColor: "#1e2329",
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        handleScroll: true,
        handleScale: true,
        width: volumeChartElement.clientWidth,
        height: volumeChartElement.clientHeight,
    }
);

const seasonalsChart = LightweightCharts.createChart(
    seasonalsChartElement,
    {
        layout: {
            background: { color: "#000000" },
            textColor: "#9fb0bf",
        },
        grid: {
            vertLines: { visible: false },
            horzLines: { visible: false },
        },
        timeScale: {
            borderColor: "#1e2329",
        },
        rightPriceScale: {
            borderColor: "#1e2329",
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        handleScroll: false,
        handleScale: false,
        width: seasonalsChartElement.clientWidth,
        height: seasonalsChartElement.clientHeight,
    }
);

function resizeChart() {
    chart.applyOptions({
        width: priceChartElement.clientWidth,
        height: priceChartElement.clientHeight,
    });
    volumeChart.applyOptions({
        width: volumeChartElement.clientWidth,
        height: volumeChartElement.clientHeight,
    });
    seasonalsChart.applyOptions({
        width: seasonalsChartElement.clientWidth,
        height: seasonalsChartElement.clientHeight,
    });
    positionSeasonalsRightLabels();
}

function fitMainChartsToContent() {
    chart.timeScale().fitContent();
    volumeChart.timeScale().fitContent();
}

window.addEventListener("resize", resizeChart);

const candleSeries = chart.addSeries(
    LightweightCharts.CandlestickSeries,
    {
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: true,
        borderUpColor: "#26a69a",
        borderDownColor: "#ef5350",
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
        priceScaleId: "right",
        scaleMargins: {
            top: 0.08,
            bottom: 0.3,
        },
    }
);

const maSeries = chart.addSeries(
    LightweightCharts.LineSeries,
    {
        color: "#f0cd68",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true,
        priceScaleId: "right",
    }
);

const volumeHistogramSeries = volumeChart.addSeries(
    LightweightCharts.HistogramSeries,
    {
        priceFormat: {
            type: "volume",
        },
        priceScaleId: "right",
        lastValueVisible: false,
        priceLineVisible: false,
        base: 0,
    }
);

let seasonalsSeriesList = [];

// -------------------------
// Candle Engine
// -------------------------

const STORAGE_KEY = "goldmetrics_candles_v1";
const TIMEFRAME_KEY = "goldmetrics_timeframe_v1";
const MA_VISIBLE_KEY = "goldmetrics_ma_visible_v1";
const ALERT_PRICE_KEY = "goldmetrics_alert_price_v1";
const ALERT_ENABLED_KEY = "goldmetrics_alert_enabled_v1";
const SEASONALS_CACHE_KEY = "goldmetrics_seasonals_history_v1";
const MAX_CANDLES = 1500;
const BASE_INTERVAL = 60; // 1m
const MA_PERIOD = 20;
const MIN_WICK_SIZE = 0.2;
const VOLUME_STEP = 1;
const VOLUME_VOLATILITY_FACTOR = 20;
const DISPLAY_TICK_VOLUME_MULTIPLIER = 1200;
const SEASONAL_TARGET_YEARS = [2025, 2024, 2026];
const SEASONAL_YEAR_COLORS = {
    2025: "#00c176",
    2024: "#f5a000",
    2026: "#3f82ff",
};
const YAHOO_SEASONALS_URL = "https://query1.finance.yahoo.com/v8/finance/chart/GC=F?range=10y&interval=1d";
const SEASONALS_PROXY_URLS = [
    `https://corsproxy.io/?${encodeURIComponent(YAHOO_SEASONALS_URL)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(YAHOO_SEASONALS_URL)}`,
];

const TIMEFRAMES = [60, 300, 900, 1800, 2700, 3600, 86400, 345600];

let currentCandle = null;
let lastCandleTime = null;
let lastPrice = null;

let candles = [];
let selectedInterval = loadTimeframeFromStorage();
let maVisible = loadMaVisibilityFromStorage();
let alertTarget = loadAlertPriceFromStorage();
let alertEnabled = loadAlertEnabledFromStorage() && Number.isFinite(alertTarget);
let audioContext = null;
let alertMenuOpen = false;
let seasonalityLoadedFromHistory = false;
let seasonalsLabelRows = [];
let seasonalsHoverTimestamp = null;
let didInitialAutoScroll = false;
let oneMinuteZoomBars = 260;
const memoryStore = new Map();

function safeStorageGet(key) {
    try {
        const value = localStorage.getItem(key);
        if (value !== null) return value;
    } catch (err) {
        // Storage blocked by browser privacy settings.
    }
    return memoryStore.has(key) ? memoryStore.get(key) : null;
}

function safeStorageSet(key, value) {
    memoryStore.set(key, value);
    try {
        localStorage.setItem(key, value);
    } catch (err) {
        // Storage blocked by browser privacy settings.
    }
}

function safeStorageRemove(key) {
    memoryStore.delete(key);
    try {
        localStorage.removeItem(key);
    } catch (err) {
        // Storage blocked by browser privacy settings.
    }
}

function isValidCandle(candle) {
    return candle
        && Number.isFinite(candle.time)
        && Number.isFinite(candle.open)
        && Number.isFinite(candle.high)
        && Number.isFinite(candle.low)
        && Number.isFinite(candle.close);
}

function normalizeStoredCandle(candle) {
    return {
        ...candle,
        volume: Number.isFinite(candle.volume) ? candle.volume : 0,
    };
}

function loadCandlesFromStorage() {
    try {
        const raw = safeStorageGet(STORAGE_KEY);
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .filter(isValidCandle)
            .map(normalizeStoredCandle)
            .slice(-MAX_CANDLES);
    } catch (err) {
        return [];
    }
}

function saveCandlesToStorage() {
    safeStorageSet(STORAGE_KEY, JSON.stringify(candles));
}

function upsertCandle(nextCandle) {
    const last = candles[candles.length - 1];
    if (last && last.time === nextCandle.time) {
        candles[candles.length - 1] = nextCandle;
    } else {
        candles.push(nextCandle);
        if (candles.length > MAX_CANDLES) {
            candles = candles.slice(-MAX_CANDLES);
        }
    }
}

function ensureVisibleWick(candle) {
    const bodyTop = Math.max(candle.open, candle.close);
    const bodyBottom = Math.min(candle.open, candle.close);

    return {
        ...candle,
        high: Math.max(candle.high, bodyTop + MIN_WICK_SIZE),
        low: Math.min(candle.low, bodyBottom - MIN_WICK_SIZE),
    };
}

function loadTimeframeFromStorage() {
    const raw = safeStorageGet(TIMEFRAME_KEY);
    const parsed = Number(raw);
    if (TIMEFRAMES.includes(parsed)) return parsed;
    return 60;
}

function saveTimeframeToStorage(intervalSec) {
    safeStorageSet(TIMEFRAME_KEY, String(intervalSec));
}

function loadMaVisibilityFromStorage() {
    const raw = safeStorageGet(MA_VISIBLE_KEY);
    if (raw === null) return true;
    return raw === "1";
}

function saveMaVisibilityToStorage(visible) {
    safeStorageSet(MA_VISIBLE_KEY, visible ? "1" : "0");
}

function loadAlertPriceFromStorage() {
    const raw = safeStorageGet(ALERT_PRICE_KEY);
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
}

function saveAlertPriceToStorage(price) {
    if (price === null) {
        safeStorageRemove(ALERT_PRICE_KEY);
    } else {
        safeStorageSet(ALERT_PRICE_KEY, String(price));
    }
}

function loadAlertEnabledFromStorage() {
    return safeStorageGet(ALERT_ENABLED_KEY) === "1";
}

function saveAlertEnabledToStorage(enabled) {
    safeStorageSet(ALERT_ENABLED_KEY, enabled ? "1" : "0");
}

function aggregateCandles(sourceCandles, intervalSec) {
    if (intervalSec === BASE_INTERVAL) return sourceCandles.slice();

    const aggregated = [];

    for (const candle of sourceCandles) {
        const bucketTime = candle.time - (candle.time % intervalSec);
        const last = aggregated[aggregated.length - 1];

        if (!last || last.time !== bucketTime) {
            aggregated.push({
                time: bucketTime,
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
                volume: candle.volume || 0,
            });
        } else {
            last.high = Math.max(last.high, candle.high);
            last.low = Math.min(last.low, candle.low);
            last.close = candle.close;
            last.volume += candle.volume || 0;
        }
    }

    return aggregated;
}

function computeMA(sourceCandles, period) {
    const maData = [];
    let sum = 0;

    for (let i = 0; i < sourceCandles.length; i += 1) {
        sum += sourceCandles[i].close;

        if (i >= period) {
            sum -= sourceCandles[i - period].close;
        }

        if (i >= period - 1) {
            maData.push({
                time: sourceCandles[i].time,
                value: sum / period,
            });
        }
    }

    return maData;
}

function buildVolumeData(sourceCandles) {
    return sourceCandles.map((candle) => ({
        time: candle.time,
        value: candle.volume || 0,
        color: candle.close >= candle.open
            ? "rgba(38, 166, 154, 0.65)"
            : "rgba(239, 83, 80, 0.65)",
    }));
}

function applyDisplayedData() {
    const visibleCandles = aggregateCandles(candles, selectedInterval);
    candleSeries.setData(visibleCandles);
    if (maVisible) {
        maSeries.setData(computeMA(visibleCandles, MA_PERIOD));
    } else {
        maSeries.setData([]);
    }
    volumeHistogramSeries.setData(buildVolumeData(visibleCandles));
    updateOhlcBar(visibleCandles);
    updateMarketStats(visibleCandles);
    if (!seasonalityLoadedFromHistory) {
        updateSeasonalsFallback(visibleCandles);
    }
    if (!didInitialAutoScroll && visibleCandles.length > 0) {
        didInitialAutoScroll = true;
        requestAnimationFrame(() => {
            fitMainChartsToContent();
        });
    }
    return visibleCandles;
}

function getCurrentVisibleBars() {
    const range = chart.timeScale().getVisibleLogicalRange();
    if (!range) return null;
    const bars = range.to - range.from;
    return Number.isFinite(bars) ? bars : null;
}

function getZoomOutFactorForInterval(intervalSec) {
    const factorMap = {
        300: 1.7,     // 5m
        900: 1.9,     // 15m
        1800: 1.7,    // 30m
        2700: 1.85,   // 45m
        3600: 2.0,    // 1h
        345600: 2.35, // 4d
    };
    return factorMap[intervalSec] || 1;
}

function applyConsistentZoom(sourceCandles, targetBars = oneMinuteZoomBars) {
    if (!Array.isArray(sourceCandles) || sourceCandles.length === 0) return;

    // نفس إحساس زوم فريم 1m: نفس عدد الشموع المرئي تقريبًا.
    const barsTarget = Math.max(40, Number.isFinite(targetBars) ? targetBars : oneMinuteZoomBars);
    const bars = sourceCandles.length;
    const to = bars - 0.5;
    const from = Math.max(-0.5, to - barsTarget);
    const range = { from, to };

    chart.timeScale().setVisibleLogicalRange(range);
    volumeChart.timeScale().setVisibleLogicalRange(range);
}

function renderSeasonals(lines) {
    seasonalsSeriesList.forEach((series) => {
        seasonalsChart.removeSeries(series);
    });
    seasonalsSeriesList = [];
    seasonalsLegendElement.innerHTML = "";
    seasonalsRightLabels.innerHTML = "";
    seasonalsLabelRows = [];

    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        const series = seasonalsChart.addSeries(LightweightCharts.LineSeries, {
            color: line.color,
            lineWidth: line.lineWidth || 2,
            priceLineVisible: false,
            lastValueVisible: false,
        });
        series.setData(line.data);
        seasonalsSeriesList.push(series);

        const legend = document.createElement("span");
        legend.className = "seasonals-legend-item";
        legend.innerHTML = `<span class="seasonals-legend-dot" style="background:${line.color}"></span>${line.label}`;
        seasonalsLegendElement.appendChild(legend);

        const badge = document.createElement("div");
        badge.className = "seasonals-right-badge";
        badge.style.background = line.color;
        seasonalsRightLabels.appendChild(badge);

        seasonalsLabelRows.push({ line, series, badge });
    }

    updateSeasonalsRightLabels();
    seasonalsChart.timeScale().fitContent();
    positionSeasonalsRightLabels();
}

function updateSeasonalsRightLabels() {
    for (const row of seasonalsLabelRows) {
        const point = row.line.data[row.line.data.length - 1];
        const value = point ? point.value : 0;
        const sign = value > 0 ? "+" : "";
        row.badge.innerHTML = `<span class="year">${row.line.label}</span><span class="value">${sign}${value.toFixed(2)}%</span>`;
    }
}

function positionSeasonalsRightLabels() {
    if (!seasonalsLabelRows.length) return;

    const rows = [];
    for (const row of seasonalsLabelRows) {
        const point = row.line.data[row.line.data.length - 1];
        if (!point) continue;
        const y = row.series.priceToCoordinate(point.value);
        if (!Number.isFinite(y)) continue;
        rows.push({ row, y });
    }

    rows.sort((a, b) => a.y - b.y);
    const minGap = 24;
    let prevTop = -Infinity;
    const maxTop = Math.max(0, seasonalsChartElement.clientHeight - 24);

    for (const item of rows) {
        let top = Math.round(item.y - 11);
        if (top < 2) top = 2;
        if (top < prevTop + minGap) top = prevTop + minGap;
        if (top > maxTop) top = maxTop;
        item.row.badge.style.top = `${top}px`;
        prevTop = top;
    }
}

function pickSeasonalsPoint(data, hoverTs) {
    if (!data || data.length === 0) return null;
    if (!Number.isFinite(hoverTs)) return data[data.length - 1];
    return findNearestPointByTime(data, hoverTs);
}

function findNearestPointByTime(data, ts) {
    let left = 0;
    let right = data.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const t = data[mid].time;
        if (t === ts) return data[mid];
        if (t < ts) left = mid + 1;
        else right = mid - 1;
    }

    if (left >= data.length) return data[data.length - 1];
    if (right < 0) return data[0];

    const l = data[left];
    const r = data[right];
    return Math.abs(l.time - ts) < Math.abs(r.time - ts) ? l : r;
}

function seasonalsTimeToTimestamp(time) {
    if (typeof time === "number") return time;
    if (time && typeof time === "object" && "year" in time && "month" in time && "day" in time) {
        return Math.floor(Date.UTC(time.year, time.month - 1, time.day) / 1000);
    }
    return null;
}

function updateSeasonalsHoverCombo(ts) {
    if (!Number.isFinite(ts)) {
        seasonalsHoverCombo.hidden = true;
        seasonalsHoverCombo.innerHTML = "";
        return;
    }

    const rows = seasonalsLabelRows.map((row) => {
        const point = pickSeasonalsPoint(row.line.data, ts);
        const value = point ? point.value : 0;
        return {
            label: row.line.label,
            color: row.line.color,
            value,
        };
    });

    rows.sort((a, b) => Number(a.label) - Number(b.label));

    seasonalsHoverCombo.innerHTML = rows.map((r) => {
        const sign = r.value > 0 ? "+" : "";
        return `<span class="seasonals-hover-chip"><span class="seasonals-hover-dot" style="background:${r.color}"></span>${r.label} ${sign}${r.value.toFixed(2)}%</span>`;
    }).join("");
    seasonalsHoverCombo.hidden = false;
}

function dayOfYearUTC(unixSeconds) {
    const d = new Date(unixSeconds * 1000);
    const start = Date.UTC(d.getUTCFullYear(), 0, 1);
    const current = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    return Math.floor((current - start) / 86400000) + 1;
}

function buildSeasonalityLinesFromHistory(rows) {
    const byYear = new Map();
    for (const row of rows) {
        const d = new Date(row.time * 1000);
        const year = d.getUTCFullYear();
        if (!byYear.has(year)) byYear.set(year, []);
        byYear.get(year).push(row);
    }

    const currentRenderYear = new Date().getUTCFullYear();
    const lines = [];
    SEASONAL_TARGET_YEARS.forEach((year) => {
        if (!byYear.has(year)) return;
        const sorted = byYear.get(year).slice().sort((a, b) => a.time - b.time);
        // السنة الحالية ممكن تكون بياناتها قليلة، فنقبل حد أدنى صغير.
        if (sorted.length < 8) return;

        const base = sorted[0].close;
        if (!Number.isFinite(base) || base === 0) return;

        const data = sorted.map((row) => {
            const day = dayOfYearUTC(row.time);
            const t = Math.floor(Date.UTC(currentRenderYear, 0, day) / 1000);
            const value = ((row.close - base) / base) * 100;
            return { time: t, value: Number(value.toFixed(2)) };
        });

        lines.push({
            label: String(year),
            color: SEASONAL_YEAR_COLORS[year] || "#f0cd68",
            data,
            lineWidth: 2,
        });
    });

    return lines;
}

function updateSeasonalsFallback(sourceCandles) {
    const monthBuckets = new Map();
    for (const candle of sourceCandles) {
        const d = new Date(candle.time * 1000);
        const month = d.getUTCMonth();
        const pct = candle.open === 0 ? 0 : ((candle.close - candle.open) / candle.open) * 100;
        const row = monthBuckets.get(month) || { sum: 0, count: 0 };
        row.sum += pct;
        row.count += 1;
        monthBuckets.set(month, row);
    }

    const fallback = [1.2, 0.8, 1.9, 2.6, 3.1, 2.2, 1.4, 1.7, 2.9, 3.4, 2.8, 2.1];
    const year = new Date().getUTCFullYear();
    const points = [];
    for (let month = 0; month < 12; month += 1) {
        const bucket = monthBuckets.get(month);
        const value = bucket && bucket.count > 0 ? bucket.sum / bucket.count : fallback[month];
        points.push({ time: Math.floor(Date.UTC(year, month, 1) / 1000), value: Number(value.toFixed(2)) });
    }

    renderSeasonals([{ label: "تقديري", color: "#f0cd68", data: points, lineWidth: 2 }]);
}

async function initSeasonalsFromHistory() {
    try {
        const cached = safeStorageGet(SEASONALS_CACHE_KEY);
        let rows = null;
        if (cached) {
            const parsed = JSON.parse(cached);
            const fresh = Date.now() - parsed.savedAt < 24 * 60 * 60 * 1000;
            if (fresh && Array.isArray(parsed.rows)) rows = parsed.rows;
        }

        if (!rows) {
            rows = await fetchSeasonalsRowsViaProxy();
            if (rows.length > 0) {
                safeStorageSet(SEASONALS_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), rows }));
            }
        }

        const lines = buildSeasonalityLinesFromHistory(rows || []);
        if (lines.length > 0) {
            seasonalityLoadedFromHistory = true;
            renderSeasonals(lines);
        }
    } catch (err) {
        // fallback will remain active
    }
}

function extractSeasonalsRows(payload) {
    const result = payload?.chart?.result?.[0];
    const stamps = result?.timestamp || [];
    const closes = result?.indicators?.quote?.[0]?.close || [];
    const rows = [];

    for (let i = 0; i < stamps.length; i += 1) {
        const c = closes[i];
        if (Number.isFinite(c)) {
            rows.push({ time: stamps[i], close: c });
        }
    }

    return rows;
}

async function fetchSeasonalsRowsViaProxy() {
    for (const url of SEASONALS_PROXY_URLS) {
        try {
            const res = await fetch(url);
            if (!res.ok) continue;

            const text = await res.text();
            const payload = JSON.parse(text);
            const rows = extractSeasonalsRows(payload);
            if (rows.length > 0) return rows;
        } catch (err) {
            // جرب مصدر بروكسي تالي
        }
    }
    return [];
}

function formatPrice(value) {
    return Number.isFinite(value) ? value.toFixed(2) : "-";
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function averageClose(sourceCandles, length) {
    if (!sourceCandles.length) return null;
    const count = Math.min(length, sourceCandles.length);
    let sum = 0;
    for (let i = sourceCandles.length - count; i < sourceCandles.length; i += 1) {
        sum += sourceCandles[i].close;
    }
    return sum / count;
}

function emaValue(sourceCandles, length) {
    if (!Array.isArray(sourceCandles) || sourceCandles.length < length) return null;
    const alpha = 2 / (length + 1);
    let ema = sourceCandles[0].close;
    for (let i = 1; i < sourceCandles.length; i += 1) {
        ema = (sourceCandles[i].close * alpha) + (ema * (1 - alpha));
    }
    return ema;
}

function signOf(value) {
    if (value > 0) return 1;
    if (value < 0) return -1;
    return 0;
}

function movingAveragesScore(sourceCandles) {
    if (!Array.isArray(sourceCandles) || sourceCandles.length < 8) return 0;

    const lastClose = sourceCandles[sourceCandles.length - 1].close;
    if (!Number.isFinite(lastClose)) return 0;

    // أقرب لفكرة TradingView: مزج عدة SMA + EMA بدل متوسطين فقط.
    const periods = [5, 10, 20, 30, 50, 100, 200].filter((p) => sourceCandles.length >= p);
    if (periods.length === 0) return 0;

    const smaValues = periods.map((p) => ({
        period: p,
        value: averageClose(sourceCandles, p),
    }));
    const emaValues = periods.map((p) => ({
        period: p,
        value: emaValue(sourceCandles, p),
    }));

    // 1) السعر الحالي فوق/تحت كل SMA/EMA.
    let priceVsMa = 0;
    let priceVsMaCount = 0;
    for (const item of [...smaValues, ...emaValues]) {
        if (!Number.isFinite(item.value)) continue;
        priceVsMa += signOf(lastClose - item.value);
        priceVsMaCount += 1;
    }
    if (priceVsMaCount > 0) {
        priceVsMa /= priceVsMaCount;
    }

    // 2) ترتيب المتوسطات (القصير فوق الطويل = زخم شرائي).
    let stackScore = 0;
    let pairCount = 0;
    const stacks = [smaValues, emaValues];
    for (const stack of stacks) {
        for (let i = 0; i < stack.length - 1; i += 1) {
            const shortMa = stack[i].value;
            const longMa = stack[i + 1].value;
            if (!Number.isFinite(shortMa) || !Number.isFinite(longMa)) continue;
            stackScore += signOf(shortMa - longMa);
            pairCount += 1;
        }
    }
    if (pairCount > 0) {
        stackScore /= pairCount;
    }

    const shortMomentum = momentumScore(sourceCandles, 6);
    const baseScore = (priceVsMa * 0.58) + (stackScore * 0.30) + (shortMomentum * 0.12);
    let boostedScore = baseScore >= 0 ? baseScore * 1.45 : baseScore * 1.08;

    // دفع قوي نحو "شراء قوي" عند توافق واضح بين السعر والمتوسطات.
    if (priceVsMa >= 0.6 && stackScore >= 0.35 && shortMomentum >= 0) {
        boostedScore = Math.max(boostedScore, 0.74);
    }

    return clamp(boostedScore, -1, 1);
}

function momentumScore(sourceCandles, length) {
    if (sourceCandles.length <= length) return 0;
    const last = sourceCandles[sourceCandles.length - 1].close;
    const prev = sourceCandles[sourceCandles.length - 1 - length].close;
    if (!Number.isFinite(last) || !Number.isFinite(prev) || prev === 0) return 0;
    const changePct = ((last - prev) / prev) * 100;
    return clamp(changePct / 1.5, -1, 1);
}

function rsiScore(sourceCandles, length) {
    if (sourceCandles.length < length + 1) return 0;
    let gains = 0;
    let losses = 0;
    for (let i = sourceCandles.length - length; i < sourceCandles.length; i += 1) {
        const delta = sourceCandles[i].close - sourceCandles[i - 1].close;
        if (delta > 0) gains += delta;
        else losses += Math.abs(delta);
    }
    if (losses === 0 && gains === 0) return 0;
    if (losses === 0) return 1;
    const rs = gains / losses;
    const rsi = 100 - (100 / (1 + rs));
    return clamp((rsi - 50) / 35, -1, 1);
}

function stochasticScore(sourceCandles, length) {
    if (sourceCandles.length < length) return 0;

    let highestHigh = -Infinity;
    let lowestLow = Infinity;
    for (let i = sourceCandles.length - length; i < sourceCandles.length; i += 1) {
        highestHigh = Math.max(highestHigh, sourceCandles[i].high);
        lowestLow = Math.min(lowestLow, sourceCandles[i].low);
    }

    const lastClose = sourceCandles[sourceCandles.length - 1].close;
    const range = highestHigh - lowestLow;
    if (!Number.isFinite(lastClose) || !Number.isFinite(range) || range <= 0) return 0;

    const k = ((lastClose - lowestLow) / range) * 100;
    return clamp((k - 50) / 35, -1, 1);
}

function gaugeSignal(score) {
    if (score <= -0.65) return { text: "بيع قوي", className: "strong-sell" };
    if (score <= -0.2) return { text: "بيع", className: "sell" };
    if (score < 0.2) return { text: "حيادي", className: "" };
    if (score < 0.65) return { text: "شراء", className: "buy" };
    return { text: "شراء قوي", className: "strong-buy" };
}

function applyGauge(needleElement, valueElement, score) {
    if (!needleElement || !valueElement) return;
    const angle = clamp(score, -1, 1) * 80;
    needleElement.style.transform = `translateX(-50%) rotate(${angle.toFixed(2)}deg)`;
    const signal = gaugeSignal(score);
    valueElement.textContent = signal.text;
    valueElement.classList.remove("buy", "strong-buy", "sell", "strong-sell");
    if (signal.className) valueElement.classList.add(signal.className);
}

function syncContainerState(shellElement, resultElement, score) {
    if (!shellElement || !resultElement) return;
    const signal = gaugeSignal(score);
    const state = signal.className || "neutral";

    shellElement.classList.remove(
        "container-strong-sell-Tat_6ZmA",
        "container-sell-Tat_6ZmA",
        "container-neutral-Tat_6ZmA",
        "container-buy-Tat_6ZmA",
        "container-strong-buy-Tat_6ZmA"
    );
    resultElement.classList.remove(
        "container-strong-sell-vLbFM67a",
        "container-sell-vLbFM67a",
        "container-neutral-vLbFM67a",
        "container-buy-vLbFM67a",
        "container-strong-buy-vLbFM67a"
    );

    const shellClassByState = {
        "strong-sell": "container-strong-sell-Tat_6ZmA",
        sell: "container-sell-Tat_6ZmA",
        neutral: "container-neutral-Tat_6ZmA",
        buy: "container-buy-Tat_6ZmA",
        "strong-buy": "container-strong-buy-Tat_6ZmA",
    };
    const resultClassByState = {
        "strong-sell": "container-strong-sell-vLbFM67a",
        sell: "container-sell-vLbFM67a",
        neutral: "container-neutral-vLbFM67a",
        buy: "container-buy-vLbFM67a",
        "strong-buy": "container-strong-buy-vLbFM67a",
    };

    shellElement.classList.add(shellClassByState[state]);
    resultElement.classList.add(resultClassByState[state]);
}

function updateTechnicalGauges(sourceCandles) {
    if (!Array.isArray(sourceCandles) || sourceCandles.length < 2) {
        applyGauge(summaryNeedle, summaryValue, 0);
        applyGauge(maNeedle, maValue, 0);
        applyGauge(indicatorsNeedle, indicatorsValue, 0);
        return;
    }

    const maScore = movingAveragesScore(sourceCandles);

    const momentum = momentumScore(sourceCandles, 6);
    const trend = momentumScore(sourceCandles, 18);
    const rsiOscScore = rsiScore(sourceCandles, 14);
    const stochOscScore = stochasticScore(sourceCandles, 14);

    // عداد المتذبذبات فقط: مبني على RSI + Stochastic من نفس أسعار الشموع.
    const indicatorsScore = clamp((rsiOscScore * 0.55) + (stochOscScore * 0.45), -1, 1);

    // الملخص يفضل بنفس منطقه العام بدون تغيير سلوك باقي العدادات.
    const summaryOscScore = clamp((rsiOscScore * 0.6) + (momentum * 0.4), -1, 1);
    const summaryScore = clamp((maScore * 0.45) + (summaryOscScore * 0.35) + (trend * 0.2), -1, 1);

    applyGauge(maNeedle, maValue, maScore);
    syncContainerState(maShell, maResult, maScore);
    applyGauge(indicatorsNeedle, indicatorsValue, indicatorsScore);
    syncContainerState(indicatorsShell, indicatorsResult, indicatorsScore);
    applyGauge(summaryNeedle, summaryValue, summaryScore);
    syncContainerState(summaryShell, summaryResult, summaryScore);
}

function updateOhlcBar(sourceCandles) {
    const last = sourceCandles[sourceCandles.length - 1];
    const activeTfButton = timeframeButtons.find(
        (button) => Number(button.dataset.interval) === selectedInterval
    );

    ohlcTf.textContent = activeTfButton ? activeTfButton.textContent : "-";

    if (!last) {
        ohlcOpen.textContent = "-";
        ohlcHigh.textContent = "-";
        ohlcLow.textContent = "-";
        ohlcClose.textContent = "-";
        ohlcChange.textContent = "0.00%";
        ohlcChange.classList.remove("up", "down");
        return;
    }

    ohlcOpen.textContent = formatPrice(last.open);
    ohlcHigh.textContent = formatPrice(last.high);
    ohlcLow.textContent = formatPrice(last.low);
    ohlcClose.textContent = formatPrice(last.close);

    const pct = last.open === 0 ? 0 : ((last.close - last.open) / last.open) * 100;
    const sign = pct > 0 ? "+" : "";
    ohlcChange.textContent = `${sign}${pct.toFixed(2)}%`;
    ohlcChange.classList.toggle("up", pct > 0);
    ohlcChange.classList.toggle("down", pct < 0);
}

function formatVolume(value) {
    if (!Number.isFinite(value)) return "-";
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toFixed(0);
}

function updateMarketStats(sourceCandles) {
    const last = sourceCandles[sourceCandles.length - 1];
    if (!last) {
        quoteLast.textContent = "-";
        quoteChange.textContent = "+0.000 +0.00%";
        quoteChange.classList.remove("up", "down");
        statVolume.textContent = "-";
        statAvgVolume.textContent = "-";
        statRange.textContent = "-";
        statPrevClose.textContent = "-";
        statOpen.textContent = "-";
        statDayRange.textContent = "-";
        quoteTime.textContent = "اعتبارًا من اليوم في --:-- غرينتش+2";
        updateTechnicalGauges(sourceCandles);
        return;
    }

    const count = Math.min(sourceCandles.length, 20);
    let volumeSum = 0;
    for (let i = sourceCandles.length - count; i < sourceCandles.length; i += 1) {
        volumeSum += sourceCandles[i].volume || 0;
    }
    const avgVol = count > 0 ? volumeSum / count : 0;

    const range = last.high - last.low;
    quoteLast.textContent = formatPrice(last.close);
    const displayVolume = (last.volume || 0) * DISPLAY_TICK_VOLUME_MULTIPLIER;
    const displayAvgVolume = avgVol * DISPLAY_TICK_VOLUME_MULTIPLIER;
    statVolume.textContent = formatVolume(displayVolume);
    statAvgVolume.textContent = formatVolume(displayAvgVolume);
    statRange.textContent = formatPrice(range);
    statOpen.textContent = formatPrice(last.open);

    const prevCandle = sourceCandles[sourceCandles.length - 2];
    statPrevClose.textContent = prevCandle ? formatPrice(prevCandle.close) : "-";

    const lastDate = new Date(last.time * 1000);
    const y = lastDate.getUTCFullYear();
    const m = lastDate.getUTCMonth();
    const d = lastDate.getUTCDate();
    let dayHigh = -Infinity;
    let dayLow = Infinity;

    for (const candle of sourceCandles) {
        const dt = new Date(candle.time * 1000);
        if (
            dt.getUTCFullYear() === y
            && dt.getUTCMonth() === m
            && dt.getUTCDate() === d
        ) {
            dayHigh = Math.max(dayHigh, candle.high);
            dayLow = Math.min(dayLow, candle.low);
        }
    }

    statDayRange.textContent = Number.isFinite(dayHigh) && Number.isFinite(dayLow)
        ? `${formatPrice(dayLow)} - ${formatPrice(dayHigh)}`
        : "-";

    const absChange = last.close - last.open;
    const pct = last.open === 0 ? 0 : ((last.close - last.open) / last.open) * 100;
    const sign = pct > 0 ? "+" : pct < 0 ? "-" : "";
    quoteChange.textContent = `${sign}${Math.abs(absChange).toFixed(3)} ${sign}${Math.abs(pct).toFixed(2)}%`;
    quoteChange.classList.toggle("up", pct > 0);
    quoteChange.classList.toggle("down", pct < 0);
    const t = new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
    quoteTime.textContent = `اعتبارًا من اليوم في ${t} غرينتش+2`;
    updateTechnicalGauges(sourceCandles);
}

function setActiveTimeframe(intervalSec) {
    selectedInterval = intervalSec;
    saveTimeframeToStorage(intervalSec);
    timeframeButtons.forEach((button) => {
        const value = Number(button.dataset.interval);
        button.classList.toggle("active", value === intervalSec);
    });
    const visibleCandles = applyDisplayedData();
    if (intervalSec === BASE_INTERVAL) {
        const visibleBars = getCurrentVisibleBars();
        if (Number.isFinite(visibleBars)) {
            oneMinuteZoomBars = Math.max(40, visibleBars);
        }
    } else {
        const factor = getZoomOutFactorForInterval(intervalSec);
        applyConsistentZoom(visibleCandles, oneMinuteZoomBars * factor);
    }
}

function setMaVisible(visible) {
    maVisible = visible;
    maToggleButton.classList.toggle("active", visible);
    maToggleButton.setAttribute("aria-pressed", String(visible));
    saveMaVisibilityToStorage(visible);
    applyDisplayedData();
}

function setAlertUI() {
    if (Number.isFinite(alertTarget)) {
        alertPriceInput.value = alertTarget;
    } else {
        alertPriceInput.value = "";
    }
    alertToggleButton.classList.toggle("active", alertEnabled);
    alertToggleButton.setAttribute("aria-pressed", String(alertEnabled));
    alertToggleButton.textContent = alertEnabled ? "Alert On" : "Alert Off";
    alertMenuButton.classList.toggle("alert-armed", alertEnabled);
    alertStatus.textContent = alertEnabled
        ? `Watching ${alertTarget}`
        : "No alert";
}

function setAlertMenuOpen(open) {
    alertMenuOpen = open;
    alertPopover.hidden = !open;
    alertMenuButton.setAttribute("aria-expanded", String(open));
}

function setAlertEnabled(enabled) {
    if (!Number.isFinite(alertTarget)) {
        alertEnabled = false;
    } else {
        alertEnabled = enabled;
    }
    saveAlertEnabledToStorage(alertEnabled);
    setAlertUI();
}

function setAlertPrice(price) {
    alertTarget = Number.isFinite(price) ? price : null;
    saveAlertPriceToStorage(alertTarget);
    if (!Number.isFinite(alertTarget)) {
        setAlertEnabled(false);
    } else {
        setAlertUI();
    }
}

function isFullscreenActive() {
    return Boolean(document.fullscreenElement || document.webkitFullscreenElement);
}

function updateFullscreenButton() {
    const active = isFullscreenActive();
    fullscreenToggleButton.classList.toggle("active", active);
    fullscreenToggleButton.setAttribute("aria-pressed", String(active));
}

async function toggleFullscreen() {
    try {
        if (!isFullscreenActive()) {
            if (chartStackElement.requestFullscreen) {
                await chartStackElement.requestFullscreen();
            } else if (chartStackElement.webkitRequestFullscreen) {
                chartStackElement.webkitRequestFullscreen();
            }
        } else if (document.exitFullscreen) {
            await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    } catch (err) {
        // تجاهل فشل وضع ملء الشاشة
    }
}

function playAlertSound() {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === "suspended") {
            audioContext.resume();
        }
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = 880;
        gainNode.gain.value = 0.04;

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.12);
    } catch (err) {
        // قد يفشل الصوت بدون تفاعل مستخدم مسبق
    }
}

function firePriceAlert(currentPrice) {
    document.body.classList.add("alert-hit");
    setTimeout(() => {
        document.body.classList.remove("alert-hit");
    }, 700);
    playAlertSound();
    alertStatus.textContent = `Hit ${alertTarget} (now ${currentPrice.toFixed(2)})`;
    setAlertMenuOpen(true);
}

function checkPriceAlert(prevPrice, currentPrice) {
    if (!alertEnabled || !Number.isFinite(alertTarget)) return;
    if (!Number.isFinite(prevPrice) || !Number.isFinite(currentPrice)) return;

    const crossedUp = prevPrice < alertTarget && currentPrice >= alertTarget;
    const crossedDown = prevPrice > alertTarget && currentPrice <= alertTarget;

    if (crossedUp || crossedDown) {
        firePriceAlert(currentPrice);
    }
}

candles = loadCandlesFromStorage();

if (candles.length > 0) {
    const last = candles[candles.length - 1];
    currentCandle = { ...last };
    lastCandleTime = last.time;
    lastPrice = last.close;
}

timeframeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const intervalSec = Number(button.dataset.interval);
        if (TIMEFRAMES.includes(intervalSec)) {
            setActiveTimeframe(intervalSec);
        }
    });
});

maToggleButton.addEventListener("click", () => {
    setMaVisible(!maVisible);
});

fullscreenToggleButton.addEventListener("click", () => {
    toggleFullscreen();
});

alertMenuButton.addEventListener("click", (event) => {
    event.stopPropagation();
    setAlertMenuOpen(!alertMenuOpen);
});

alertPriceInput.addEventListener("change", () => {
    const value = Number(alertPriceInput.value);
    if (Number.isFinite(value)) {
        setAlertPrice(value);
    } else {
        setAlertPrice(null);
    }
});

alertToggleButton.addEventListener("click", () => {
    setAlertEnabled(!alertEnabled);
});

document.addEventListener("click", (event) => {
    if (alertPopover.hidden) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest(".alert-menu")) return;
    setAlertMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        setAlertMenuOpen(false);
    }
});

document.addEventListener("fullscreenchange", () => {
    updateFullscreenButton();
    resizeChart();
});

document.addEventListener("webkitfullscreenchange", () => {
    updateFullscreenButton();
    resizeChart();
});

aboutToggle.addEventListener("click", () => {
    const collapsed = aboutContent.classList.toggle("collapsed");
    aboutToggle.textContent = collapsed ? "اعرض المزيد" : "اعرض أقل";
    aboutToggle.setAttribute("aria-expanded", String(!collapsed));
});

let isSyncingRange = false;

chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
    if (isSyncingRange || !range) return;
    isSyncingRange = true;
    volumeChart.timeScale().setVisibleLogicalRange(range);
    isSyncingRange = false;
});

volumeChart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
    if (isSyncingRange || !range) return;
    isSyncingRange = true;
    chart.timeScale().setVisibleLogicalRange(range);
    isSyncingRange = false;
});

seasonalsChart.timeScale().subscribeVisibleLogicalRangeChange(() => {
    positionSeasonalsRightLabels();
});

seasonalsChart.subscribeCrosshairMove((param) => {
    seasonalsHoverTimestamp = (param && param.time) ? seasonalsTimeToTimestamp(param.time) : null;
    updateSeasonalsHoverCombo(seasonalsHoverTimestamp);
});

async function tick() {
    try {
        const res = await fetch("https://api.gold-api.com/price/XAU");
        const data = await res.json();
        const price = data.price;
        const prevPrice = lastPrice;

        const now = Math.floor(Date.now() / 1000);
        const candleTime = now - (now % BASE_INTERVAL);

        if (!currentCandle || candleTime !== lastCandleTime) {
            const activityFromJump = Number.isFinite(lastPrice)
                ? Math.abs(price - lastPrice) * VOLUME_VOLATILITY_FACTOR
                : 0;
            const prevClose = Number.isFinite(lastPrice) ? lastPrice : price;

            currentCandle = {
                time: candleTime,
                open: prevClose,
                high: Math.max(prevClose, price),
                low: Math.min(prevClose, price),
                close: price,
                volume: VOLUME_STEP + activityFromJump,
            };

            lastCandleTime = candleTime;
        } else {
            const delta = Math.abs(price - currentCandle.close);

            currentCandle.high = Math.max(currentCandle.high, price);
            currentCandle.low = Math.min(currentCandle.low, price);
            currentCandle.close = price;
            currentCandle.volume += VOLUME_STEP + (delta * VOLUME_VOLATILITY_FACTOR);
        }

        currentCandle = ensureVisibleWick(currentCandle);
        upsertCandle(currentCandle);
        lastPrice = price;
        checkPriceAlert(prevPrice, price);
        saveCandlesToStorage();
        applyDisplayedData();
    } catch (err) {
        console.log("API error");
    }
}

setActiveTimeframe(selectedInterval);
setMaVisible(maVisible);
setAlertUI();
setAlertMenuOpen(false);
updateFullscreenButton();
resizeChart();
initSeasonalsFromHistory();

tick();
setInterval(tick, 5000);
