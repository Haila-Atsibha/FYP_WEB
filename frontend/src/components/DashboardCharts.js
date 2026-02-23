"use client";

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export const ChartCard = ({ title, children, className = "" }) => (
    <div className={`bg-surface border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all ${className}`}>
        <h3 className="text-lg font-bold text-foreground mb-6">{title}</h3>
        <div className="h-[300px] flex items-center justify-center">
            {children}
        </div>
    </div>
);

const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                    family: 'Inter, sans-serif',
                    size: 12
                },
                color: 'rgba(156, 163, 175, 1)' // text-text-muted approx
            }
        },
        tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            padding: 12,
            cornerRadius: 12,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            usePointStyle: true,
        }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: 'rgba(156, 163, 175, 1)' }
        },
        y: {
            grid: { color: 'rgba(229, 231, 235, 0.1)' },
            ticks: { color: 'rgba(156, 163, 175, 1)' }
        }
    }
};

export const MonthlyBookingsChart = ({ data }) => {
    const chartData = {
        labels: data?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Bookings',
                data: data?.values || [65, 59, 80, 81, 56, 55],
                fill: true,
                borderColor: '#f97316', // primary
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    return <Line data={chartData} options={commonOptions} />;
};

export const RevenueChart = ({ data }) => {
    const chartData = {
        labels: data?.labels || ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                label: 'Revenue ($)',
                data: data?.values || [1200, 1900, 1500, 2500],
                backgroundColor: '#f97316',
                borderRadius: 8,
            },
        ],
    };

    return <Bar data={chartData} options={commonOptions} />;
};

export const CategoryChart = ({ data }) => {
    const chartData = {
        labels: data?.labels || ['Cleaning', 'Repair', 'Beauty', 'Delivery'],
        datasets: [
            {
                data: data?.values || [40, 25, 20, 15],
                backgroundColor: [
                    '#f97316',
                    '#fb923c',
                    '#fdba74',
                    '#fed7aa',
                ],
                borderWidth: 0,
            },
        ],
    };

    const pieOptions = {
        ...commonOptions,
        scales: {} // Remove scales for pie
    };

    return <Pie data={chartData} options={pieOptions} />;
};
