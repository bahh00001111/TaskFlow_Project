import { useEffect, useState } from "react";
import axiosClient from "../api/axios";

export default function Dashboard() {
    const [stats, setStats] = useState({
        total_projects: 0,
        total_tasks: 0,
        completed_tasks: 0,
        in_progress_tasks: 0,
        to_do_tasks: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosClient.get('/dashboard/stats')
            .then(({ data }) => {
                setStats(data.data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <p style={{ textAlign: 'center', padding: '20px' }}>Loading dashboard data...</p>;
    }

    return (
        <div>
            <h1>Dashboard Overview</h1>
            <p style={{ color: '#666', marginBottom: '20px' }}>Welcome back! Here is a summary of your projects and tasks.</p>

            {/* Stats Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '5px solid #1976d2' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Total Projects</h4>
                    <h2 style={{ margin: 0, color: '#1976d2' }}>{stats.total_projects}</h2>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '5px solid #ff9800' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Total Tasks</h4>
                    <h2 style={{ margin: 0, color: '#ff9800' }}>{stats.total_tasks}</h2>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '5px solid #2e7d32' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Completed Tasks</h4>
                    <h2 style={{ margin: 0, color: '#2e7d32' }}>{stats.completed_tasks}</h2>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '5px solid #0288d1' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>In Progress</h4>
                    <h2 style={{ margin: 0, color: '#0288d1' }}>{stats.in_progress_tasks}</h2>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '5px solid #f57c00' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>To Do</h4>
                    <h2 style={{ margin: 0, color: '#f57c00' }}>{stats.to_do_tasks}</h2>
                </div>

            </div>
        </div>
    );
}