import { useEffect, useState } from "react";
import axios from "axios";

interface Department {
  id: number;
  abbreviation: string;
  name: string;
  description: string;
  status: string;
}

export default function Dashboard() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({ abbreviation: "", name: "", description: "", status: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const fullname = localStorage.getItem("fullname");

  const api = axios.create({
    baseURL: "http://localhost:4000",
    headers: { "Content-Type": "application/json" },
  });

  // Load all users
  const fetchDepartments = async () => {
    const res = await api.get("/departments");
    setDepartments(res.data);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleSubmit = async () => {
      if (
    !form.abbreviation.trim() ||
    !form.name.trim() ||
    !form.description.trim() ||
    !form.status.trim()
  ) {
    alert("Please fill in all fields before submitting.");
    return;
  }
    if (editingId) {
      await api.put(`/departments/${editingId}`, form);
    } else {
      await api.post("/departments", form);
    }
    setForm({ abbreviation: "", name: "", description: "", status: "" });
    setEditingId(null);
    fetchDepartments();
  };


  const handleEdit = (department: Department) => {
    setForm({
      abbreviation: department.abbreviation,
      name: department.name,
      description: department.description,
      status: department.status,
    });
    setEditingId(department.id);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this department?")) {
      await api.delete(`/departments/${id}`);
      fetchDepartments();
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("fullname");
    window.location.href = "/";
  };

  return (
    <div className="dashboard">
      <h1>Welcome, {fullname}</h1>
      <button onClick={handleLogout}>Logout</button>

      <hr />

      <h2>{editingId ? "Edit Department" : "Add New Department"}</h2>
      <input name="abbreviation" placeholder="Abbreviation" value={form.abbreviation} onChange={handleChange} required/>
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required/>
      <input name="description" placeholder="description" value={form.description} onChange={handleChange} required/>
      <input name="status" placeholder="status" value={form.status} onChange={handleChange} required/>
      <button onClick={handleSubmit}>{editingId ? "Update" : "Add"}</button>

      <hr />

      <h2>Department List</h2>
      <table border={1} cellPadding={6}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Abbreviation</th>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.length > 0 ? (
            departments.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.abbreviation}</td>
                <td>{u.name}</td>
                <td>{u.description}</td>
                <td>{u.status}</td>
                <td>
                  <button onClick={() => handleEdit(u)}>Edit</button>
                  <button onClick={() => handleDelete(u.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>No departments found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}