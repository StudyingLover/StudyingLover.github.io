import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';

// ------------------- 工具函数 (保持不变) -------------------
const getWeatherIcon = (code) => {
  const map = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
    45: '🌫️', 48: '🌫️',
    51: '🌧️', 53: '🌧️', 55: '🌧️',
    61: '☔', 63: '☔', 65: '☔',
    71: '❄️', 73: '❄️', 75: '❄️',
    80: '🌦️', 81: '🌦️', 82: '⛈️',
    95: '⚡', 96: '⚡', 99: '⚡',
  };
  return map[code] || '❓';
};

const getWeatherLabel = (code) => {
    const map = {
        0: '晴朗', 1: '多云', 2: '多云', 3: '阴天',
        45: '雾', 48: '雾凇', 51: '毛毛雨', 61: '小雨', 63: '中雨',
        65: '大雨', 80: '阵雨', 95: '雷雨'
    };
    return map[code] || '未知';
}

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

const formatShortDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
};

// ------------------- 自定义 Tooltip (保持风格一致) -------------------
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 rounded-xl shadow-lg text-sm">
          <p className="font-bold text-zinc-700 dark:text-zinc-200 mb-2">{formatDate(label)}</p>
          <div className="space-y-1">
              <p className="text-orange-500 font-medium">最高温: {payload[0].value}°C</p>
              <p className="text-blue-500 font-medium">最低温: {payload[1].value}°C</p>
          </div>
        </div>
      );
    }
    return null;
};

// ------------------- 主组件 -------------------
const WeatherChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState('locating'); // locating, success, default

  // 默认坐标 (西安)，作为降级方案
  const DEFAULT_LAT = 39.54;
  const DEFAULT_LON = 116.24;
  const PAST_DAYS = 7;
  const FUTURE_DAYS = 10;

  useEffect(() => {
    // 封装获取天气的函数，接收经纬度参数
    const fetchWeather = async (lat, lon) => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&past_days=${PAST_DAYS}&forecast_days=${FUTURE_DAYS}`;
        const response = await fetch(url);
        const resData = await response.json();
        
        const formattedData = resData.daily.time.map((date, index) => ({
            date: date,
            shortDate: formatShortDate(date),
            max: resData.daily.temperature_2m_max[index],
            min: resData.daily.temperature_2m_min[index],
            code: resData.daily.weathercode[index],
            isToday: new Date().toISOString().split('T')[0] === date
        }));

        setData(formattedData);
        setLoading(false);
      } catch (err) {
        console.error("Weather fetch failed:", err);
        setLoading(false);
      }
    };

    // 获取用户位置逻辑
    const getLocationAndFetch = () => {
      if (!navigator.geolocation) {
        // 浏览器不支持地理位置，使用默认
        setLocationStatus('default');
        fetchWeather(DEFAULT_LAT, DEFAULT_LON);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // 成功获取位置
          setLocationStatus('success');
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          // 获取失败 (用户拒绝或超时)，使用默认
          console.warn("Geolocation failed or denied, using default.", error);
          setLocationStatus('default');
          fetchWeather(DEFAULT_LAT, DEFAULT_LON);
        },
        { timeout: 5000 } // 设置5秒超时，避免一直在加载中
      );
    };

    getLocationAndFetch();
  }, []);

  if (loading) {
    return (
        <div className="my-8 animate-pulse">
            <div className="h-8 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded mb-6"></div>
            <div className="h-[250px] bg-zinc-100 dark:bg-zinc-800/50 rounded-xl mb-10"></div>
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg"></div>
                ))}
            </div>
        </div>
    );
  }

  // 计算今天的日期用于图表参考线
  const todayStr = data.find(d => d.isToday)?.date;

  return (
    <div className="my-8">
      {/* 1. 标题区域 (增加位置状态显示) */}
      <div className="flex justify-between items-baseline gap-2 border-b mb-6 dark:border-b-zinc-700 pb-2">
        <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Weather Trends</h2>
            {/* 状态徽章 */}
            {locationStatus === 'success' ? (
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Local
                </span>
            ) : (
                <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                    Default (Beijing)
                </span>
            )}
        </div>
        <span className="text-sm text-zinc-500 dark:text-zinc-400 hidden sm:block">
             过去{PAST_DAYS}天 & 未来{FUTURE_DAYS}天
        </span>
      </div>

      {/* 2. 折线图区域 */}
      <div className="h-[250px] w-full mb-10 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" opacity={0.2} />
            <XAxis 
                dataKey="date" 
                tickFormatter={formatShortDate} 
                stroke="#71717a" 
                fontSize={12}
                tickMargin={10}
            />
            <YAxis stroke="#71717a" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            
            {/* 今天的参考线 */}
            {todayStr && (
                <ReferenceLine x={todayStr} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: '#10b981', fontSize: 12 }} />
            )}

            <Line 
                type="monotone" 
                dataKey="max" 
                stroke="#f97316" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#f97316' }} 
                activeDot={{ r: 6 }} 
                animationDuration={1000}
            />
            <Line 
                type="monotone" 
                dataKey="min" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#3b82f6' }} 
                animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 3. 详细列表区域 (保持你的博客风格) */}
      <div className="flex flex-col gap-1">
        {data.map((day) => (
          <div 
            key={day.date} 
            className={`flex flex-col sm:flex-row gap-2 sm:items-center border-b py-2 mb-1 dark:border-b-zinc-700 transition-colors 
                ${day.isToday ? 'bg-zinc-50 dark:bg-zinc-800/50 -mx-2 px-2 rounded-lg' : ''}`}
          >
            <div className="text-zinc-700 text-sm w-32 dark:text-zinc-300 shrink-0 font-mono">
               <time dateTime={day.date}>{formatDate(day.date)}</time>
            </div>

            <h3 className="font-medium grow flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
               <span className="text-xl">{getWeatherIcon(day.code)}</span>
               <span>{getWeatherLabel(day.code)}</span>
               {day.isToday && <span className="text-[10px] font-bold text-emerald-600 border border-emerald-500 rounded px-1.5 py-0.5 ml-2 uppercase tracking-wide">Today</span>}
            </h3>

            <div className="flex gap-2 shrink-0">
                <p className="border border-zinc-300 dark:border-zinc-700 rounded-2xl text-sm text-zinc-700 dark:text-zinc-300 no-underline px-3 py-0.5 whitespace-nowrap tabular-nums">
                    H: {day.max}°
                </p>
                <p className="border border-zinc-300 dark:border-zinc-700 rounded-2xl text-sm text-zinc-700 dark:text-zinc-300 no-underline px-3 py-0.5 whitespace-nowrap tabular-nums">
                    L: {day.min}°
                </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherChart;