// SalesChart.js
import React, { useRef, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function SalesChart({ data, labels, datasets, height = 120, options = {} }) {
  const chartRef = useRef();
  const chartInstance = useRef();

  // Load Chart.js only once
  useEffect(() => {
    async function loadChartLibs() {
      if (!window.Chart) {
        await new Promise(resolve => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }
      if (!window.Chart?.registry?.getPlugin('zoom')) {
        const zoomScript = document.createElement('script');
        zoomScript.src = 'https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom';
        document.body.appendChild(zoomScript);
      }
    }
    loadChartLibs();
  }, []);

  useEffect(() => {
    if (!window.Chart || !labels || !datasets) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    chartInstance.current = new window.Chart(chartRef.current, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          zoom: {
            pan: { enabled: true, mode: 'x' },
            zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' }
          },
          ...options.plugins
        },
        ...options
      }
    });
  }, [labels, datasets, options]);

  useEffect(() => {
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, []);

  return <canvas ref={chartRef} height={height}></canvas>;
}
