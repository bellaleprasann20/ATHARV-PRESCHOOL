
import { createContext, useState, useContext } from 'react';
import axios from '../api/axios';

const StudentContext = createContext();

export const StudentProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/students');
      setStudents(res.data.students);
    } catch (err) {
      console.error("Error fetching students", err);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = (newStudent) => {
    setStudents((prev) => [...prev, newStudent]);
  };

  const updateStudentState = (updatedStudent) => {
    setStudents((prev) => 
      prev.map(s => s._id === updatedStudent._id ? updatedStudent : s)
    );
  };

  return (
    <StudentContext.Provider value={{ students, loading, fetchStudents, addStudent, updateStudentState }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudents = () => useContext(StudentContext);