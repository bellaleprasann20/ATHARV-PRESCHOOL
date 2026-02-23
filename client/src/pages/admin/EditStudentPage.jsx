import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import StudentForm from '../../components/students/StudentForm';
import { useToast } from '../../hooks/useToast';
import axios from '../../api/axios';

const EditStudentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useToast();
  
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await axios.get(`/students/${id}`);
        setStudent(res.data);
      } catch (err) {
        notifyError("Could not find the student record.");
        navigate('/admin/students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id, navigate, notifyError]);

  const handleUpdate = async (updatedData) => {
    try {
      await axios.put(`/students/${id}`, updatedData);
      notifySuccess("Student record updated successfully!");
      navigate('/admin/students');
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to update record.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      try {
        await axios.delete(`/students/${id}`);
        notifySuccess("Student record deleted.");
        navigate('/admin/students');
      } catch (err) {
        notifyError("Error deleting student.");
      }
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="animate-spin mb-2" size={32} />
        <p>Loading student data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-slate-100 rounded-full transition text-slate-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Edit Student</h1>
            <p className="text-sm text-slate-500">Modify information for {student?.firstName} {student?.lastName}</p>
          </div>
        </div>
        
        <button 
          onClick={handleDelete}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg font-bold hover:bg-red-50 transition"
        >
          <Trash2 size={18} /> Delete Record
        </button>
      </div>

      {/* Reusing StudentForm with initialData */}
      <StudentForm 
        initialData={student} 
        onSubmit={handleUpdate} 
      />
    </div>
  );
};

export default EditStudentPage;