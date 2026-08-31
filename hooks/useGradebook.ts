'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface Classroom {
  id: string;
  name: string;
  subject: string;
  teacher_id: string;
}

export function useGradebook() {
  const [teacherId, setTeacherId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);

  const [columns, setColumns] = useState<string[]>([]);
  const [originalColumns, setOriginalColumns] = useState<string[]>([]);
  const [deletedCols, setDeletedCols] = useState<string[]>([]);
  const [students, setStudents] = useState<string[]>([]);
  const [gridData, setGridData] = useState<{ [studentId: string]: { [workId: string]: string | number } }>({});
  const [fileUrls, setFileUrls] = useState<{ [studentId: string]: { [workId: string]: string } }>({});

  const [renamedCols, setRenamedCols] = useState<{ [oldCol: string]: string }>({});
  const [newStudentId, setNewStudentId] = useState<string>('');
  const [newColName, setNewColName] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const savedTeacherId = localStorage.getItem('teacher_id');
    if (savedTeacherId) {
      setTeacherId(savedTeacherId);
      loadClassrooms(savedTeacherId);
    }
  }, []);

  const loadClassrooms = async (id: string) => {
    const { data, error } = await supabase.from('classrooms').select('*').eq('teacher_id', id);
    if (!error && data && data.length > 0) {
      setClassrooms(data);
      setSelectedClassroom(data[0]);
      setIsLoggedIn(true);
    } else {
      handleLogout();
    }
  };

  const handleLogin = async () => {
    if (!teacherId.trim() || !password.trim()) return alert('Enter Teacher ID and Password');

    const { data: teacher, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('password', password)
      .single();

    if (error || !teacher) return alert('Invalid Teacher ID or Password');

    localStorage.setItem('teacher_id', teacherId);
    await loadClassrooms(teacherId);
  };

  const handleLogout = () => {
    localStorage.removeItem('teacher_id');
    setIsLoggedIn(false);
    setClassrooms([]);
    setSelectedClassroom(null);
    setPassword('');
  };

  useEffect(() => {
    if (!selectedClassroom) return;

    const fetchGradeMatrix = async () => {
      const { data, error } = await supabase
        .from('gradebook_scores')
        .select('student_id, work_id, score, file_path')
        .eq('classroom_id', selectedClassroom.id);

      if (error) {
        console.error('Error fetching gradebook scores:', error);
        return;
      }

      const studentSet = new Set<string>();
      const colSet = new Set<string>();
      const matrix: { [studentId: string]: { [workId: string]: string | number } } = {};
      const fileMap: { [studentId: string]: { [workId: string]: string } } = {};

      data?.forEach((row) => {
        if (row.student_id) studentSet.add(row.student_id);
        if (row.work_id) colSet.add(row.work_id);

        if (!matrix[row.student_id]) matrix[row.student_id] = {};
        matrix[row.student_id][row.work_id] = row.score ?? '';

        if (row.file_path) {
          let targetUrl = row.file_path;

          if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            const { data: publicUrlData } = supabase.storage
              .from('student-submissions')
              .getPublicUrl(row.file_path);
            targetUrl = publicUrlData.publicUrl;
          }

          if (!fileMap[row.student_id]) fileMap[row.student_id] = {};
          fileMap[row.student_id][row.work_id] = targetUrl;
        }
      });

      const fetchedCols = Array.from(colSet).sort();
      setStudents(Array.from(studentSet).sort());
      setColumns(fetchedCols);
      setOriginalColumns(fetchedCols);
      setGridData(matrix);
      setFileUrls(fileMap);
      setRenamedCols({});
      setDeletedCols([]);
    };

    fetchGradeMatrix();
  }, [selectedClassroom]);

  const handleColumnHeaderChange = (index: number, newColName: string) => {
    const oldColName = columns[index];
    const origColName = originalColumns[index] || oldColName;

    const updatedCols = [...columns];
    updatedCols[index] = newColName;
    setColumns(updatedCols);

    setRenamedCols((prev) => ({ ...prev, [origColName]: newColName }));

    setGridData((prev) => {
      const updatedGrid = { ...prev };
      Object.keys(updatedGrid).forEach((stId) => {
        if (updatedGrid[stId][oldColName] !== undefined) {
          updatedGrid[stId][newColName] = updatedGrid[stId][oldColName];
          delete updatedGrid[stId][oldColName];
        }
      });
      return updatedGrid;
    });
  };

  const handleDeleteColumn = (index: number) => {
    const colToDelete = columns[index];
    const origColName = originalColumns[index] || colToDelete;

    if (!confirm(`Are you sure you want to delete assignment "${colToDelete}"? All scores for this work will be permanently removed upon saving.`)) {
      return;
    }

    if (originalColumns.includes(origColName)) {
      setDeletedCols((prev) => [...prev, origColName]);
    }

    const updatedCols = columns.filter((_, i) => i !== index);
    setColumns(updatedCols);

    setGridData((prev) => {
      const updatedGrid = { ...prev };
      Object.keys(updatedGrid).forEach((stId) => {
        delete updatedGrid[stId][colToDelete];
      });
      return updatedGrid;
    });
  };

  const handleCellChange = (studentId: string, workId: string, value: string) => {
    setGridData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [workId]: value === '' ? '' : Number(value)
      }
    }));
  };

  const handleSaveChanges = async () => {
    if (!selectedClassroom) return;
    setSaving(true);

    try {
      for (const colToDelete of deletedCols) {
        await supabase
          .from('gradebook_scores')
          .delete()
          .eq('classroom_id', selectedClassroom.id)
          .eq('work_id', colToDelete);
      }

      for (const [origCol, newCol] of Object.entries(renamedCols)) {
        if (origCol !== newCol && newCol.trim() !== '' && !deletedCols.includes(origCol)) {
          await supabase
            .from('gradebook_scores')
            .update({ work_id: newCol.trim() })
            .eq('classroom_id', selectedClassroom.id)
            .eq('work_id', origCol);
        }
      }

      const upsertRows: any[] = [];
      Object.entries(gridData).forEach(([studentId, workMap]) => {
        Object.entries(workMap).forEach(([workId, score]) => {
          if (score !== '' && score !== null && score !== undefined && !deletedCols.includes(workId)) {
            upsertRows.push({
              classroom_id: selectedClassroom.id,
              student_id: studentId,
              work_id: workId,
              score: Number(score)
            });
          }
        });
      });

      if (upsertRows.length > 0) {
        const { error } = await supabase.from('gradebook_scores').upsert(upsertRows, {
          onConflict: 'classroom_id,student_id,work_id'
        });

        if (error) throw new Error(error.message);
      }

      alert('All assignments and scores saved successfully!');
      setOriginalColumns([...columns]);
      setRenamedCols({});
      setDeletedCols([]);
    } catch (err: any) {
      alert(`Error saving gradebook changes: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddStudent = () => {
    if (!newStudentId.trim()) return;
    if (!students.includes(newStudentId.trim())) {
      setStudents([...students, newStudentId.trim()].sort());
      setGridData((prev) => ({ ...prev, [newStudentId.trim()]: {} }));
    }
    setNewStudentId('');
  };

  const handleAddColumn = () => {
    if (!newColName.trim()) return;
    if (!columns.includes(newColName.trim())) {
      setColumns([...columns, newColName.trim()]);
    }
    setNewColName('');
  };

  return {
    state: {
      teacherId,
      password,
      isLoggedIn,
      classrooms,
      selectedClassroom,
      columns,
      students,
      gridData,
      fileUrls,
      newStudentId,
      newColName,
      saving,
    },
    actions: {
      setTeacherId,
      setPassword,
      setSelectedClassroom,
      setNewStudentId,
      setNewColName,
      handleLogin,
      handleLogout,
      handleColumnHeaderChange,
      handleDeleteColumn,
      handleCellChange,
      handleSaveChanges,
      handleAddStudent,
      handleAddColumn,
    },
  };
}