import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axios";

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState(null);

    // [ADDED] State សម្រាប់រក្សាពាក្យ Search របស់អ្នកប្រើប្រាស់
    const [search, setSearch] = useState("");

    useEffect(() => {
        getProjects();
    }, []);

    // [UPDATED] កែ getProjects ឱ្យទទួល searchTerm និងបញ្ជូន params: { search } ទៅ API
    const getProjects = (url = '/projects', searchTerm = search) => {
        setLoading(true);
        const trimmed = searchTerm.trim();

        axiosClient.get(url, {
            // បើមានពាក្យ search ទើបផ្ញើ query ?search=... ទៅ Backend
            params: trimmed ? { search: trimmed } : {}
        })
            .then(({ data }) => {
                setLoading(false);
                setProjects(data.data.data);
                setMeta(data.data.meta);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    // [ADDED] Live Search: រង់ចាំ 300ms បន្ទាប់ពីឈប់វាយអក្សរ ទើបហៅ API ស្វែងរក
    useEffect(() => {
        const timer = setTimeout(() => {
            getProjects('/projects', search);
        }, 300);

        // សម្អាត timer ចាស់ បើអ្នកប្រើវាយបន្តមុនពេលគ្រប់ 300ms
        return () => clearTimeout(timer);
    }, [search]);

    // [ADDED] Handler សម្រាប់ពេលចុចប៊ូតុង "Search" ឬចុច Enter ក្នុង input
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        getProjects('/projects', search);
    };

    // [ADDED] Handler សម្រាប់ប៊ូតុង "Clear" ដើម្បីលុបពាក្យ search និងបង្ហាញបញ្ជីដើមវិញ
    const handleClearSearch = () => {
        setSearch("");
        getProjects('/projects', "");
    };

    const onDeleteClick = (project) => {
        if (!window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
            return;
        }
        axiosClient.delete(`/projects/${project.id}`)
            .then(() => {
                // [UPDATED] បញ្ជូន search ជាប់មកជាមួយ ដើម្បីរក្សាលទ្ធផល search ក្រោយពេលលុប
                getProjects('/projects', search);
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

            {/* [ADDED] Search Form: ធ្វើការទាំង Live Search (ពេលវាយ) និងចុចប៊ូតុង Search */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <input
                    type="text"
                    placeholder="Search projects by name or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        padding: '7px 12px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        minWidth: '260px'
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: '7px 14px',
                        background: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Search
                </button>
                {/* បង្ហាញប៊ូតុង Clear តែនៅពេលមានអក្សរក្នុង search input */}
                {search && (
                    <button
                        type="button"
                        onClick={handleClearSearch}
                        style={{
                            padding: '7px 12px',
                            background: '#e0e0e0',
                            color: '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Clear
                    </button>
                )}
            </form>

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
                                // [UPDATED] បញ្ជូន search ទៅជាមួយ ពេលចុចប្ដូរទំព័រ pagination
                                onClick={() => link.url && getProjects(link.url, search)}
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