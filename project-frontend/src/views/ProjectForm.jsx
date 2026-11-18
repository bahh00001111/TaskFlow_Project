import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../api/axios";

export default function ProjectForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);

    const [project, setProject] = useState({
        id: null,
        name: '',
        description: ''
    });

    // ប្រសិនបើមាន ID ក្នុង URL មានន័យថាជាការ Edit
    useEffect(() => {
        if (id) {
            setLoading(true);
            axiosClient.get(`/projects/${id}`)
                .then(({ data }) => {
                    setLoading(false);
                    setProject(data.data);
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    }, [id]);

    const onSubmit = (ev) => {
        ev.preventDefault();
        setErrors(null);

        if (project.id) {
            // ហៅ API Update ពេលមាន ID
            axiosClient.put(`/projects/${project.id}`, project)
                .then(() => {
                    navigate('/projects');
                })
                .catch((err) => {
                    const response = err.response;
                    if (response && response.status === 422) {
                        setErrors(response.data.errors);
                    }
                });
        } else {
            // ហៅ API Create ពេលអត់ទាន់មាន ID
            axiosClient.post('/projects', project)
                .then(() => {
                    navigate('/projects');
                })
                .catch((err) => {
                    const response = err.response;
                    if (response && response.status === 422) {
                        setErrors(response.data.errors);
                    }
                });
        }
    };

    return (
        <div>
            <h1>{project.id ? `Update Project: ${project.name}` : 'Add New Project'}</h1>
            <div className="card animated fadeInDown" style={{ background: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px', maxWidth: '600px' }}>
                {loading && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
                )}
                {errors && (
                    <div className="alert" style={{ background: '#f8d7da', color: '#721c24', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>
                        {Object.keys(errors).map((key) => (
                            <p key={key}>{errors[key][0]}</p>
                        ))}
                    </div>
                )}
                {!loading && (
                    <form onSubmit={onSubmit}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Project Name</label>
                            <input 
                                value={project.name} 
                                onChange={ev => setProject({...project, name: ev.target.value})} 
                                placeholder="Enter project name" 
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description</label>
                            <textarea 
                                value={project.description} 
                                onChange={ev => setProject({...project, description: ev.target.value})} 
                                placeholder="Enter project description" 
                                rows="4"
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <button className="btn" style={{ padding: '8px 15px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            {project.id ? 'Update Project' : 'Save Project'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}