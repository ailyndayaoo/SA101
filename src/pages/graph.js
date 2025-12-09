import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import '../css/graph.css';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Graph() {
    const [financialData, setFinancialData] = useState({ sales: [], commissions: [], debt: [] });

    useEffect(() => {
        fetch('http://localhost:3001/graph')
            .then((response) => response.json())
            .then((data) => setFinancialData(data))
            .catch((error) => console.error('Error fetching financial data:', error));
    }, []);

    // Sort the data by month in ascending order
    const sortByDate = (data) => {
        return data.sort((a, b) => new Date(a.month) - new Date(b.month));
    };

    const sortedSales = sortByDate(financialData.sales);
    const sortedCommissions = sortByDate(financialData.commissions);
    const sortedDebt = sortByDate(financialData.debt);

    // Extract unique months, formatted as 'YYYY-MM'
    const sortedMonths = sortedSales.map((entry) => {
        const month = new Date(entry.month);
        return `${month.getFullYear()}-${(month.getMonth() + 1).toString().padStart(2, '0')}`;
    });

    // Prepare data for sales graph
    const salesData = {
        labels: sortedMonths, // Use sorted and formatted months as x-axis labels
        datasets: [
            {
                label: 'Sales Amount',
                data: sortedSales.map((entry) => entry.sales),
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.2)',
                tension: 0.1,
            },
        ],
    };

    // Prepare data for commission graph
    const commissionData = {
        labels: sortedMonths, // Use sorted and formatted months as x-axis labels
        datasets: [
            {
                label: 'Commission Amount',
                data: sortedCommissions.map((entry) => entry.commission),
                borderColor: 'rgba(153,102,255,1)',
                backgroundColor: 'rgba(153,102,255,0.2)',
                tension: 0.1,
            },
        ],
    };

    // Prepare data for debt graph
    const debtData = {
        labels: sortedMonths, // Use sorted and formatted months as x-axis labels
        datasets: [
            {
                label: 'Debt Amount',
                data: sortedDebt.map((entry) => entry.debt),
                borderColor: 'rgba(255,99,132,1)',
                backgroundColor: 'rgba(255,99,132,0.2)',
                tension: 0.1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => `$${tooltipItem.raw}`,
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Month',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Amount',
                },
            },
        },
    };

    return (
        <div className="graph-container">
            <h1>Yearly Graph</h1>

            <div className="chart-wrapper">
                <div className="chart-title">
                    <h2>Sales</h2>
                </div>
                <Line data={salesData} options={options} />
            </div>

            <div className="chart-wrapper">
                <div className="chart-title">
                    <h2>Commission</h2>
                </div>
                <Line data={commissionData} options={options} />
            </div>

            <div className="chart-wrapper">
                <div className="chart-title">
                    <h2>Debt</h2>
                </div>
                <Line data={debtData} options={options} />
            </div>
        </div>
    );
}

export default Graph;
