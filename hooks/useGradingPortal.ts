// hooks/useGradingPortal.ts
'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Classroom {
  id: string;
  name: string;
  subject: string;
  teacher_id: string;
}

export interface BreakdownItem {
  item: string;
  points_earned: number;
  points_possible: number;
  reason: string;
}

export interface GradeResult {
  total_score: number;
  max_score: number;
  breakdown: BreakdownItem[];
  feedback: string;
}

export interface StudentSubmission {
  studentId: string;
  files: File[];
  status?: 'pending' | 'loading' | 'success' | 'error';
  result?: GradeResult;
  error?: string;
  showDetails?: boolean;
}

const DB_NAME = 'GradePortalDB';
const STORE_NAME = 'pendingSubmissions';
const MAX_BASE64_SIZE_BYTES = 4 * 1024 * 1024; // 4MB threshold for inline base64

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject('IndexedDB unavailable');
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveFilesToDB = async (studentId: string, files: File[]) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    if (files && files.length > 0) {
      store.put(files, studentId);
    } else {
      store.delete(studentId);
    }
  } catch (err) {
    console.error('Error persisting files to browser storage:', err);
  }
};

const getFilesFromDB = async (): Promise<Record<string, File[]>> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.openCursor();
      const filesMap: Record<string, File[]> = {};

      request.onsuccess = (event: Event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          filesMap[cursor.key as string] = cursor.value as File[];
          cursor.continue();
        } else {
          resolve(filesMap);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error reading files from browser storage:', err);
    return {};
  }
};

const safeReadFileAsDataURL = (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    if (file.size > MAX_BASE64_SIZE_BYTES) {
      return resolve(null);
    }
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

export function useGradingPortal() {
  const [teacherId, setTeacherId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);

  const [gradedStudentIds, setGradedStudentIds] = useState<string[]>([]);
  const [newRosterStudent, setNewRosterStudent] = useState<string>('');

  const [workIdInput, setWorkIdInput] = useState<string>('work1');
  const [maxScore, setMaxScore] = useState<number>(100);
  const [rules, setRules] = useState<string>('');
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('teacher_id');
    setIsLoggedIn(false);
    setClassrooms([]);
    setSelectedClassroom(null);
    setPassword('');
  }, []);

  const loadClassrooms = useCallback(async (id: string) => {
    const { data, error: fetchErr } = await supabase
      .from('classrooms')
      .select('*')
      .eq('teacher_id', id);

    if (!fetchErr && data && data.length > 0) {
      setClassrooms(data);
      setSelectedClassroom(data[0]);
      setIsLoggedIn(true);
    } else {
      handleLogout();
    }
  }, [handleLogout]);

  const fetchClassroomRoster = useCallback(async (classroomId: string, currentWorkId: string) => {
    const [{ data: rosterData }, { data: gradeData }] = await Promise.all([
      supabase.from('classroom_students').select('student_id').eq('classroom_id', classroomId),
      supabase.from('gradebook_scores').select('student_id, work_id').eq('classroom_id', classroomId)
    ]);

    const rosterSet = new Set<string>();
    rosterData?.forEach((r) => rosterSet.add(r.student_id));
    gradeData?.forEach((g) => rosterSet.add(g.student_id));

    const rosterList = Array.from(rosterSet).sort();

    const gradedSet = new Set<string>();
    gradeData
      ?.filter((g) => g.work_id === currentWorkId.trim())
      .forEach((g) => gradedSet.add(g.student_id));

    setGradedStudentIds(Array.from(gradedSet));

    const savedFiles = await getFilesFromDB();

    setSubmissions((prev) => {
      const existingMap = new Map(prev.map((s) => [s.studentId, s]));
      return rosterList.map((stId) => {
        const existing = existingMap.get(stId);
        const restoredFiles = savedFiles[stId] || [];
        return existing
          ? { ...existing, files: existing.files.length > 0 ? existing.files : restoredFiles }
          : { studentId: stId, files: restoredFiles, status: 'pending', showDetails: true };
      });
    });
  }, []);

  useEffect(() => {
    const savedTeacherId = localStorage.getItem('teacher_id');
    if (savedTeacherId) {
      setTeacherId(savedTeacherId);
      loadClassrooms(savedTeacherId);
    }

    const savedWorkId = localStorage.getItem('work_id_input');
    if (savedWorkId !== null) setWorkIdInput(savedWorkId);

    const savedMaxScore = localStorage.getItem('max_score_input');
    if (savedMaxScore !== null) setMaxScore(Number(savedMaxScore));

    const savedRules = localStorage.getItem('rules_input');
    if (savedRules !== null) setRules(savedRules);

    setIsMounted(true);
  }, [loadClassrooms]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('work_id_input', workIdInput);
  }, [workIdInput, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('max_score_input', maxScore.toString());
  }, [maxScore, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('rules_input', rules);
  }, [rules, isMounted]);

  useEffect(() => {
    if (selectedClassroom) {
      fetchClassroomRoster(selectedClassroom.id, workIdInput);
    }
  }, [selectedClassroom, workIdInput, fetchClassroomRoster]);

  const handleLogin = async () => {
    if (!teacherId.trim() || !password.trim()) {
      return alert('Please enter Teacher ID and Password');
    }

    const { data: teacher, error: authErr } = await supabase
      .from('teachers')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('password', password)
      .single();

    if (authErr || !teacher) {
      return alert('Invalid Teacher ID or Password');
    }

    localStorage.setItem('teacher_id', teacherId);
    await loadClassrooms(teacherId);
  };

  const handleAddNewStudentToDB = async () => {
    if (!newRosterStudent.trim() || !selectedClassroom) return;
    const stId = newRosterStudent.trim();

    const { error: insertErr } = await supabase.from('classroom_students').upsert(
      [{ classroom_id: selectedClassroom.id, student_id: stId }],
      { onConflict: 'classroom_id,student_id' }
    );

    if (insertErr) {
      alert(`Error adding student to roster: ${insertErr.message}`);
    } else {
      setNewRosterStudent('');
      await fetchClassroomRoster(selectedClassroom.id, workIdInput);
    }
  };

  const handleAddFiles = async (studentId: string, newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;
    const addedFilesArray = Array.from(newFiles);

    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.studentId === studentId) {
          const updatedFiles = [...sub.files, ...addedFilesArray];
          saveFilesToDB(studentId, updatedFiles);
          return { ...sub, files: updatedFiles, status: 'pending' };
        }
        return sub;
      })
    );
  };

  const handleRemoveFile = async (studentId: string, fileIndex: number) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.studentId === studentId) {
          const updatedFiles = sub.files.filter((_, idx) => idx !== fileIndex);
          saveFilesToDB(studentId, updatedFiles);
          return { ...sub, files: updatedFiles, status: 'pending' };
        }
        return sub;
      })
    );
  };

  const toggleDetails = useCallback((studentId: string) => {
    setSubmissions((prev) =>
      prev.map((sub) => (sub.studentId === studentId ? { ...sub, showDetails: !sub.showDetails } : sub))
    );
  }, []);

  const handleSubmitAll = async (e: FormEvent) => {
    e.preventDefault();

    if (!workIdInput.trim()) return alert('Step 1: Please specify a Work ID');
    if (!selectedClassroom) return alert('Please select a classroom');

    const activeQueue = submissions.filter((s) => s.files.length > 0);
    if (activeQueue.length === 0) {
      return alert('Step 2: Please attach at least one file for a student before submitting.');
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < activeQueue.length; i++) {
      const item = activeQueue[i];
      setBatchProgress(`Processing ${i + 1} of ${activeQueue.length}: Student ${item.studentId}...`);

      setSubmissions((prev) =>
        prev.map((s) => (s.studentId === item.studentId ? { ...s, status: 'loading' } : s))
      );

      try {
        const uploadedFilePaths: string[] = [];
        const signedUrls: string[] = [];

        for (let fIdx = 0; fIdx < item.files.length; fIdx++) {
          const file = item.files[fIdx];
          const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filePath = `${selectedClassroom.id}/${workIdInput.trim()}/${item.studentId}_${Date.now()}_${fIdx}_${cleanFileName}`;
          const mimeType = file.type || 'application/octet-stream';

          const { error: uploadError } = await supabase.storage
            .from('student-submissions')
            .upload(filePath, file, { 
              upsert: true,
              contentType: mimeType,
              duplex: 'half'
            });

          if (uploadError) throw new Error(`Supabase Storage upload failed for ${file.name}: ${uploadError.message}`);
          
          uploadedFilePaths.push(filePath);

          const { data: signedData } = await supabase.storage
            .from('student-submissions')
            .createSignedUrl(filePath, 3600);

          if (signedData?.signedUrl) {
            signedUrls.push(signedData.signedUrl);
          }
        }

        // Generate Base64 or fallback to Signed Storage URL for large files
        const processedUrls = await Promise.all(
          item.files.map(async (file, idx) => {
            const dataUrl = await safeReadFileAsDataURL(file);
            return dataUrl || signedUrls[idx] || '';
          })
        );

        const primaryUrl = processedUrls[0] || signedUrls[0] || '';

        const res = await fetch('/api/grade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            fileDataUrls: processedUrls, 
            fileDataUrl: primaryUrl, 
            filePaths: uploadedFilePaths,
            fileUrls: signedUrls,
            maxScore, 
            rules 
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to process grading request.');

        const combinedPaths = uploadedFilePaths.join(',');

        const { error: logError } = await supabase.from('grades').upsert(
          [{
            classroom_id: selectedClassroom.id,
            student_id: item.studentId,
            work_id: workIdInput.trim(),
            total_score: data.total_score,
            max_score: data.max_score,
            feedback: data.feedback,
            breakdown: data.breakdown
          }],
          { onConflict: 'classroom_id,student_id,work_id' }
        );

        if (logError) throw new Error(`DB grades log save failed: ${logError.message}`);

        const { error: gridError } = await supabase.from('gradebook_scores').upsert(
          [{
            classroom_id: selectedClassroom.id,
            student_id: item.studentId,
            work_id: workIdInput.trim(),
            score: data.total_score,
            file_path: combinedPaths
          }],
          { onConflict: 'classroom_id,student_id,work_id' }
        );

        if (gridError) throw new Error(`DB gradebook score save failed: ${gridError.message}`);

        await saveFilesToDB(item.studentId, []);

        successCount++;
        setSubmissions((prev) =>
          prev.map((s) =>
            s.studentId === item.studentId
              ? { ...s, status: 'success', result: data, files: [], showDetails: true }
              : s
          )
        );
      } catch (err: unknown) {
        failCount++;
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setSubmissions((prev) =>
          prev.map((s) =>
            s.studentId === item.studentId
              ? { ...s, status: 'error', error: errorMessage }
              : s
          )
        );
      }
    }

    setLoading(false);
    setBatchProgress('');
    setSuccessMsg(`Batch processing completed! ${successCount} graded successfully, ${failCount} failed.`);
    await fetchClassroomRoster(selectedClassroom.id, workIdInput);
  };

  const attachedCount = submissions.filter((s) => s.files.length > 0).length;

  return {
    state: {
      teacherId,
      password,
      isLoggedIn,
      classrooms,
      selectedClassroom,
      gradedStudentIds,
      newRosterStudent,
      workIdInput,
      maxScore,
      rules,
      submissions,
      loading,
      batchProgress,
      error,
      successMsg,
      attachedCount,
    },
    actions: {
      setTeacherId,
      setPassword,
      setSelectedClassroom,
      setNewRosterStudent,
      setWorkIdInput,
      setMaxScore,
      setRules,
      handleLogin,
      handleLogout,
      handleAddNewStudentToDB,
      handleAddFiles,
      handleRemoveFile,
      toggleDetails,
      handleSubmitAll,
    },
  };
}