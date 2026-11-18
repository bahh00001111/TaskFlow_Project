import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axios";

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState(null);

    useEffect(() => {
        getProjects();
    }, []);

    const getProjects = (url) => {
        url = url || '/projects';
        setLoading(true);
        axiosClient.get(url)
            .then(({ data }) => {
                setLoading(false);
                setProjects(data.data.data);
                setMeta(data.data.meta);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const onDeleteClick = (project) => {
        if (!window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
            return;
        }
        axiosClient.delete(`/projects/${project.id}`)
            .then(() => {
                getProjects();
            });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Projects</h1>
                <Link to="/projects/new" style={{ padding: '7px 15px', background: '#e3870f', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>
                    Add New Project
                </Link>
            </div>
            <div className="card animated fadeInDown" style={{ marginTop: '20px', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>
                            <th style={{ padding: '10px' }}>ID</th>
                            <th style={{ padding: '10px' }}>Name</th>
                            <th style={{ padding: '10px' }}>Description</th>
                            <th style={{ padding: '10px' }}>Created Date</th>
                            <th style={{ padding: '10px' }}>Actions</th>
                        </tr>
                    </thead>
                    {loading && (
                        <tbody>
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td>
                            </tr>
                        </tbody>
                    )}
                    {!loading && (
                        <tbody>
                            {projects.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No projects found.</td>
                                </tr>
                            ) : (
                                projects.map((p) => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>{p.id}</td>
                                        <td style={{ padding: '10px' }}>{p.name}</td>
                                        <td style={{ padding: '10px' }}>{p.description}</td>
                                        <td style={{ padding: '10px' }}>{p.created_at}</td>
                                        <td style={{ padding: '10px' }}>
                                            <Link to={`/projects/${p.id}/details`} style={{ padding: '5px 10px', background: '#2e7d32', color: 'white', borderRadius: '4px', textDecoration: 'none', marginRight: '5px' }}>
                                                Tasks
                                            </Link>
                                            <Link to={`/projects/${p.id}`} style={{ padding: '5px 10px', background: '#1976d2', color: 'white', borderRadius: '4px', textDecoration: 'none', marginRight: '5px' }}>
                                                Edit
                                            </Link>
                                            <button onClick={() => onDeleteClick(p)} style={{ padding: '5px 10px', background: '#b71c1c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    )}
                </table>

                {/* Pagination Controls */}
                {meta && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '5px' }}>
                        {meta.links && meta.links.map((link, index) => (
                            <button
                                key={index}
                                onClick={() => link.url && getProjects(link.url)}
                                disabled={!link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                style={{
                                    padding: '5px 10px',
                                    border: '1px solid #ccc',
                                    background: link.active ? '#1976d2' : 'white',
                                    color: link.active ? 'white' : 'black',
                                    borderRadius: '4px',
                                    cursor: link.url ? 'pointer' : 'default',
                                    opacity: link.url ? 1 : 0.5
                                }}
                            ></button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}