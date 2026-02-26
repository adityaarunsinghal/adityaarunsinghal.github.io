import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase';
import { collection, onSnapshot, QuerySnapshot, DocumentData, setDoc, doc, serverTimestamp, FirestoreError } from 'firebase/firestore';
import { ActivityCalendar } from 'react-activity-calendar';
import type { Activity, BlockElement } from 'react-activity-calendar';
import Loading from '@/components/Loading';
import './Progress.css';

interface Entry {
  id: string;        // document ID (YYYY-MM-DD)
  inElement: boolean;
  reason: string;
  date: string;       // YYYY-MM-DD
  updatedAt: Date | null;
}

interface PendingSave {
  date: string;       // YYYY-MM-DD
  inElement: boolean;
  reason: string;
}

const getLocalDateString = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateForDisplay = (date: Date = new Date()) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const generateHeatmapData = (entries: Map<string, Entry>) => {
  const data: Array<{ date: string; count: number; level: number }> = [];
  const today = new Date();
  const yearStart = new Date(today.getFullYear() - 1, 11, 1); // Dec 1 of previous year

  // Generate data for every day from Dec 1 last year to today
  for (let d = new Date(yearStart); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = getLocalDateString(d);
    const entry = entries.get(dateStr);

    if (entry) {
      // Has entry: level 4 (green) if in element, level 2 (amber) if not
      data.push({
        date: dateStr,
        count: 1,
        level: entry.inElement ? 4 : 2,
      });
    } else {
      // No entry: level 0 (gray)
      data.push({
        date: dateStr,
        count: 0,
        level: 0,
      });
    }
  }

  return data;
};

const calculateStreak = (entries: Map<string, Entry>): number => {
  let streak = 0;
  let currentDate = new Date();

  // Walk backwards from today through entries
  while (true) {
    const dateStr = getLocalDateString(currentDate);
    const entry = entries.get(dateStr);

    // Stop if we hit a day with no entry or an entry that's not "in element"
    if (!entry || !entry.inElement) {
      break;
    }

    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
};

const STREAK_MILESTONES = [7, 14, 21, 30, 60, 90, 100, 365];

const celebrateStreak = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#2ecc71', '#27ae60', '#1abc9c', '#16a085'],
  });
};

const Progress = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Map<string, Entry>>(new Map());
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<boolean | null>(null);
  const [reason, setReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Yesterday nudge form state
  const [yesterdaySelectedChoice, setYesterdaySelectedChoice] = useState<boolean | null>(null);
  const [yesterdayReason, setYesterdayReason] = useState<string>('');
  const [yesterdayIsLoading, setYesterdayIsLoading] = useState(false);
  const [yesterdayShowSuccess, setYesterdayShowSuccess] = useState(false);
  const [yesterdayIsEditing, setYesterdayIsEditing] = useState(false);
  const [yesterdaySaveError, setYesterdaySaveError] = useState<string | null>(null);

  // Confirmation dialog state for past entries
  const [pendingSave, setPendingSave] = useState<PendingSave | null>(null);

  // Heatmap editor state
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [heatmapSelectedChoice, setHeatmapSelectedChoice] = useState<boolean | null>(null);
  const [heatmapReason, setHeatmapReason] = useState<string>('');
  const [heatmapShowSuccess, setHeatmapShowSuccess] = useState(false);
  const [heatmapSaveError, setHeatmapSaveError] = useState<string | null>(null);
  const [heatmapIsLoading, setHeatmapIsLoading] = useState(false);

  // Animation state for saved entries
  const [savedEntryDate, setSavedEntryDate] = useState<string | null>(null);

  // Streak state - initialize from sessionStorage to prevent re-firing on page reload
  const [lastCelebratedStreak, setLastCelebratedStreak] = useState<number | null>(() => {
    const stored = sessionStorage.getItem('lastCelebratedStreak');
    return stored ? parseInt(stored, 10) : null;
  });

  const todayLoggerRef = useRef<HTMLDivElement>(null);

  const todayDateString = getLocalDateString();
  const todayEntry = entries.get(todayDateString);

  // Calculate yesterday's date
  const yesterdayDate = new Date(Date.now() - 86400000);
  const yesterdayDateString = getLocalDateString(yesterdayDate);
  const yesterdayEntry = entries.get(yesterdayDateString);

  useEffect(() => {
    if (!user) {
      return;
    }

    // Set up real-time listener for element-tracker collection
    const unsubscribe = onSnapshot(
      collection(db, 'element-tracker'),
      (snapshot: QuerySnapshot<DocumentData>) => {
        const newEntries = new Map<string, Entry>();
        snapshot.forEach((doc) => {
          const data = doc.data();
          const entry: Entry = {
            id: doc.id,
            inElement: data.inElement ?? false,
            reason: data.reason ?? '',
            date: data.date ?? '',
            updatedAt: data.updatedAt ? data.updatedAt.toDate() : null,
          };
          newEntries.set(doc.id, entry);
        });
        setEntries(newEntries);
        setError(null);
        setLoaded(true);
      },
      (error: FirestoreError) => {
        if (error.code === 'permission-denied') {
          setError('Access denied. You do not have permission to view this page.');
        } else {
          setError('Something went wrong. Please refresh.');
        }
        setLoaded(true);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleChoiceSelect = (choice: boolean) => {
    setSelectedChoice(choice);
    // Pre-fill reason if editing existing entry
    if (todayEntry) {
      setReason(todayEntry.reason);
    } else {
      setReason('');
    }
  };

  const handleSubmit = async () => {
    if (!user || selectedChoice === null || reason.trim() === '') {
      return;
    }

    setIsLoading(true);
    setSaveError(null);
    try {
      await setDoc(
        doc(db, 'element-tracker', todayDateString),
        {
          inElement: selectedChoice,
          reason: reason.trim(),
          date: todayDateString,
          updatedAt: serverTimestamp(),
        }
      );
      setShowSuccess(true);
      setSelectedChoice(null);
      setReason('');
      setIsEditing(false);
      setSaveError(null);
      // Trigger saved animation for today's entry
      setSavedEntryDate(todayDateString);
      // Clear saved animation after 0.6s (duration of savedPulse animation)
      setTimeout(() => setSavedEntryDate(null), 600);
      // Clear success message after 2 seconds
      setTimeout(() => setShowSuccess(false), 2000);

      // After successful save, check if we need to celebrate streak milestone
      // Update entries map first to reflect the new save
      setEntries((prevEntries) => {
        const newEntries = new Map(prevEntries);
        newEntries.set(todayDateString, {
          id: todayDateString,
          inElement: selectedChoice,
          reason: reason.trim(),
          date: todayDateString,
          updatedAt: new Date(),
        });

        // Calculate new streak after this entry
        const newStreak = calculateStreak(newEntries);

        // Check if we hit a milestone and haven't celebrated it yet
        if (
          STREAK_MILESTONES.includes(newStreak) &&
          lastCelebratedStreak !== newStreak
        ) {
          celebrateStreak();
          setLastCelebratedStreak(newStreak);
          sessionStorage.setItem('lastCelebratedStreak', newStreak.toString());
        }

        return newEntries;
      });
    } catch (err) {
      // Preserve form data and show inline error
      setSaveError(`Failed to save: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (todayEntry) {
      setIsEditing(true);
      setSelectedChoice(todayEntry.inElement);
      setReason(todayEntry.reason);
    }
  };

  const handleCancel = () => {
    setSelectedChoice(null);
    setReason('');
    setIsEditing(false);
  };

  const handleYesterdayChoiceSelect = (choice: boolean) => {
    setYesterdaySelectedChoice(choice);
    // Only reset reason if NOT in editing mode
    if (!yesterdayIsEditing) {
      setYesterdayReason('');
    }
  };

  const handleYesterdaySubmit = () => {
    if (!user || yesterdaySelectedChoice === null || yesterdayReason.trim() === '') {
      return;
    }

    // Clear error before attempting save
    setYesterdaySaveError(null);

    // Set pending save to show confirmation dialog
    setPendingSave({
      date: yesterdayDateString,
      inElement: yesterdaySelectedChoice,
      reason: yesterdayReason.trim(),
    });
  };

  const handleYesterdayCancel = () => {
    setYesterdaySelectedChoice(null);
    setYesterdayReason('');
  };

  const handleYesterdayEdit = () => {
    if (yesterdayEntry) {
      setYesterdayIsEditing(true);
      setYesterdaySelectedChoice(yesterdayEntry.inElement);
      setYesterdayReason(yesterdayEntry.reason);
    }
  };

  // Confirmation dialog handlers
  const handleConfirmSave = async () => {
    if (!user || !pendingSave) {
      return;
    }

    const isFromHeatmap = !!editingDate;
    if (isFromHeatmap) {
      setHeatmapIsLoading(true);
    } else {
      setYesterdayIsLoading(true);
    }
    try {
      await setDoc(
        doc(db, 'element-tracker', pendingSave.date),
        {
          inElement: pendingSave.inElement,
          reason: pendingSave.reason,
          date: pendingSave.date,
          updatedAt: serverTimestamp(),
        }
      );

      // Trigger saved animation
      setSavedEntryDate(pendingSave.date);
      setTimeout(() => setSavedEntryDate(null), 600);

      // After successful save, check if we need to celebrate streak milestone
      // Update entries map first to reflect the new save
      setEntries((prevEntries) => {
        const newEntries = new Map(prevEntries);
        newEntries.set(pendingSave.date, {
          id: pendingSave.date,
          inElement: pendingSave.inElement,
          reason: pendingSave.reason,
          date: pendingSave.date,
          updatedAt: new Date(),
        });

        // Calculate new streak after this entry
        const newStreak = calculateStreak(newEntries);

        // Check if we hit a milestone and haven't celebrated it yet
        if (
          STREAK_MILESTONES.includes(newStreak) &&
          lastCelebratedStreak !== newStreak
        ) {
          celebrateStreak();
          setLastCelebratedStreak(newStreak);
          sessionStorage.setItem('lastCelebratedStreak', newStreak.toString());
        }

        return newEntries;
      });

      // Clear heatmap editor if this was from heatmap
      if (editingDate) {
        setEditingDate(null);
        setHeatmapSelectedChoice(null);
        setHeatmapReason('');
        setHeatmapShowSuccess(true);
        setHeatmapSaveError(null);
        setTimeout(() => setHeatmapShowSuccess(false), 2000);
      } else {
        // Otherwise it was from yesterday editor
        setYesterdayShowSuccess(true);
        setYesterdaySaveError(null);
      }

      setYesterdaySelectedChoice(null);
      setYesterdayReason('');
      setYesterdayIsEditing(false);
      setPendingSave(null);
      // Clear success message after 2 seconds (for yesterday)
      if (!editingDate) {
        setTimeout(() => setYesterdayShowSuccess(false), 2000);
      }
    } catch (err) {
      // Preserve form data and show inline error
      if (editingDate) {
        setHeatmapSaveError(`Failed to save: ${err instanceof Error ? err.message : String(err)}`);
      } else {
        setYesterdaySaveError(`Failed to save: ${err instanceof Error ? err.message : String(err)}`);
      }
    } finally {
      if (isFromHeatmap) {
        setHeatmapIsLoading(false);
      } else {
        setYesterdayIsLoading(false);
      }
    }
  };

  const handleConfirmCancel = () => {
    setPendingSave(null);
    // Don't clear heatmap or yesterday state - let user re-submit if needed
  };

  // Get the date to display in confirmation dialog
  const getPendingSaveDateForDisplay = () => {
    if (!pendingSave) return '';
    const [year, month, day] = pendingSave.date.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return formatDateForDisplay(date);
  };

  // Handle heatmap date clicks
  const handleHeatmapDateClick = (dateStr: string) => {
    if (dateStr === todayDateString) {
      // Click today's date: scroll to today logger
      todayLoggerRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Click any other date: open inline editor
      setEditingDate(dateStr);
      const entry = entries.get(dateStr);
      if (entry) {
        setHeatmapSelectedChoice(entry.inElement);
        setHeatmapReason(entry.reason);
      } else {
        setHeatmapSelectedChoice(null);
        setHeatmapReason('');
      }
    }
  };

  const handleHeatmapChoiceSelect = (choice: boolean) => {
    setHeatmapSelectedChoice(choice);
    const entry = editingDate ? entries.get(editingDate) : null;
    if (!entry) {
      setHeatmapReason('');
    }
  };

  const handleHeatmapSubmit = () => {
    if (!user || !editingDate || heatmapSelectedChoice === null || heatmapReason.trim() === '') {
      return;
    }

    // Clear error before attempting save
    setHeatmapSaveError(null);

    // For heatmap editing (past dates), always show confirmation dialog
    setPendingSave({
      date: editingDate,
      inElement: heatmapSelectedChoice,
      reason: heatmapReason.trim(),
    });
  };

  const handleHeatmapCancel = () => {
    setEditingDate(null);
    setHeatmapSelectedChoice(null);
    setHeatmapReason('');
  };

  // Calculate counts for donut chart
  const inCount = Array.from(entries.values()).filter(entry => entry.inElement).length;
  const totalCount = entries.size;

  // Calculate current streak
  const currentStreak = calculateStreak(entries);

  // Show loading state while initializing
  if (!loaded) {
    return (
      <div className="progress-body">
        <div className="progress-container">
          <Loading message="Loading your element tracker..." />
        </div>
      </div>
    );
  }

  return (
    <div className="progress-body">
      <div className="progress-container">
        <h1 className="progress-title">In My Element</h1>
        {user && (
          <p className="progress-subtitle">
            Tracking your element, {user.displayName?.split(' ')[0] || 'friend'}
          </p>
        )}

        {currentStreak > 0 && (
          <div className="progress-streak-display">
            🔥 {currentStreak} day streak
          </div>
        )}

        {error && (
          <div className="progress-error">{error}</div>
        )}

        {/* Today's Logger Section */}
        <div className="progress-today-section" ref={todayLoggerRef}>
          <h2 className="progress-section-title">Today</h2>

          {todayEntry && !isEditing ? (
            /* Show logged entry card */
            <div className={`progress-entry-card ${savedEntryDate === todayDateString ? 'progress-entry-saved' : ''}`}>
              <div className="progress-entry-status">
                <span className={`progress-entry-badge ${todayEntry.inElement ? 'in-element' : 'not-element'}`}>
                  {todayEntry.inElement ? 'In My Element' : 'Not In My Element'}
                </span>
              </div>
              <p className="progress-entry-reason">{todayEntry.reason}</p>
              <button
                className="progress-edit-btn"
                onClick={handleEdit}
              >
                Edit
              </button>
            </div>
          ) : (
            /* Show choice buttons and form */
            <>
              {selectedChoice === null ? (
                /* Show two choice buttons */
                <div className="progress-choice-container">
                  <button
                    className="progress-choice-btn in-element-btn"
                    onClick={() => handleChoiceSelect(true)}
                  >
                    In My Element
                  </button>
                  <button
                    className="progress-choice-btn not-element-btn"
                    onClick={() => handleChoiceSelect(false)}
                  >
                    Not In My Element
                  </button>
                </div>
              ) : (
                /* Show reason form */
                <div className="progress-form">
                  <label htmlFor="reason" className="progress-form-label">
                    {selectedChoice ? 'In My Element' : 'Not In My Element'}
                  </label>
                  <textarea
                    id="reason"
                    className="progress-reason-input"
                    placeholder="Enter your reason..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={isLoading}
                  />
                  <div className="progress-form-actions">
                    <button
                      className="progress-submit-btn"
                      onClick={handleSubmit}
                      disabled={isLoading || reason.trim() === ''}
                    >
                      {isLoading ? 'Saving...' : 'Submit'}
                    </button>
                    <button
                      className="progress-cancel-btn"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  </div>

                  {saveError && (
                    <div className="progress-form-error">
                      <p>{saveError}</p>
                      <button
                        className="progress-retry-btn"
                        onClick={handleSubmit}
                        disabled={isLoading}
                      >
                        Try again
                      </button>
                    </div>
                  )}
                </div>
              )}

              {showSuccess && (
                <div className="progress-success-message">
                  ✓ Entry saved successfully
                </div>
              )}
            </>
          )}
        </div>

        {/* Yesterday Section */}
        {todayEntry && (
          <div className="progress-nudge-section">
            {yesterdayEntry && !yesterdayIsEditing ? (
              <>
                <h2 className="progress-section-title progress-nudge-title">Yesterday</h2>
                <p className="progress-nudge-date">{formatDateForDisplay(yesterdayDate)}</p>
                {/* Show logged entry card for yesterday */}
                <div className={`progress-entry-card ${savedEntryDate === yesterdayDateString ? 'progress-entry-saved' : ''}`}>
                  <div className="progress-entry-status">
                    <span className={`progress-entry-badge ${yesterdayEntry.inElement ? 'in-element' : 'not-element'}`}>
                      {yesterdayEntry.inElement ? 'In My Element' : 'Not In My Element'}
                    </span>
                  </div>
                  <p className="progress-entry-reason">{yesterdayEntry.reason}</p>
                  <button
                    className="progress-edit-btn"
                    onClick={handleYesterdayEdit}
                  >
                    Edit
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="progress-section-title progress-nudge-title">{yesterdayIsEditing ? 'Yesterday' : 'Yesterday is missing'}</h2>
                <p className="progress-nudge-date">{formatDateForDisplay(yesterdayDate)}</p>

                {yesterdaySelectedChoice === null ? (
                  /* Show two choice buttons */
                  <div className="progress-choice-container">
                    <button
                      className="progress-choice-btn in-element-btn"
                      onClick={() => handleYesterdayChoiceSelect(true)}
                    >
                      In My Element
                    </button>
                    <button
                      className="progress-choice-btn not-element-btn"
                      onClick={() => handleYesterdayChoiceSelect(false)}
                    >
                      Not In My Element
                    </button>
                  </div>
                ) : (
                  /* Show reason form */
                  <div className="progress-form">
                    <label htmlFor="yesterday-reason" className="progress-form-label">
                      {yesterdaySelectedChoice ? 'In My Element' : 'Not In My Element'}
                    </label>
                    <textarea
                      id="yesterday-reason"
                      className="progress-reason-input"
                      placeholder="Enter your reason..."
                      value={yesterdayReason}
                      onChange={(e) => setYesterdayReason(e.target.value)}
                      disabled={yesterdayIsLoading}
                    />
                    <div className="progress-form-actions">
                      <button
                        className="progress-submit-btn"
                        onClick={handleYesterdaySubmit}
                        disabled={yesterdayIsLoading || yesterdayReason.trim() === ''}
                      >
                        {yesterdayIsLoading ? 'Saving...' : 'Submit'}
                      </button>
                      <button
                        className="progress-cancel-btn"
                        onClick={handleYesterdayCancel}
                        disabled={yesterdayIsLoading}
                      >
                        Cancel
                      </button>
                    </div>

                    {yesterdaySaveError && (
                      <div className="progress-form-error">
                        <p>{yesterdaySaveError}</p>
                        <button
                          className="progress-retry-btn"
                          onClick={handleYesterdaySubmit}
                          disabled={yesterdayIsLoading}
                        >
                          Try again
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {yesterdayShowSuccess && (
                  <div className="progress-success-message">
                    ✓ Entry saved successfully
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Donut Chart Section */}
        {totalCount > 0 ? (
          <div className="progress-chart-section">
            <h2 className="progress-section-title">Overall Progress</h2>
            <svg
              className="progress-donut"
              viewBox="0 0 150 150"
              width="200"
              height="200"
            >
              {/* Background circle (full circumference, amber) */}
              <circle
                cx="75"
                cy="75"
                r="60"
                fill="none"
                stroke="#e17055"
                strokeWidth="20"
              />

              {/* Foreground circle (in-element, green) with stroke-dasharray */}
              <circle
                cx="75"
                cy="75"
                r="60"
                fill="none"
                stroke="#2ecc71"
                strokeWidth="20"
                strokeDasharray={`${(inCount / totalCount) * 2 * Math.PI * 60} ${2 * Math.PI * 60}`}
                strokeDashoffset="0"
                strokeLinecap="round"
                transform="rotate(-90 75 75)"
              />

              {/* Center text - percentage */}
              <text
                x="75"
                y="68"
                textAnchor="middle"
                className="progress-chart-percentage"
              >
                {Math.round((inCount / totalCount) * 100)}%
              </text>

              {/* Center text - counts */}
              <text
                x="75"
                y="88"
                textAnchor="middle"
                className="progress-chart-counts"
              >
                {inCount} of {totalCount} days
              </text>
            </svg>

            {/* Legend */}
            <div className="progress-chart-legend">
              <div className="progress-legend-item">
                <span className="progress-legend-dot in-element-dot"></span>
                <span>In My Element</span>
              </div>
              <div className="progress-legend-item">
                <span className="progress-legend-dot not-element-dot"></span>
                <span>Not In My Element</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="progress-chart-section">
            <p className="progress-chart-placeholder">
              Start logging your days to see your progress
            </p>
          </div>
        )}

        {/* Heatmap Calendar Section */}
        <div className="progress-heatmap-section">
          <h2 className="progress-section-title">Year Overview</h2>
          <div className="progress-heatmap-container">
            <ActivityCalendar
              data={generateHeatmapData(entries)}
              colorScheme="dark"
              theme={{
                dark: ['#2d3436', '#e17055', '#e17055', '#2ecc71', '#2ecc71'],
              }}
              renderBlock={(block: BlockElement, activity: Activity) =>
                React.cloneElement(block, {
                  onClick: () => handleHeatmapDateClick(activity.date),
                  style: {
                    ...block.props.style,
                    cursor: 'pointer',
                  },
                })
              }
              blockSize={12}
              blockMargin={4}
              fontSize={12}
              showWeekdayLabels={false}
            />
          </div>
        </div>

        {/* Heatmap Inline Editor */}
        {editingDate && (
          <div className="progress-inline-editor">
            <h2 className="progress-inline-editor-title">
              Edit: {formatDateForDisplay(
                new Date(parseInt(editingDate.split('-')[0]), parseInt(editingDate.split('-')[1]) - 1, parseInt(editingDate.split('-')[2]))
              )}
            </h2>

            {heatmapSelectedChoice === null ? (
              /* Show two choice buttons */
              <div className="progress-choice-container">
                <button
                  className="progress-choice-btn in-element-btn"
                  onClick={() => handleHeatmapChoiceSelect(true)}
                >
                  In My Element
                </button>
                <button
                  className="progress-choice-btn not-element-btn"
                  onClick={() => handleHeatmapChoiceSelect(false)}
                >
                  Not In My Element
                </button>
              </div>
            ) : (
              /* Show reason form */
              <div className="progress-form">
                <label htmlFor="heatmap-reason" className="progress-form-label">
                  {heatmapSelectedChoice ? 'In My Element' : 'Not In My Element'}
                </label>
                <textarea
                  id="heatmap-reason"
                  className="progress-reason-input"
                  placeholder="Enter your reason..."
                  value={heatmapReason}
                  onChange={(e) => setHeatmapReason(e.target.value)}
                  disabled={heatmapIsLoading}
                />
                <div className="progress-form-actions">
                  <button
                    className="progress-submit-btn"
                    onClick={handleHeatmapSubmit}
                    disabled={heatmapIsLoading || heatmapReason.trim() === ''}
                  >
                    {heatmapIsLoading ? 'Saving...' : 'Submit'}
                  </button>
                  <button
                    className="progress-cancel-btn"
                    onClick={handleHeatmapCancel}
                    disabled={heatmapIsLoading}
                  >
                    Cancel
                  </button>
                </div>

                {heatmapSaveError && (
                  <div className="progress-form-error">
                    <p>{heatmapSaveError}</p>
                    <button
                      className="progress-retry-btn"
                      onClick={handleHeatmapSubmit}
                      disabled={heatmapIsLoading}
                    >
                      Try again
                    </button>
                  </div>
                )}
              </div>
            )}

            {heatmapShowSuccess && (
              <div className="progress-success-message">
                ✓ Entry saved successfully
              </div>
            )}
          </div>
        )}

        {/* Confirmation Dialog */}
        {pendingSave && (
          <div
            className="progress-confirm-overlay"
            onClick={handleConfirmCancel}
          >
            <div
              className="progress-confirm-dialog"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="progress-confirm-title">
                Save entry for {getPendingSaveDateForDisplay()}?
              </h2>
              <div className="progress-confirm-actions">
                <button
                  className="progress-confirm-btn progress-confirm-confirm"
                  onClick={handleConfirmSave}
                  disabled={yesterdayIsLoading || heatmapIsLoading}
                >
                  {(yesterdayIsLoading || heatmapIsLoading) ? 'Saving...' : 'Confirm'}
                </button>
                <button
                  className="progress-confirm-btn progress-confirm-cancel"
                  onClick={handleConfirmCancel}
                  disabled={yesterdayIsLoading || heatmapIsLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;
