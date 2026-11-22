import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosClient from "../api/axios";

export default function ProjectDetails() {
    const { id } = useParams(); // Project ID ពី URL
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);

    // [ADDED] State សម្រាប់ Search និង Filter ដាច់ដោយឡែកតាម Status និង Priority
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");

    // Form State សម្រាប់ Add ឬ Edit Task
    const [task, setTask] = useState({
        id: null,
        title: '',
        description: '',
        status: 'To Do',
        priority: 'Medium',
        due_date: ''
    });
    // lfj;ldjfs;kjf
    const [errors, setErrors] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        getProjectDetails();
    }, [id]);

    // [UPDATED] ហៅ getTasks ឡើងវិញ ពេល search, statusFilter, priorityFilter ឬ id ផ្លាស់ប្តូរ (មាន debounce 300ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            getTasks(search, statusFilter, priorityFilter);
        }, 300);

        return () => clearTimeout(timer);
    }, [search, statusFilter, priorityFilter, id]);

    const getProjectDetails = () => {
        axiosClient.get(`/projects/${id}`)
            .then(({ data }) => {
                setProject(data.data);
            });
    };

    // [UPDATED] បញ្ជូន params: { search, status, priority } ទៅកាន់ Backend API
    const getTasks = (
        searchTerm = search,
        statusVal = statusFilter,
        priorityVal = priorityFilter
    ) => {
        setLoading(true);
        const trimmed = searchTerm.trim();

        const params = {};
        if (trimmed) params.search = trimmed;
        if (statusVal) params.status = statusVal;
        if (priorityVal) params.priority = priorityVal;

        axiosClient.get(`/projects/${id}/tasks`, { params })
            .then(({ data }) => {
                setLoading(false);
                const rawTasks = data?.data?.data ?? data?.data ?? [];
                setTasks(Array.isArray(rawTasks) ? rawTasks : []);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    // [ADDED] Handler ពេលចុចប៊ូតុង "Search" ឬចុច Enter
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        getTasks(search, statusFilter, priorityFilter);
    };

    // [ADDED] Handler សម្រាប់ Clear / Reset ទាំង Search, Status និង Priority
    const handleClearAll = () => {
        setSearch("");
        setStatusFilter("");
        setPriorityFilter("");
        getTasks("", "", "");
    };

    const hasActiveFilters = Boolean(search.trim() || statusFilter || priorityFilter);

    // រៀបចំ Form ពេលចុចប៊ូតុង Edit Task
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
            axiosClient.put(`/projects/${id}/tasks/${task.id}`, task)
                .then(() => {
                    resetForm();
                    // [UPDATED] រក្សា filter បច្ចុប្បន្នក្រោយពេល Update
                    getTasks(search, statusFilter, priorityFilter);
                })
                .catch((err) => {
                    if (err.response && err.response.status === 422) {
                        setErrors(err.response.data.errors);
                    }
                });
        } else {
            axiosClient.post(`/projects/${id}/tasks`, task)
                .then(() => {
                    resetForm();
                    // [UPDATED] រក្សា filter បច្ចុប្បន្នក្រោយពេល Create
                    getTasks(search, statusFilter, priorityFilter);
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
                // [UPDATED] រក្សា filter បច្ចុប្បន្នក្រោយពេល Delete
                getTasks(search, statusFilter, priorityFilter);
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
                {/* [UPDATED] Header មាន Title + Search Input + Status Dropdown + Priority Dropdown + Reset */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0 }}>Project Tasks</h3>

                    <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                        {/* Search Input */}
                        <input
                            type="text"
                            placeholder="Search title or description..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                minWidth: '200px'
                            }}
                        />

                        {/* [ADDED] Dropdown Filter តាម Status */}
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            aria-label="Filter by Status"
                            style={{
                                padding: '6px 10px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                background: 'white'
                            }}
                        >
                            <option value="">All Statuses</option>
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>

                        {/* [ADDED] Dropdown Filter តាម Priority */}
                        <select
                            value={priorityFilter}
                            onChange={e => setPriorityFilter(e.target.value)}
                            aria-label="Filter by Priority"
                            style={{
                                padding: '6px 10px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                background: 'white'
                            }}
                        >
                            <option value="">All Priorities</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>

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

                        {/* [ADDED] ប៊ូតុង Clear / Reset បង្ហាញពេលមាន Filter ណាមួយកំពុងប្រើ */}
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleClearAll}
                                style={{
                                    padding: '6px 12px',
                                    background: '#e0e0e0',
                                    color: '#333',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Reset
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
                                (Array.isArray(tasks) ? tasks : []).map(t => (
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