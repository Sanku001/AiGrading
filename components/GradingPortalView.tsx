// components/GradingPortalView.tsx
'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { useGradingPortal, StudentSubmission } from '../hooks/useGradingPortal';

interface LoginViewProps {
  teacherId: string;
  password: string;
  onTeacherIdChange: (val: string) => void;
  onPasswordChange: (val: string) => void;
  onLogin: () => void;
}

const LoginView = memo(function LoginView({
  teacherId,
  password,
  onTeacherIdChange,
  onPasswordChange,
  onLogin
}: LoginViewProps) {
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
            backgroundColor: '#EFF6FF',
            border: '2px solid #BFDBFE',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            fontSize: '28px',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)'
          }}>
            🤖
          </div>
          <h2 style={{ margin: '0 0 6px 0', color: '#1E3A8A', fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            AI Grading Portal
          </h2>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.9rem' }}>
            Sign in to manage submissions & batch evaluation
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              TEACHER ID
            </label>
            <input 
              type="text" 
              placeholder="e.g. T101" 
              value={teacherId} 
              onChange={(e) => onTeacherIdChange(e.target.value)} 
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
                color: '#0F172A'
              }}
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
              onChange={(e) => onPasswordChange(e.target.value)} 
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
                color: '#0F172A'
              }}
            />
          </div>

          <button 
            onClick={onLogin} 
            style={{
              marginTop: '8px',
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}
          >
            Login to Portal →
          </button>
        </div>
      </main>
    </div>
  );
});

interface SubmissionCardProps {
  submission: StudentSubmission;
  isGraded: boolean;
  isLoading: boolean;
  onAddFiles: (studentId: string, files: FileList | null) => void;
  onRemoveFile: (studentId: string, index: number) => void;
  onToggleDetails: (studentId: string) => void;
}

const SubmissionCard = memo(function SubmissionCard({
  submission,
  isGraded,
  isLoading,
  onAddFiles,
  onRemoveFile,
  onToggleDetails
}: SubmissionCardProps) {
  const { studentId, files, status, result, showDetails, error } = submission;

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '10px', 
        padding: '16px', 
        backgroundColor: status === 'success' ? '#F0FDF4' : status === 'error' ? '#FEF2F2' : files.length > 0 ? '#EFF6FF' : '#F8FAFC', 
        border: status === 'success' ? '1px solid #BBF7D0' : status === 'error' ? '1px solid #FECACA' : files.length > 0 ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
        borderRadius: '10px',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px' }}>
          <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#1E3A8A' }}>👤 {studentId}</span>
          {isGraded && (
            <span style={{ color: '#16A34A', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700', border: '1px solid #86EFAC' }}>
              ✓ Graded
            </span>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
          <input 
            type="file" 
            accept="image/*" 
            multiple
            disabled={isLoading}
            onChange={(e) => {
              onAddFiles(studentId, e.target.files);
              e.target.value = '';
            }}
            style={{ fontSize: '0.85rem', color: '#475569' }}
          />

          {files.map((file, idx) => (
            <span key={idx} style={{
              fontSize: '0.8rem',
              color: '#1E40AF',
              fontWeight: '700',
              backgroundColor: '#DBEAFE',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid #93C5FD',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              📄 {file.name}
              <button
                type="button"
                onClick={() => onRemoveFile(studentId, idx)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#EF4444',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  padding: '0 2px',
                  fontSize: '0.85rem'
                }}
                title="Remove attached file"
              >
                ✕
              </button>
            </span>
          ))}

          {status === 'loading' && (
            <span style={{ color: '#2563EB', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ⏳ Grading...
            </span>
          )}

          {status === 'success' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#15803D', fontSize: '0.9rem', fontWeight: '800', backgroundColor: '#DCFCE7', padding: '4px 10px', borderRadius: '6px', border: '1px solid #86EFAC' }}>
                ✅ Score: {result?.total_score} / {result?.max_score}
              </span>
              <button
                type="button"
                onClick={() => onToggleDetails(studentId)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #86EFAC',
                  color: '#166534',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {showDetails ? 'Hide AI Details ▲' : 'Show AI Details ▼'}
              </button>
            </div>
          )}

          {status === 'error' && (
            <span style={{ color: '#DC2626', fontSize: '0.85rem', fontWeight: '700' }}>
              ❌ Error: {error}
            </span>
          )}
        </div>
      </div>

      {status === 'success' && result && showDetails && (
        <div style={{ marginTop: '4px', padding: '14px', background: '#FFFFFF', border: '1px solid #BBF7D0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#166534', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>💬 AI Feedback:</strong>
            <p style={{ margin: '6px 0 0 0', color: '#334155', fontSize: '0.88rem', lineHeight: '1.5' }}>
              {result.feedback}
            </p>
          </div>

          {result.breakdown && result.breakdown.length > 0 && (
            <div>
              <strong style={{ color: '#166534', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>📊 Points Breakdown:</strong>
              <div style={{ overflowX: 'auto', marginTop: '6px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #CBD5E1', textAlign: 'left' }}>
                      <th style={{ padding: '8px', color: '#475569', fontWeight: '700' }}>Rubric Item</th>
                      <th style={{ padding: '8px', color: '#475569', fontWeight: '700', width: '90px' }}>Score</th>
                      <th style={{ padding: '8px', color: '#475569', fontWeight: '700' }}>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.breakdown.map((b, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '8px', fontWeight: '700', color: '#1E293B' }}>{b.item}</td>
                        <td style={{ padding: '8px', color: '#2563EB', fontWeight: '800' }}>
                          {b.points_earned} / {b.points_possible}
                        </td>
                        <td style={{ padding: '8px', color: '#64748B' }}>{b.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default function Home() {
  const { state, actions } = useGradingPortal();

  if (!state.isLoggedIn) {
    return (
      <LoginView
        teacherId={state.teacherId}
        password={state.password}
        onTeacherIdChange={actions.setTeacherId}
        onPasswordChange={actions.setPassword}
        onLogin={actions.handleLogin}
      />
    );
  }

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0F172A' }}>
      <style>{`
        .btn-hover { transition: all 0.15s ease; }
        .btn-hover:hover { filter: brightness(1.05); transform: translateY(-1px); }
        .btn-hover:active { transform: translateY(0); }
      `}</style>

      {/* Header Navigation */}
      <header style={{
        background: 'linear-gradient(90deg, #1E3A8A 0%, #1E40AF 100%)',
        color: '#FFFFFF',
        padding: '16px 28px',
        boxShadow: '0 4px 20px rgba(30, 58, 138, 0.15)'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)'
            }}>
              ⚡
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.01em' }}>
                AI Batch Grading Portal
              </h1>
              <span style={{ fontSize: '0.8rem', color: '#93C5FD', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Teacher ID: <strong style={{ color: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.15)', padding: '1px 6px', borderRadius: '4px' }}>{state.teacherId}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem', color: '#93C5FD', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>Active Class</span>
              <select 
                value={state.selectedClassroom?.id || ''} 
                onChange={(e) => actions.setSelectedClassroom(state.classrooms.find((c) => c.id === e.target.value) || null)}
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
                {state.classrooms.map((c) => (
                  <option key={c.id} value={c.id}>{c.subject} ({c.name})</option>
                ))}
              </select>
            </div>

            <div style={{ width: '1px', height: '28px', backgroundColor: 'rgba(255, 255, 255, 0.2)', margin: '0 4px' }} />

            <Link href="/records" style={{
              padding: '8px 14px',
              background: '#F97316',
              color: '#FFFFFF',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: '700',
              boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)'
            }}>
              Open Gradebook Grid →
            </Link>

            <button 
              onClick={actions.handleLogout} 
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

      {/* Main Workspace */}
      <main style={{ maxWidth: '1100px', margin: '28px auto', padding: '0 24px' }}>
        <form onSubmit={actions.handleSubmitAll}>
          {/* Step 1 Card: Assignment Configuration */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <span style={{
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                fontWeight: '800',
                fontSize: '0.85rem',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #BFDBFE'
              }}>STEP 1</span>
              <h3 style={{ margin: 0, color: '#1E3A8A', fontSize: '1.1rem', fontWeight: '800' }}>Assignment Rules & Rubric</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Work ID / Assignment Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Homework 1, Quiz 2" 
                  value={state.workIdInput} 
                  onChange={(e) => actions.setWorkIdInput(e.target.value)} 
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    color: '#0F172A'
                  }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Max Score Possible</label>
                <input 
                  type="number" 
                  value={state.maxScore} 
                  onChange={(e) => actions.setMaxScore(Number(e.target.value))} 
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    color: '#0F172A'
                  }} 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Grading Rules / Rubric Criteria</label>
              <textarea 
                rows={3} 
                placeholder="e.g. Full credit requires showing work step-by-step. Deduct 2 points for missing units." 
                value={state.rules} 
                onChange={(e) => actions.setRules(e.target.value)} 
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#0F172A',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }} 
              />
            </div>
          </div>

          {/* Step 2 Card: Submissions & Roster */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #BFDBFE'
                }}>STEP 2</span>
                <h3 style={{ margin: 0, color: '#1E3A8A', fontSize: '1.1rem', fontWeight: '800' }}>Attach Student Submissions</h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '4px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                <input 
                  type="text" 
                  placeholder="New Student ID..." 
                  value={state.newRosterStudent} 
                  onChange={(e) => actions.setNewRosterStudent(e.target.value)} 
                  style={{
                    border: 'none',
                    background: 'transparent',
                    padding: '6px 10px',
                    fontSize: '0.85rem',
                    outline: 'none',
                    width: '140px'
                  }}
                />
                <button 
                  type="button" 
                  onClick={actions.handleAddNewStudentToDB} 
                  className="btn-hover"
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  + Add to Roster
                </button>
              </div>
            </div>

            {/* Roster & Submission List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto', paddingRight: '4px' }}>
              {state.submissions.map((sub) => (
                <SubmissionCard
                  key={sub.studentId}
                  submission={sub}
                  isGraded={state.gradedStudentIds.includes(sub.studentId)}
                  isLoading={state.loading}
                  onAddFiles={actions.handleAddFiles}
                  onRemoveFile={actions.handleRemoveFile}
                  onToggleDetails={actions.toggleDetails}
                />
              ))}

              {state.submissions.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                  No students found in this classroom roster. Add one using the input above.
                </div>
              )}
            </div>
          </div>

          {/* Action Footer Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <button 
              type="submit" 
              disabled={state.loading || state.attachedCount === 0} 
              className="btn-hover"
              style={{ 
                background: state.loading || state.attachedCount === 0 ? '#94A3B8' : 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)', 
                color: '#FFFFFF', 
                padding: '14px 28px', 
                border: 'none', 
                borderRadius: '10px', 
                cursor: state.loading || state.attachedCount === 0 ? 'not-allowed' : 'pointer', 
                fontWeight: '800',
                fontSize: '1rem',
                boxShadow: state.loading || state.attachedCount === 0 ? 'none' : '0 4px 12px rgba(22, 163, 74, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {state.loading ? state.batchProgress : `🚀 Grade Attached Submissions (${state.attachedCount})`}
            </button>
          </div>
        </form>

        {/* Dynamic Status Notifications */}
        {state.loading && (
          <div style={{ padding: '16px 20px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', textAlign: 'center', marginBottom: '20px', color: '#1E40AF' }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: '800' }}>{state.batchProgress}</h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>Uploading files and saving AI assessment results into Supabase...</p>
          </div>
        )}

        {state.error && (
          <div style={{ padding: '14px 18px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem' }}>
            <strong>Error:</strong> {state.error}
          </div>
        )}

        {state.successMsg && (
          <div style={{ padding: '14px 18px', backgroundColor: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', borderRadius: '10px', marginBottom: '20px', fontWeight: '700', fontSize: '0.9rem' }}>
            ✅ {state.successMsg}
          </div>
        )}
      </main>
    </div>
  );
}