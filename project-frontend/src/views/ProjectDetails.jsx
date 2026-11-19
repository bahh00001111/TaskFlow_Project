import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosClient from "../api/axios";

export default function ProjectDetails() {
    const { id } = useParams(); // Project ID ពី URL
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);

    // [ADDED] State សម្រាប់រក្សាពាក្យ Search របស់ Tasks
    const [search, setSearch] = useState("");

    // Form State សម្រាប់ Add ឬ Edit Task
    const [task, setTask] = useState({
        id: null,
        title: '',
        description: '',
        status: 'To Do',
        priority: 'Medium',
        due_date: ''
    });
    const [errors, setErrors] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        getProjectDetails();
        getTasks();
    }, [id]);

    // [ADDED] Live Search: រង់ចាំ 300ms បន្ទាប់ពីឈប់វាយអក្សរ ទើបហៅ API ស្វែងរក Tasks
    useEffect(() => {
        const timer = setTimeout(() => {
            getTasks(search);
        }, 300);

        return () => clearTimeout(timer);
    }, [search, id]);

    const getProjectDetails = () => {
        axiosClient.get(`/projects/${id}`)
            .then(({ data }) => {
                setProject(data.data);
            });
    };

    // [UPDATED] កែ getTasks ឱ្យទទួល searchTerm និងបញ្ជូន params: { search } ទៅ API
    const getTasks = (searchTerm = search) => {
        setLoading(true);
        const trimmed = searchTerm.trim();

        axiosClient.get(`/projects/${id}/tasks`, {
            // បើមានពាក្យ search ទើបផ្ញើ query ?search=... ទៅ Backend
            params: trimmed ? { search: trimmed } : {}
        })
            .then(({ data }) => {
                setLoading(false);
                const rawTasks = data?.data?.data ?? data?.data ?? [];
                setTasks(Array.isArray(rawTasks) ? rawTasks : []);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    // [ADDED] Handler សម្រាប់ពេលចុចប៊ូតុង "Search" ឬចុច Enter ក្នុង search input
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        getTasks(search);
    };

    // [ADDED] Handler សម្រាប់ប៊ូតុង "Clear" ដើម្បីលុបពាក្យ search និងបង្ហាញ tasks ទាំងអស់វិញ
    const handleClearSearch = () => {
        setSearch("");
        getTasks("");
    };

    // រៀបចំ Form ពេលចុចปุ่ม Edit Task
    const onEditClick = (t) => {
        setIsEditing(true);
        setTask(t);
        setErrors(null);
    };

    // ត្រឡប់ទៅโหมด Add Task វិញ
    const resetForm = () => {
        setIsEditing(false);
        setTask({
            id: null,
            title: '',
            description: '',
            status: 'To Do',
            priority: 'Medium',
            due_date: ''
        });
        setErrors(null);
    };

    // Submit Form (អាចជា Store ឬ Update)
    const onTaskSubmit = (ev) => {
        ev.preventDefault();
        setErrors(null);

        if (isEditing) {
            // ហៅ API Update Task
            axiosClient.put(`/projects/${id}/tasks/${task.id}`, task)
                .then(() => {
                    resetForm();
                    // [UPDATED] រក្សា search term ដដែលក្រោយ Update Task
                    getTasks(search);
                })
                .catch((err) => {
                    if (err.response && err.response.status === 422) {
                        setErrors(err.response.data.errors);
                    }
                });
        } else {
            // ហៅ API Create Task
            axiosClient.post(`/projects/${id}/tasks`, task)
                .then(() => {
                    resetForm();
                    // [UPDATED] រក្សា search term ដដែលក្រោយ Add Task
                    getTasks(search);
                })
                .catch((err) => {
                    if (err.response && err.response.status === 422) {
                        setErrors(err.response.data.errors);
                    }
                });
        }
    };

    const onDeleteTask = (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) {
            return;
        }
        axiosClient.delete(`/projects/${id}/tasks/${taskId}`)
            .then(() => {
                // [UPDATED] រក្សា search term ដដែលក្រោយ Delete Task
                getTasks(search);
            });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>{project ? `Project: ${project.name}` : 'Project Details'}</h1>
                <Link to="/projects" style={{ padding: '7px 15px', background: '#6c757d', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>
                    Back to Projects
                </Link>
            </div>

            {project && (
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3>Description:</h3>
                    <p>{project.description || 'No description provided.'}</p>
                </div>
            )}

            {/* Form សម្រាប់ Add / Edit Task */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3>{isEditing ? `Edit Task: ${task.title}` : 'Add New Task'}</h3>
                {errors && (
                    <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', marginBottom: '10px', borderRadius: '4px' }}>
                        {Object.keys(errors).map(key => <p key={key}>{errors[key][0]}</p>)}
                    </div>
                )}
                <form onSubmit={onTaskSubmit}>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Title</label>
                        <input
                            type="text"
                            placeholder="Task title"
                            value={task.title}
                            onChange={e => setTask({ ...task, title: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Description</label>
                        <textarea
                            placeholder="Task description"
                            value={task.description || ''}
                            onChange={e => setTask({ ...task, description: e.target.value })}
                            rows="2"
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Status</label>
                            <select
                                value={task.status}
                                onChange={e => setTask({ ...task, status: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Priority</label>
                            <select
                                value={task.priority}
                                onChange={e => setTask({ ...task, priority: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Due Date</label>
                            <input
                                type="date"
                                value={task.due_date || ''}
                                onChange={e => setTask({ ...task, due_date: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ padding: '8px 15px', background: isEditing ? '#1976d2' : '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            {isEditing ? 'Update Task' : 'Save Task'}
                        </button>
                        {isEditing && (
                            <button type="button" onClick={resetForm} style={{ padding: '8px 15px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* បញ្ជី Tasks */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                {/* [UPDATED] រៀបចំ Header ឱ្យមាន Title និង Search Form (Live Search + ប៊ូតុង Search/Clear) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0 }}>Project Tasks</h3>

                    <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            placeholder="Search by title or status..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                minWidth: '220px'
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                padding: '6px 14px',
                                background: '#1976d2',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Search
                        </button>
                        {/* បង្ហាញប៊ូតុង Clear តែពេលមានពាក្យ search */}
                        {search && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                style={{
                                    padding: '6px 12px',
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
                </div>

                {loading ? (
                    <p style={{ textAlign: 'center', padding: '20px' }}>Loading tasks...</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>
                                <th style={{ padding: '10px' }}>Title</th>
                                <th style={{ padding: '10px' }}>Description</th>
                                <th style={{ padding: '10px' }}>Status</th>
                                <th style={{ padding: '10px' }}>Priority</th>
                                <th style={{ padding: '10px' }}>Due Date</th>
                                <th style={{ padding: '10px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No tasks found for this project.</td>
                                </tr>
                            ) : (
                                tasks.map(t => (
                                    <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>{t.title}</td>
                                        <td style={{ padding: '10px' }}>{t.description}</td>
                                        <td style={{ padding: '10px' }}>
                                            <span style={{
                                                padding: '3px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                background: t.status === 'Completed' ? '#d4edda' : t.status === 'In Progress' ? '#cce5ff' : '#fff3cd',
                                                color: t.status === 'Completed' ? '#155724' : t.status === 'In Progress' ? '#004085' : '#856404'
                                            }}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px' }}>{t.priority}</td>
                                        <td style={{ padding: '10px' }}>{t.due_date}</td>
                                        <td style={{ padding: '10px' }}>
                                            <button onClick={() => onEditClick(t)} style={{ padding: '5px 10px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>
                                                Edit
                                            </button>
                                            <button onClick={() => onDeleteTask(t.id)} style={{ padding: '5px 10px', background: '#b71c1c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}