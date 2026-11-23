import { useState, useEffect, useMemo, useRef } from "react";
import { UserButton, useAuth } from "@clerk/react";
import "./App.css";
import { getTranslations, getStatusText, LANGUAGES } from "./translations";
import InteractiveChat from "./components/InteractiveChat";
import { API_BASE_URL } from "./config";
import { downloadReportPdf } from "./utils/reportPdf";
import {
  getLocalStorageReports,
  saveReportToLocalStorage,
  deleteLocalStorageReport,
  clearAllLocalStorageReports,
  getActiveReportFromLocalStorage,
  setActiveReportInLocalStorage,
  clearActiveReportFromLocalStorage,
  exportReportsAsJSON,
} from "./utils/reportStorage";

function App() {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("preferred_language") || "en";
  });
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [reportFilename, setReportFilename] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pastReports, setPastReports] = useState([]);
  const [localReports, setLocalReports] = useState(() => getLocalStorageReports());
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [biomarkerFilter, setBiomarkerFilter] = useState("all");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // Active translation dictionary
  const t = useMemo(() => getTranslations(language), [language]);

  // Persist language choice in localStorage
  useEffect(() => {
    localStorage.setItem("preferred_language", language);
  }, [language]);

  // Restore active report from localStorage on initial mount if available
  useEffect(() => {
    const active = getActiveReportFromLocalStorage();
    if (active && active.analysis) {
      setAnalysis(active.analysis);
      setReportId(active.id);
      setReportFilename(active.filename || "Medical Report");
      setMessage(`${t.historyRestored}: ${active.filename}`);
    }
  }, []);

  // Synchronize localStorage reports across tabs/windows
  useEffect(() => {
    const handleStorageUpdate = () => {
      setLocalReports(getLocalStorageReports());
    };
    window.addEventListener("medical_reports_updated", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);
    return () => {
      window.removeEventListener("medical_reports_updated", handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  const fetchPastReports = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/reports`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const d = await res.json();
        setPastReports(d.reports || []);
      }
    } catch (e) {
      console.warn("Could not fetch reports history:", e);
    }
  };

  useEffect(() => {
    fetchPastReports();
  }, []);

  const loadSavedReport = (rep) => {
    setAnalysis(rep.analysis);
    setReportId(rep.id);
    setReportFilename(rep.filename);
    setActiveReportInLocalStorage(rep);
    setShowHistoryModal(false);
    const srcLabel = rep.source === "database" ? t.storageCloud : t.storageLocal;
    setMessage(`${t.historyLoaded} ${srcLabel}: ${rep.filename}`);
  };

  const handleClearCurrentReport = () => {
    setAnalysis(null);
    setFile(null);
    setReportId(null);
    setReportFilename("");
    clearActiveReportFromLocalStorage();
    setMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteLocalReport = (id, e) => {
    if (e) e.stopPropagation();
    deleteLocalStorageReport(id);
    setLocalReports(getLocalStorageReports());
    if (String(reportId) === String(id)) {
      handleClearCurrentReport();
    }
  };

  const handleClearAllLocalReports = () => {
    if (window.confirm(t.historyClearConfirm)) {
      clearAllLocalStorageReports();
      setLocalReports([]);
      if (!reportId || String(reportId).startsWith("local_")) {
        handleClearCurrentReport();
      }
    }
  };

  // Combine localStorage and Database reports into unified history
  const mergedReports = useMemo(() => {
    const map = new Map();

    localReports.forEach((lr) => {
      map.set(String(lr.id), {
        ...lr,
        source: "localStorage",
      });
    });

    pastReports.forEach((pr) => {
      const key = String(pr.id);
      if (map.has(key)) {
        map.set(key, {
          ...map.get(key),
          ...pr,
          source: "synced",
        });
      } else {
        map.set(key, {
          ...pr,
          source: "database",
        });
      }
    });

    const list = Array.from(map.values());
    return list.sort((a, b) => {
      const dateA = new Date(a.created_at || a.timestamp || 0).getTime();
      const dateB = new Date(b.created_at || b.timestamp || 0).getTime();
      return dateB - dateA;
    });
  }, [localReports, pastReports]);

  // Check if currently displayed report is saved permanently in browser localStorage
  const isReportSavedLocally = useMemo(() => {
    if (!analysis) return false;
    return localReports.some(
      (r) =>
        (reportId && String(r.id) === String(reportId)) ||
        (r.filename === reportFilename &&
          (r.biomarkers || []).length === (analysis.biomarkers || []).length)
    );
  }, [localReports, reportId, reportFilename, analysis]);

  const handleSaveToPermanentLocalStorage = () => {
    if (!analysis) return;
    const effectiveId = reportId || `local_${Date.now()}`;
    const effectiveName = reportFilename || file?.name || "Medical Report";
    saveReportToLocalStorage({
      id: effectiveId,
      filename: effectiveName,
      report_type: analysis.report_type || "laboratory",
      language,
      analysis,
      created_at: new Date().toISOString(),
      source: "localStorage",
    });
    setLocalReports(getLocalStorageReports());
    setMessage(`✓ "${effectiveName}" saved permanently to this laptop's local storage!`);
  };

  const handleRemoveFromPermanentLocalStorage = () => {
    const target = localReports.find(
      (r) =>
        (reportId && String(r.id) === String(reportId)) ||
        r.filename === reportFilename
    );
    if (!target) return;
    if (window.confirm(`Remove "${target.filename}" from this laptop's permanent local storage?`)) {
      deleteLocalStorageReport(target.id);
      setLocalReports(getLocalStorageReports());
      setMessage(`"${target.filename}" removed from your laptop's local storage.`);
    }
  };

  const handleDownloadReportFile = () => {
    if (!analysis) return;
    const name = reportFilename || file?.name || "Medical_Report";
    downloadReportPdf(analysis, name);
  };

  const isImaging = analysis?.report_type === "imaging";

  const handleFileSelection = (selectedFile) => {
    if (!selectedFile) return;

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setMessage(t.selectPdfError);
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setMessage("");
    setAnalysis(null);
    setBiomarkerFilter("all");
    clearActiveReportFromLocalStorage();
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    handleFileSelection(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage(t.selectPdfFirst);
      return;
    }

    setLoading(true);
    setMessage("");
    setAnalysis(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);

    try {
      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(
        `${API_BASE_URL}/upload`,
        {
          method: "POST",
          headers,
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || t.processingError
        );
      }

      setAnalysis(data.analysis);
      setReportId(data.report_id || null);
      const effectiveFilename = data.filename || file?.name || "Medical Report";
      setReportFilename(effectiveFilename);

      // Cache active report so a page refresh preserves view
      setActiveReportInLocalStorage({
        id: data.report_id || `temp_${Date.now()}`,
        filename: effectiveFilename,
        report_type: data.analysis?.report_type || "laboratory",
        language,
        analysis: data.analysis,
        created_at: new Date().toISOString(),
      });

      setMessage(t.reportSuccess);
      fetchPastReports();
    } catch (error) {
      console.error(error);
      setMessage(
        error.message || t.genericError
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === "high") return "↑";
    if (status === "low") return "↓";
    if (status === "normal") return "✓";
    return "?";
  };

  const getImpressionText = (text) => {
    if (!text) return "";

    return text
      .replace(/^\s*fe\s*\.?\s*/i, "")
      .replace(/^\s*SONOGRAPHICALLY\s*[-:]\s*/i, "")
      .replace(/^\s*IMPRESSION\s*[:\-]?\s*/i, "")
      .trim();
  };

  // Biomarker summary calculations
  const biomarkerStats = useMemo(() => {
    const list = analysis?.biomarkers || [];
    let high = 0;
    let low = 0;
    let normal = 0;
    let unknown = 0;

    list.forEach((b) => {
      const s = (b.status || "").toLowerCase();
      if (s === "high") high++;
      else if (s === "low") low++;
      else if (s === "normal") normal++;
      else unknown++;
    });

    return { total: list.length, high, low, normal, unknown, attention: high + low };
  }, [analysis]);

  // Filtered biomarkers based on active filter tab
  const filteredBiomarkers = useMemo(() => {
    const list = analysis?.biomarkers || [];
    if (biomarkerFilter === "all") return list;
    if (biomarkerFilter === "attention") {
      return list.filter((b) => b.status === "high" || b.status === "low");
    }
    if (biomarkerFilter === "normal") {
      return list.filter((b) => b.status === "normal");
    }
    if (biomarkerFilter === "unknown") {
      return list.filter((b) => b.status !== "high" && b.status !== "low" && b.status !== "normal");
    }
    return list;
  }, [analysis, biomarkerFilter]);

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="app-shell">

      {/* ========================================================
          TOP NAVIGATION & HEADER
          ======================================================== */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand-group">
            <div className="brand-logo" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3V21M3 12H21" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M7 7L17 17M17 7L7 17" stroke="#16324F" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
                <circle cx="12" cy="12" r="3.5" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5"/>
              </svg>
            </div>
            <div className="brand-info">
              <h1 className="brand-title">{t.appTitle}</h1>
              <span className="brand-badge">{t.brandSubtitle}</span>
            </div>
          </div>

          <div className="header-actions">
            {mergedReports && mergedReports.length > 0 && (
              <button
                type="button"
                className="btn-history-header"
                onClick={() => setShowHistoryModal(true)}
                title={t.historyModalTitle}
              >
                📁 {t.historyAll} ({mergedReports.length})
              </button>
            )}

            <div className="language-dropdown-wrapper">
              <span className="lang-icon" aria-hidden="true">🌐</span>
              <select
                id="language"
                aria-label={t.languageLabel || "Language selector"}
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="language-select"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <span className="select-arrow" aria-hidden="true">▾</span>
            </div>

            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </header>


      {/* ========================================================
          HERO & WELCOME SECTION (TWO-COLUMN WITH AI ILLUSTRATION)
          ======================================================== */}
      <section className="hero-section">
        <div className="hero-container">
          {/* Left Column: Heading, Subtitle, Features */}
          <div className="hero-content">
            <div className="hero-pill">
              <span className="pill-dot"></span>
              <span>{t.heroPlatform}</span>
            </div>
            <h2 className="hero-title">{t.welcomeTitle || "Understand Your Health Reports with AI"}</h2>
            <p className="hero-subtitle">
              {t.welcomeSubtitle || "Upload your medical report to extract biomarkers, understand results and explore helpful health insights."}
            </p>

            <div className="hero-features-grid">
              <div className="feature-card">
                <div className="feature-icon-bubble">🧪</div>
                <div className="feature-card-text">
                  <strong>{t.biomarkerTitle}</strong>
                  <span>{t.biomarkerSubtitle}</span>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon-bubble">🩺</div>
                <div className="feature-card-text">
                  <strong>{t.patternsTitle}</strong>
                  <span>{t.patternsSubtitle}</span>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon-bubble">🧠</div>
                <div className="feature-card-text">
                  <strong>{t.knowledgeTitle}</strong>
                  <span>{t.knowledgeSubtitle}</span>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon-bubble">🌐</div>
                <div className="feature-card-text">
                  <strong>{t.footerLanguages}</strong>
                  <span>{t.appSubtitle}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Custom AI Healthcare Illustration */}
          <div className="hero-illustration-col" aria-hidden="true">
            <div className="illustration-wrapper">
              {/* Background glowing rings and circuit nodes */}
              <div className="illustration-bg-glow"></div>
              <svg className="neural-nodes" width="340" height="280" viewBox="0 0 340 280" fill="none">
                <circle cx="50" cy="40" r="3" fill="#38BDF8" opacity="0.7"/>
                <circle cx="290" cy="50" r="3" fill="#38BDF8" opacity="0.7"/>
                <circle cx="310" cy="220" r="3" fill="#0EA5E9" opacity="0.6"/>
                <circle cx="30" cy="240" r="3" fill="#0EA5E9" opacity="0.6"/>
                <line x1="50" y1="40" x2="120" y2="80" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" opacity="0.4"/>
                <line x1="290" y1="50" x2="220" y2="90" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" opacity="0.4"/>
                <line x1="220" y1="180" x2="310" y2="220" stroke="#0EA5E9" strokeWidth="1" strokeDasharray="3 3" opacity="0.35"/>
              </svg>

              {/* Main Medical Report Mock Card */}
              <div className="mock-report-card">
                <div className="mock-card-header">
                  <div className="mock-header-badge">
                    <span className="mock-dot red"></span>
                    <span className="mock-dot yellow"></span>
                    <span className="mock-dot green"></span>
                  </div>
                  <span className="mock-doc-id">{t.reportTypeLabel}</span>
                </div>

                <div className="mock-patient-strip">
                  <div className="mock-avatar">🩺</div>
                  <div className="mock-meta-lines">
                    <span className="mock-meta-name">{t.reportOverview}</span>
                    <span className="mock-meta-sub">{t.summaryMetrics}</span>
                  </div>
                </div>

                {/* Animated ECG Pulse line */}
                <div className="mock-ecg-box">
                  <svg className="ecg-line" viewBox="0 0 260 40" fill="none">
                    <path
                      d="M0 20 H50 L58 10 L66 32 L74 6 L82 26 L90 20 H150 L158 12 L166 30 L174 8 L182 24 L190 20 H260"
                      stroke="#38BDF8"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="ecg-status-text">{t.imagingSubtitle}</span>
                </div>

                {/* Mock biomarker rows */}
                <div className="mock-biomarker-rows">
                  <div className="mock-row">
                    <span className="mock-row-name">Hemoglobin</span>
                    <div className="mock-bar-wrap">
                      <div className="mock-bar-fill normal" style={{ width: "70%" }}></div>
                    </div>
                    <span className="mock-tag normal">14.2 g/dL</span>
                  </div>
                  <div className="mock-row">
                    <span className="mock-row-name">Blood Glucose</span>
                    <div className="mock-bar-wrap">
                      <div className="mock-bar-fill high" style={{ width: "85%" }}></div>
                    </div>
                    <span className="mock-tag high">105 mg/dL</span>
                  </div>
                  <div className="mock-row">
                    <span className="mock-row-name">HDL Cholesterol</span>
                    <div className="mock-bar-wrap">
                      <div className="mock-bar-fill low" style={{ width: "40%" }}></div>
                    </div>
                    <span className="mock-tag low">36 mg/dL</span>
                  </div>
                </div>
              </div>

              {/* Floating Analytical Badges */}
              <div className="floating-badge badge-ai-confidence">
                <span className="sparkle-icon">✨</span>
                <div className="badge-text">
                <strong>{t.knowledgeTitle}</strong>
                <span>{t.resultsFound}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ========================================================
          PDF UPLOAD CARD (REDESIGNED WITH GRADIENT BORDER)
          ======================================================== */}
      <section className="upload-container">
        <div className="upload-card">
          <div className="upload-card-header">
            <div className="upload-badge-pill">
              <span className="upload-pill-icon">📁</span>
              <span>{t.uploadBadge}</span>
            </div>
            <h3>{t.uploadTitle}</h3>
            <p>{t.uploadDescription}</p>
          </div>

          <div
            className={`dropzone ${isDragging ? "dropzone-dragging" : ""} ${file ? "dropzone-has-file" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                fileInputRef.current?.click();
              }
            }}
            aria-label={t.uploadAriaLabel}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            {!file ? (
              <div className="dropzone-empty">
                <div className="dropzone-icon-ring">
                  <div className="dropzone-icon">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="12" y1="18" x2="12" y2="12"></line>
                      <line x1="9" y1="15" x2="12" y2="12"></line>
                      <line x1="15" y1="15" x2="12" y2="12"></line>
                    </svg>
                  </div>
                </div>
                <div className="dropzone-text-group">
                  <p className="dropzone-primary-text">{t.choosePdf}</p>
                  <p className="dropzone-secondary-text">
                    {t.clickOrDrag || "Click to browse or drag and drop your PDF here"}
                  </p>
                  <div className="dropzone-spec-pill">
                    <span className="spec-dot"></span>
                    <span>{t.supportedFormat || "Supported format: PDF (up to 25 MB)"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="dropzone-filled">
                <div className="file-info-badge">
                  <div className="file-type-icon">PDF</div>
                  <div className="file-meta">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)} • {t.pdfSelected}</span>
                  </div>
                  <div className="file-ready-chip">
                    <span className="check-mark">✓</span>
                    <span>{t.ready}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="change-file-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  🔄 {t.changeFile || "Select a different file"}
                </button>
              </div>
            )}
          </div>

          <div className="upload-controls">
            <button
              className={`btn-primary ${loading ? "btn-loading" : ""}`}
              onClick={handleUpload}
              disabled={loading || !file}
            >
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true"></span>
                  <span>{t.analyzingButton}</span>
                </>
              ) : (
                <>
                  <span>{t.analyzeButton}</span>
                </>
              )}
            </button>
          </div>

          {loading && (
            <div className="loading-progress-hint">
              <div className="pulse-bar"></div>
              <span>{t.processingReport}</span>
            </div>
          )}

          {message && (
            <div
              className={`status-banner ${
                message.includes("success") || message.includes("सफलतापूर्वक") || message.includes("విజయవంతంగా") || message.includes("வெற்றிகரமாக")
                  ? "banner-success"
                  : "banner-info"
              }`}
              role="alert"
            >
              <span className="banner-icon">
                {message.includes("success") || message.includes("सफलतापूर्वक") ? "✓" : "ℹ"}
              </span>
              <span>{message}</span>
            </div>
          )}
        </div>
      </section>


      {/* ========================================================
          REPORT ANALYSIS DASHBOARD
          ======================================================== */}
      <main className="dashboard-container">
        <div className="dashboard-header-bar">
          <div className="dashboard-title-group">
            <span className="dashboard-eyebrow">{t.yourReport}</span>
            <h2 className="dashboard-title">
              {analysis
                ? isImaging
                  ? (t.imagingReport || "Imaging Diagnostic Scan")
                  : (t.labReport || "Laboratory Analysis Report")
                : (t.reportOverview || "Report Overview")}
            </h2>
          </div>

          {analysis && (
            <div className="dashboard-actions-row">
              {isReportSavedLocally ? (
                <button
                  type="button"
                  className="btn-saved-localstorage"
                  onClick={handleRemoveFromPermanentLocalStorage}
                title={t.historyDeleteTitle}
                >
                  <span className="save-btn-icon">✓</span>
                  <span>{t.savedOnLaptop}</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-add-localstorage"
                  onClick={handleSaveToPermanentLocalStorage}
                title={t.addToStorage}
                >
                  <span className="save-btn-icon">💾</span>
                  <span>{t.addToStorage}</span>
                </button>
              )}
              <button
                type="button"
                className="btn-download-report"
                onClick={handleDownloadReportFile}
                title={t.downloadPdf}
              >
                <span className="save-btn-icon">📄</span>
                <span>{t.downloadPdf}</span>
              </button>
              <button
                type="button"
                className="btn-chat-trigger-top"
                onClick={() => setIsChatOpen(true)}
                title={t.chatbotTitle}
              >
                💬 Ask Health AI
              </button>
              <button
                type="button"
                className="btn-close-report"
                onClick={handleClearCurrentReport}
                title={t.closeReport || "Close this report"}
              >
                ✕ {t.closeReport || "Close Report"}
              </button>
              <div className="report-type-badge">
                <span className="report-type-icon">{isImaging ? "🩻" : "🧪"}</span>
                <span className="report-type-text">
                  {analysis.report_type === "imaging"
                    ? (t.imagingReport || "Imaging Diagnostic Scan")
                    : (t.labReport || "Laboratory Analysis Report")}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* METRICS SUMMARY CARDS (Calculated from actual backend response) */}
        {analysis && !isImaging && biomarkerStats.total > 0 && (
          <div className="summary-cards-grid">
            <div className="summary-card card-total">
              <div className="summary-icon">📊</div>
              <div className="summary-info">
                <span className="summary-count">{biomarkerStats.total}</span>
                <span className="summary-label">{t.filterAll || "Total Tests"}</span>
              </div>
            </div>
            <div className="summary-card card-normal">
              <div className="summary-icon">🟢</div>
              <div className="summary-info">
                <span className="summary-count">{biomarkerStats.normal}</span>
                <span className="summary-label">{t.filterNormal || "Normal"}</span>
              </div>
            </div>
            <div className="summary-card card-high">
              <div className="summary-icon">🔴</div>
              <div className="summary-info">
                <span className="summary-count">{biomarkerStats.high}</span>
                <span className="summary-label">{t.statusHigh || "High"}</span>
              </div>
            </div>
            <div className="summary-card card-low">
              <div className="summary-icon">🟠</div>
              <div className="summary-info">
                <span className="summary-count">{biomarkerStats.low}</span>
                <span className="summary-label">{t.statusLow || "Low"}</span>
              </div>
            </div>
            {biomarkerStats.unknown > 0 && (
              <div className="summary-card card-unknown">
                <div className="summary-icon">⚪</div>
                <div className="summary-info">
                  <span className="summary-count">{biomarkerStats.unknown}</span>
                  <span className="summary-label">{t.statusUnknown || "Unclassified"}</span>
                </div>
              </div>
            )}
          </div>
        )}


        {/* ========================================================
            OVERALL IMPRESSION & CONCERN LEVEL GRID
            ======================================================== */}
        <div className="insight-grid">

          {/* OVERALL IMPRESSION */}
          <section className="card impression-card">
            <div className="card-header">
              <div className="card-header-icon card-icon-impression">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
                  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
                </svg>
              </div>
              <div className="card-header-titles">
                <div className="section-tag-pill navy">{t.clinicalSummaryTag}</div>
                <h3>{t.impressionTitle}</h3>
                <p>{t.impressionSubtitle}</p>
              </div>
            </div>

            <div className="card-body">
              {analysis ? (
                <div className="impression-content">
                  <p>{getImpressionText(analysis.impression) || t.noImpression}</p>
                </div>
              ) : (
                <div className="empty-state-box">
                  <span className="empty-icon">📄</span>
                  <p>{t.uploadPromptImpression}</p>
                </div>
              )}
            </div>
          </section>

          {/* CONCERN LEVEL */}
          <section className="card concern-card">
            <div className="card-header">
              <div className="card-header-icon card-icon-concern">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <div className="card-header-titles">
                <div className="section-tag-pill amber">{t.triageTag}</div>
                <h3>{t.concernTitle}</h3>
                <p>{t.concernSubtitle}</p>
              </div>
            </div>

            <div className="card-body">
              {analysis && analysis.concern_level ? (
                <div
                  className={`concern-alert-box ${
                    analysis.concern_level.level === "low"
                      ? "concern-low"
                      : "concern-followup"
                  }`}
                >
                  <div className="concern-status-header">
                    <span className="concern-status-indicator">
                      {analysis.concern_level.level === "low" ? "🟢" : "🟠"}
                    </span>
                    <strong className="concern-title-text">
                      {analysis.concern_level.label}
                    </strong>
                  </div>
                  <p className="concern-description-text">
                    {analysis.concern_level.description}
                  </p>
                </div>
              ) : (
                <div className="empty-state-box">
                  <span className="empty-icon">⏳</span>
                  <strong>{t.waitingForAnalysis}</strong>
                  <p>{t.waitingDescription}</p>
                </div>
              )}
            </div>
          </section>
        </div>


        {/* ========================================================
            IMAGING FINDINGS SECTION (If Imaging Report)
            ======================================================== */}
        {isImaging && (
          <section className="card findings-card">
            <div className="card-header">
              <div className="card-header-icon card-icon-imaging">
                🩻
              </div>
              <div className="card-header-titles">
                <div className="section-tag-pill purple">{t.radiologyTag}</div>
                <h3>{t.imagingTitle}</h3>
                <p>{t.imagingSubtitle}</p>
              </div>
            </div>

            <div className="card-body">
              {analysis.findings && analysis.findings.length > 0 ? (
                <div className="findings-grid">
                  {analysis.findings.map((finding, index) => (
                    <div className="finding-item" key={`${finding.organ}-${index}`}>
                      <div className="finding-organ-badge">
                        <span className="finding-pin">📍</span>
                        <strong>{finding.organ}</strong>
                      </div>
                      <p className="finding-desc">{finding.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state-box">
                  <p>{t.noImagingFindings}</p>
                </div>
              )}
            </div>
          </section>
        )}


        {/* ========================================================
            BIOMARKER ANALYSIS SECTION (If Laboratory Report)
            ======================================================== */}
        {!isImaging && (
          <section className="card biomarkers-card">
            <div className="card-header biomarker-header-split">
              <div className="biomarker-title-wrap">
                <div className="card-header-icon card-icon-biomarker">
                  🧪
                </div>
                <div className="card-header-titles">
                  <div className="section-tag-pill teal">{t.laboratoryTag}</div>
                  <h3>{t.biomarkerTitle}</h3>
                  <p>{t.biomarkerSubtitle}</p>
                </div>
              </div>

              {analysis && analysis.biomarkers && analysis.biomarkers.length > 0 && (
                <div className="filter-tab-bar" role="tablist" aria-label={t.biomarkerTitle}>
                  <button
                    className={`filter-btn ${biomarkerFilter === "all" ? "filter-active" : ""}`}
                    onClick={() => setBiomarkerFilter("all")}
                    role="tab"
                    aria-selected={biomarkerFilter === "all"}
                  >
                    {t.filterAll || "All"} ({biomarkerStats.total})
                  </button>
                  {biomarkerStats.attention > 0 && (
                    <button
                      className={`filter-btn filter-btn-attention ${biomarkerFilter === "attention" ? "filter-active" : ""}`}
                      onClick={() => setBiomarkerFilter("attention")}
                      role="tab"
                      aria-selected={biomarkerFilter === "attention"}
                    >
                      {t.filterAttention || "Attention"} ({biomarkerStats.attention})
                    </button>
                  )}
                  <button
                    className={`filter-btn ${biomarkerFilter === "normal" ? "filter-active" : ""}`}
                    onClick={() => setBiomarkerFilter("normal")}
                    role="tab"
                    aria-selected={biomarkerFilter === "normal"}
                  >
                    {t.filterNormal || "Normal"} ({biomarkerStats.normal})
                  </button>
                  {biomarkerStats.unknown > 0 && (
                    <button
                      className={`filter-btn ${biomarkerFilter === "unknown" ? "filter-active" : ""}`}
                      onClick={() => setBiomarkerFilter("unknown")}
                      role="tab"
                      aria-selected={biomarkerFilter === "unknown"}
                    >
                      {t.filterUnknown || "Other"} ({biomarkerStats.unknown})
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="card-body">
              {analysis && analysis.biomarkers && analysis.biomarkers.length > 0 ? (
                <div className="biomarkers-grid">
                  {filteredBiomarkers.map((biomarker, index) => {
                    const status = biomarker.status || "unknown";
                    return (
                      <div
                        className={`biomarker-card status-border-${status}`}
                        key={`${biomarker.name}-${index}`}
                      >
                        <div className="biomarker-card-top">
                          <div className="biomarker-name-group">
                            <span className="biomarker-name">{biomarker.name}</span>
                            {biomarker.page && (
                              <span className="page-pill">
                                {t.pageLabel || "P."} {biomarker.page}
                              </span>
                            )}
                          </div>
                          <span className={`status-pill status-${status}`}>
                            <span className="status-symbol">{getStatusIcon(status)}</span>
                            <span>{biomarker.status_label || getStatusText(status, t)}</span>
                          </span>
                        </div>

                        <div className="biomarker-measurement">
                          <span className="measured-value">{biomarker.value}</span>
                          <span className="measured-unit">{biomarker.unit}</span>
                        </div>

                        {biomarker.reference_range && (
                          <div className="reference-row">
                            <span className="ref-label">{t.referenceRange}</span>
                            <span className="ref-val">{biomarker.reference_range}</span>
                          </div>
                        )}

                        {((biomarker.reference_min !== null && biomarker.reference_min !== undefined) ||
                          (biomarker.reference_max !== null && biomarker.reference_max !== undefined)) && (
                          <div className="reference-row">
                            <span className="ref-label">{t.referenceRange}</span>
                            <span className="ref-val">
                              {biomarker.reference_min ?? ""} - {biomarker.reference_max ?? ""}
                            </span>
                          </div>
                        )}

                        {biomarker.status_explanation && (
                          <div className="explanation-box">
                            <p>{biomarker.status_explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state-box">
                  <span className="empty-icon">🧪</span>
                  <p>{analysis ? t.noBiomarkers : t.uploadPromptBiomarkers}</p>
                </div>
              )}
            </div>
          </section>
        )}


        {/* ========================================================
            DETECTED PATTERNS (If Laboratory Report)
            ======================================================== */}
        {!isImaging && (
          <section className="card patterns-card">
            <div className="card-header">
              <div className="card-header-icon card-icon-pattern">
                🔎
              </div>
              <div className="card-header-titles">
                <div className="section-tag-pill green">{t.correlationsTag}</div>
                <h3>{t.patternsTitle}</h3>
                <p>{t.patternsSubtitle}</p>
              </div>
            </div>

            <div className="card-body">
              {analysis && analysis.patterns && analysis.patterns.length > 0 ? (
                <div className="patterns-grid">
                  {analysis.patterns.map((pattern, index) => (
                    <div className="pattern-item" key={`${pattern.name}-${index}`}>
                      <div className="pattern-item-header">
                        <span className="pattern-tag">Pattern #{index + 1}</span>
                        <h4 className="pattern-name">{pattern.name}</h4>
                      </div>
                      <p className="pattern-desc">{pattern.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state-box">
                  <span className="empty-icon">🔎</span>
                  <p>{analysis ? t.noPatterns : t.uploadPromptPatterns}</p>
                </div>
              )}
            </div>
          </section>
        )}


        {/* ========================================================
            RAG MEDICAL KNOWLEDGE ANALYSIS (INTELLIGENT PANEL)
            ======================================================== */}
        <section className="card knowledge-card">
          <div className="card-header">
            <div className="card-header-icon card-icon-knowledge">
              🧠
            </div>
            <div className="card-header-titles">
              <div className="section-tag-pill indigo">{t.evidenceTag}</div>
              <h3>{t.knowledgeTitle}</h3>
              <p>{t.knowledgeSubtitle}</p>
            </div>
          </div>

          <div className="card-body">
            {analysis && analysis.knowledge && analysis.knowledge.length > 0 ? (
              <div className="knowledge-grid">
                {analysis.knowledge.map((item, index) => (
                  <article className="knowledge-article" key={`${item.title}-${index}`}>
                    <div className="knowledge-article-header">
                      <h4>{item.title}</h4>
                      {item.related_biomarker && (
                        <span className="related-pill">
                          {t.relatedTo} {item.related_biomarker}
                        </span>
                      )}
                    </div>
                    <p className="knowledge-body-text">{item.content}</p>
                    {item.source && (
                      <div className="knowledge-footer">
                        <span className="source-tag">
                          📚 {t.source} {item.source}
                        </span>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state-box">
                <span className="empty-icon">📚</span>
                <p>{analysis ? t.noKnowledge : t.uploadPromptKnowledge}</p>
              </div>
            )}
          </div>
        </section>


        {/* ========================================================
            QUESTIONS TO ASK YOUR DOCTOR
            ======================================================== */}
        <section className="card doctor-card">
          <div className="card-header">
            <div className="card-header-icon card-icon-doctor">
              👨‍⚕️
            </div>
            <div className="card-header-titles">
              <div className="section-tag-pill teal">{t.physicianTag}</div>
              <h3>{t.doctorTitle}</h3>
              <p>{t.doctorSubtitle}</p>
            </div>
          </div>

          <div className="card-body">
            <div className="doctor-note-banner">
              <span className="doctor-note-icon">💡</span>
              <span>{t.doctorNote || "Bring these questions to your next healthcare appointment to discuss with your doctor."}</span>
            </div>

            {analysis && analysis.doctor_questions && analysis.doctor_questions.length > 0 ? (
              <div className="questions-grid">
                {analysis.doctor_questions.map((question, index) => (
                  <div className="question-card" key={index}>
                    <span className="question-number">{index + 1}</span>
                    <p className="question-text">{question}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="questions-grid">
                {[t.defaultQ1, t.defaultQ2, t.defaultQ3, t.defaultQ4].map((q, idx) => (
                  <div className="question-card" key={idx}>
                    <span className="question-number">{idx + 1}</span>
                    <p className="question-text">{q}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>


        {/* ========================================================
            CHATBOT ASSISTANT CARD (INTERACTIVE)
            ======================================================== */}
        <section className="card chatbot-card">
          <div className="card-header">
            <div className="card-header-icon card-icon-chat">
              💬
            </div>
            <div className="card-header-titles">
              <div className="section-tag-pill slate">{t.assistantTag}</div>
              <h3>{t.chatbotTitle || "Health Report Assistant"}</h3>
              <p>{t.chatbotSubtitle || "Ask questions about your clinical values, abnormal flags, or diet"}</p>
            </div>
          </div>

          <div className="card-body">
            <div className="chatbot-wrapper">
              <div className="bot-bubble">
                <span className="bot-avatar">🤖</span>
                <div className="bubble-content">
                  {t.chatbotWelcome}
                </div>
              </div>

              <div style={{ marginTop: "14px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn-chat-trigger-top"
                  onClick={() => setIsChatOpen(true)}
                >
                  💬 {t.chatOpen}
                </button>
              </div>
            </div>
          </div>
        </section>


        {/* ========================================================
            MEDICAL DISCLAIMER
            ======================================================== */}
        <section className="disclaimer-banner">
          <div className="disclaimer-icon-wrap" aria-hidden="true">
            ⚖️
          </div>
          <div className="disclaimer-copy">
            <h4>{t.disclaimerTitle}</h4>
            <p>{t.disclaimerText}</p>
          </div>
        </section>

      </main>

      {/* ========================================================
          FOOTER
          ======================================================== */}
      <footer className="app-footer">
        <div className="footer-inner">
          <p>© {new Date().getFullYear()} {t.appTitle} • {t.brandSubtitle}</p>
          <div className="footer-links">
            <span>{t.footerConfidential}</span>
            <span>•</span>
            <span>{t.footerEvidence}</span>
            <span>•</span>
            <span>{t.footerLanguages}</span>
          </div>
        </div>
      </footer>

      {/* Floating Interactive Chat Drawer (Clinical AI Assistant) */}
      <InteractiveChat
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen((prev) => !prev)}
        reportId={reportId}
        reportFilename={reportFilename}
        analysis={analysis}
        language={language}
        getToken={getToken}
        t={t}
      />

      {/* Saved Reports History Modal (LocalStorage + PostgreSQL) */}
      {showHistoryModal && (
        <div className="modal-backdrop" onClick={() => setShowHistoryModal(false)}>
          <div className="history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="history-modal-header">
              <div className="history-modal-title-wrap">
                <h3>📁 {t.historyModalTitle}</h3>
                <span className="history-modal-count-badge">{mergedReports.length}</span>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setShowHistoryModal(false)}
                aria-label={t.closeReport}
              >
                ✕
              </button>
            </div>

            {/* Modal Toolbar: All Reports & Export */}
            <div className="history-modal-toolbar">
              <span className="history-all-reports-label">
                {t.historyAll} ({mergedReports.length})
              </span>
              <div className="history-toolbar-actions">
                {localReports.length > 0 && (
                  <button
                    type="button"
                    className="btn-history-tool"
                    onClick={exportReportsAsJSON}
                    title={t.historyExport}
                  >
                    📥 {t.historyExport}
                  </button>
                )}
              </div>
            </div>

            <div className="history-modal-body">
              {mergedReports.length === 0 ? (
                <div className="history-empty-text">
                  <p>{t.historyEmpty}</p>
                </div>
              ) : (
                mergedReports.map((rep) => {
                  const isLocal = rep.source === "localStorage";
                  const isSynced = rep.source === "synced";

                  const biomarkersCount = (rep.biomarkers || rep.analysis?.biomarkers || []).length;
                  const findingsCount = (rep.findings || rep.analysis?.findings || []).length;

                  return (
                    <div key={rep.id} className="history-item-card">
                      <div className="history-item-meta">
                        <div className="history-item-title-row">
                          <span className="history-filename">{rep.filename}</span>
                        </div>
                        <div className="history-subdetails">
                          <span className="history-type-chip">{rep.report_type}</span>
                          <span>•</span>
                          <span>
                            {rep.created_at
                              ? new Date(rep.created_at).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : t.historyRecent}
                          </span>
                          <span>•</span>
                          <span>
                            {rep.report_type === "imaging"
                              ? `${findingsCount} ${t.historyFindings}`
                              : `${biomarkersCount} ${t.historyBiomarkers}`}
                          </span>
                        </div>
                      </div>
                      <div className="history-item-actions">
                        <button
                          type="button"
                          className="btn-load-report"
                          onClick={() => loadSavedReport(rep)}
                        >
                          {t.historyView}
                        </button>
                        {(isLocal || isSynced) && (
                          <button
                            type="button"
                            className="btn-delete-report"
                            onClick={(e) => handleDeleteLocalReport(rep.id, e)}
                            title={t.historyDeleteTitle}
                            aria-label={t.historyDeleteTitle}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
