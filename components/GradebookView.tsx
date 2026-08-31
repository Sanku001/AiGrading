'use client';

import Link from 'next/link';
import { useGradebook } from '@/hooks/useGradebook';

type GradebookProps = ReturnType<typeof useGradebook>;

export default function GradebookView({ state, actions }: GradebookProps) {
  const {
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
  } = state;

  const {
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
  } = actions;

  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <main style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #E2E8F0',
          padding: '36px 32px',
          boxSizing: 'border-box'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              backgroundColor: '#FFF7ED',
              border: '2px solid #FFEDD5',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              fontSize: '28px',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.15)'
            }}>
              🎓
            </div>
            <h2 style={{ margin: '0 0 6px 0', color: '#1E3A8A', fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
              EduGrade Portal
            </h2>
            <p style={{ margin: 0, color: '#64748B', fontSize: '0.9rem' }}>
              Sign in to manage gradebooks & assignments
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                TEACHER ID
              </label>
              <input 
                type="text" 
                placeholder="e.g. T-104" 
                value={teacherId} 
                onChange={(e) => setTeacherId(e.target.value)} 
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                  color: '#0F172A'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                PASSWORD
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                  color: '#0F172A'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
              />
            </div>

            <button 
              onClick={handleLogin} 
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                transition: 'transform 0.1s, box-shadow 0.2s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Open Gradebook →
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0F172A' }}>
      <style>{`
        .has-work-cell {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .has-work-cell:hover {
          background-color: #EFF6FF !important;
          box-shadow: inset 0 0 0 2px #3B82F6;
        }
        .action-btn {
          transition: all 0.15s ease;
        }
        .action-btn:hover {
          filter: brightness(1.05);
          transform: translateY(-1px);
        }
        .action-btn:active {
          transform: translateY(0);
        }
      `}</style>

      {/* Header */}
      <header style={{
        background: 'linear-gradient(90deg, #1E3A8A 0%, #1E40AF 100%)',
        color: '#FFFFFF',
        padding: '16px 28px',
        boxShadow: '0 4px 20px rgba(30, 58, 138, 0.15)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              backgroundColor: '#F97316',
              color: '#FFFFFF',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(249, 115, 22, 0.4)'
            }}>
              📖
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.01em' }}>
                Openbook Gradebook
              </h1>
              <span style={{ fontSize: '0.8rem', color: '#93C5FD', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Teacher ID: <strong style={{ color: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.15)', padding: '1px 6px', borderRadius: '4px' }}>{teacherId}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem', color: '#93C5FD', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>Active Class</span>
              <select 
                value={selectedClassroom?.id} 
                onChange={(e) => setSelectedClassroom(classrooms.find(c => c.id === e.target.value) || null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid #60A5FA',
                  background: '#FFFFFF',
                  color: '#1E3A8A',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>{c.subject} ({c.name})</option>
                ))}
              </select>
            </div>

            <div style={{ width: '1px', height: '28px', backgroundColor: 'rgba(255, 255, 255, 0.2)', margin: '0 4px' }} />

            <Link href="/" style={{
              padding: '8px 14px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: '600',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'background 0.2s'
            }}>
              ← AI Grading
            </Link>

            <button 
              onClick={handleLogout} 
              style={{
                padding: '8px 14px',
                background: '#EF4444',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '600',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main style={{ maxWidth: '1280px', margin: '28px auto', padding: '0 24px' }}>

        {/* Dashboard Bar & Classroom Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', borderLeft: '4px solid #2563EB' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Subject / Class</span>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1E3A8A', marginTop: '4px' }}>
              {selectedClassroom?.subject || 'N/A'}
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Section: {selectedClassroom?.name}</span>
          </div>

          <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', borderLeft: '4px solid #F97316' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Enrolled Students</span>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#EA580C', marginTop: '4px' }}>
              👥 {students.length}
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Active in matrix</span>
          </div>

          <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', borderLeft: '4px solid #10B981' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Assignments</span>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#047857', marginTop: '4px' }}>
              📝 {columns.length}
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Tracked tasks</span>
          </div>
        </div>

        {/* Toolbar Controls Card */}
        <div style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          backgroundColor: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          marginBottom: '20px'
        }}>
          <button 
            onClick={handleSaveChanges} 
            disabled={saving} 
            className="action-btn"
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.9rem',
              boxShadow: '0 3px 10px rgba(249, 115, 22, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            💾 {saving ? 'Saving...' : 'Save Gradebook Changes'}
          </button>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {/* Add Student Control */}
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
              <input 
                type="text" 
                placeholder="+ Student ID" 
                value={newStudentId} 
                onChange={(e) => setNewStudentId(e.target.value)} 
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: '6px 10px',
                  fontSize: '0.85rem',
                  outline: 'none',
                  width: '110px'
                }}
              />
              <button 
                onClick={handleAddStudent} 
                className="action-btn"
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>

            {/* Add Assignment Control */}
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
              <input 
                type="text" 
                placeholder="+ Assignment" 
                value={newColName} 
                onChange={(e) => setNewColName(e.target.value)} 
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: '6px 10px',
                  fontSize: '0.85rem',
                  outline: 'none',
                  width: '120px'
                }}
              />
              <button 
                onClick={handleAddColumn} 
                className="action-btn"
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#F97316',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Gradebook Grid Container */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#1E3A8A', color: '#FFFFFF' }}>
                  <th style={{
                    padding: '14px 16px',
                    textAlign: 'left',
                    minWidth: '130px',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase'
                  }}>
                    Student ID
                  </th>
                  {columns.map((col, index) => (
                    <th key={index} style={{
                      padding: '10px 12px',
                      minWidth: '160px',
                      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: '#2563EB'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <input 
                          type="text" 
                          value={col} 
                          onChange={(e) => handleColumnHeaderChange(index, e.target.value)} 
                          style={{
                            width: '80%',
                            textAlign: 'center',
                            fontWeight: '700',
                            padding: '4px 6px',
                            border: '1px solid #93C5FD',
                            background: '#FFFFFF',
                            color: '#1E3A8A',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            outline: 'none'
                          }}
                        />
                        <button 
                          type="button" 
                          onClick={() => handleDeleteColumn(index)}
                          title="Delete Assignment"
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#FFD1D1',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            padding: '3px 6px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            lineHeight: 1
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((studentId, rowIndex) => (
                  <tr key={studentId} style={{
                    borderBottom: '1px solid #E2E8F0',
                    backgroundColor: rowIndex % 2 === 0 ? '#FFFFFF' : '#F8FAFC'
                  }}>
                    <td style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '700',
                      borderRight: '1px solid #E2E8F0',
                      color: '#1E3A8A',
                      backgroundColor: rowIndex % 2 === 0 ? '#F8FAFC' : '#F1F5F9'
                    }}>
                      {studentId}
                    </td>
                    {columns.map((col) => {
                      const val = gridData[studentId]?.[col] ?? '';
                      const fileUrl = fileUrls[studentId]?.[col];

                      return (
                        <td 
                          key={col} 
                          className={fileUrl ? 'has-work-cell' : ''}
                          onClick={() => {
                            if (fileUrl) {
                              window.open(fileUrl, '_blank', 'noopener,noreferrer');
                            }
                          }}
                          title={fileUrl ? '📄 Click background to inspect submission file' : ''}
                          style={{ 
                            padding: '10px 8px', 
                            borderRight: '1px solid #E2E8F0',
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <input 
                              type="number" 
                              step="0.5"
                              value={val} 
                              onChange={(e) => handleCellChange(studentId, col, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              style={{ 
                                width: '60px', 
                                textAlign: 'center', 
                                padding: '6px 4px', 
                                border: fileUrl ? '1.5px solid #3B82F6' : '1px solid #CBD5E1', 
                                borderRadius: '6px',
                                fontWeight: fileUrl ? '700' : 'normal',
                                color: fileUrl ? '#1E40AF' : '#0F172A',
                                backgroundColor: fileUrl ? '#EFF6FF' : '#FFFFFF',
                                outline: 'none'
                              }}
                            />
                            {fileUrl && (
                              <span style={{ fontSize: '0.85rem' }} title="Has Student Submission">📄</span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} style={{ padding: '36px', color: '#64748B', backgroundColor: '#FFFFFF' }}>
                      <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>📂</div>
                      <strong>No student records found.</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>Use the "+ Student ID" input above to add entries to this subject.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}