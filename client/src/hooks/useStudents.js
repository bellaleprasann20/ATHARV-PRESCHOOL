import { useState, useMemo } from 'react';

export const useStudents = (students) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('All');

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = 
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesClass = filterClass === 'All' || student.enrollmentClass === filterClass;
      
      return matchesSearch && matchesClass;
    });
  }, [students, searchTerm, filterClass]);

  return {
    searchTerm,
    setSearchTerm,
    filterClass,
    setFilterClass,
    filteredStudents
  };
};