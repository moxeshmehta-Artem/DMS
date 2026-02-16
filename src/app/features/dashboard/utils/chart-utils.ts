export function prepareChartData(appointments: any[]) {
    // Doughnut Chart: Status Distribution
    const statuses = ['CONFIRMED', 'PENDING', 'COMPLETED', 'REJECTED'];
    const displayLabels = ['Confirmed', 'Pending', 'Completed', 'Rejected'];
    const statusCounts = statuses.map(status => appointments.filter(a => a.status === status).length);

    const chartData = {
        labels: displayLabels,
        datasets: [
            {
                data: statusCounts,
                backgroundColor: ['#22C55E', '#F59E0B', '#3B82F6', '#EF4444'],
                hoverBackgroundColor: ['#16A34A', '#D97706', '#2563EB', '#DC2626']
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    color: '#495057'
                }
            }
        }
    };

    // Bar Chart: Upcoming vs Past (Simple week view)
    const labels = [];
    const data = [];
    const today = new Date();

    for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

        const dateStr = date.toISOString().split('T')[0];
        const count = appointments.filter(a => a.appointmentDate === dateStr).length;
        data.push(count);
    }

    const barChartData = {
        labels: labels,
        datasets: [
            {
                label: 'Appointments',
                data: data,
                backgroundColor: '#6366f1',
                borderColor: '#4f46e5',
                borderWidth: 1,
                barThickness: 40
            }
        ]
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#495057'
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#495057',
                    stepSize: 5
                },
                grid: {
                    color: '#ebedef'
                }
            },
            x: {
                ticks: {
                    color: '#495057'
                },
                grid: {
                    color: '#ebedef'
                }
            }
        }
    };

    return {
        chartData,
        chartOptions,
        barChartData,
        barChartOptions
    };
}
