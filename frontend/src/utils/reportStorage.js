/**
 * Utility for managing automatic localStorage saving and retrieval of
 * AI-analyzed medical reports.
 */

export const STORAGE_KEYS = {
  REPORTS: "ai_analyzed_medical_reports_v1",
  ACTIVE_REPORT: "ai_active_medical_report_v1",
};

const MAX_STORED_REPORTS = 50;

/**
 * Safely parse JSON from localStorage
 */
function safeGetItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[reportStorage] Failed to read ${key} from localStorage:`, err);
    return fallback;
  }
}

/**
 * Safely set JSON in localStorage with quota management
 */
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    if (
      err.name === "QuotaExceededError" ||
      err.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      err.code === 22 ||
      err.code === 1014
    ) {
      console.warn("[reportStorage] LocalStorage quota exceeded. Evicting oldest reports...");
      return handleQuotaExceeded(key, value);
    }
    console.error(`[reportStorage] Failed to write ${key} to localStorage:`, err);
    return false;
  }
}

/**
 * If quota is exceeded, evict the oldest reports from the list and try saving again
 */
function handleQuotaExceeded(targetKey, targetValue) {
  try {
    let reports = safeGetItem(STORAGE_KEYS.REPORTS, []);
    if (!Array.isArray(reports) || reports.length <= 1) {
      return false;
    }

    // Drop oldest 25% of reports
    const dropCount = Math.max(1, Math.floor(reports.length * 0.25));
    reports = reports.slice(0, reports.length - dropCount);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));

    // Try setting target key again
    localStorage.setItem(targetKey, JSON.stringify(targetValue));
    return true;
  } catch (secondErr) {
    console.error("[reportStorage] LocalStorage quota recovery failed:", secondErr);
    return false;
  }
}

/**
 * Fetch all automatically saved reports from localStorage
 * Ordered newest first
 */
export function getLocalStorageReports() {
  const reports = safeGetItem(STORAGE_KEYS.REPORTS, []);
  if (!Array.isArray(reports)) return [];
  return reports.sort((a, b) => {
    const dateA = new Date(a.created_at || a.timestamp || 0).getTime();
    const dateB = new Date(b.created_at || b.timestamp || 0).getTime();
    return dateB - dateA;
  });
}

/**
 * Automatically save an AI-analyzed report to localStorage.
 * Updates if same ID exists, or prepends new entry.
 */
export function saveReportToLocalStorage(reportData) {
  if (!reportData || !reportData.analysis) {
    console.warn("[reportStorage] Cannot save invalid report data:", reportData);
    return null;
  }

  const existingReports = getLocalStorageReports();

  // Normalize report fields
  const normalizedId =
    reportData.id ||
    reportData.report_id ||
    `local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const created_at = reportData.created_at || new Date().toISOString();
  const filename = reportData.filename || "Medical Report";
  const report_type =
    reportData.report_type ||
    reportData.analysis?.report_type ||
    "laboratory";
  const language = reportData.language || "en";

  const standardizedReport = {
    id: normalizedId,
    filename,
    report_type,
    language,
    created_at,
    status: reportData.status || "document_processed",
    source: reportData.source || "localStorage",
    analysis: reportData.analysis,
    biomarkers: reportData.analysis?.biomarkers || reportData.biomarkers || [],
    findings: reportData.analysis?.findings || reportData.findings || [],
    impression: reportData.analysis?.impression || reportData.impression || "",
    concern_level:
      reportData.analysis?.concern_level || reportData.concern_level || null,
    savedAt: new Date().toISOString(),
  };

  // Deduplicate: check if this report already exists by ID
  const existingIndex = existingReports.findIndex(
    (r) => String(r.id) === String(standardizedReport.id)
  );

  let updatedList;
  if (existingIndex >= 0) {
    // Update existing report and move to top
    const updated = { ...existingReports[existingIndex], ...standardizedReport };
    updatedList = [
      updated,
      ...existingReports.filter((_, idx) => idx !== existingIndex),
    ];
  } else {
    // Check if duplicate filename with exact same biomarkers length created in the last 15 seconds
    const recentDuplicate = existingReports.find((r) => {
      const timeDiff =
        Math.abs(new Date(r.created_at).getTime() - new Date(created_at).getTime());
      return (
        r.filename === filename &&
        timeDiff < 15000 &&
        (r.biomarkers || []).length === standardizedReport.biomarkers.length
      );
    });

    if (recentDuplicate) {
      // Update that entry instead of duplicating
      updatedList = existingReports.map((r) =>
        r.id === recentDuplicate.id ? { ...r, ...standardizedReport, id: r.id } : r
      );
    } else {
      updatedList = [standardizedReport, ...existingReports];
    }
  }

  // Cap maximum stored reports
  if (updatedList.length > MAX_STORED_REPORTS) {
    updatedList = updatedList.slice(0, MAX_STORED_REPORTS);
  }

  // Save list
  safeSetItem(STORAGE_KEYS.REPORTS, updatedList);

  // Set active report
  setActiveReportInLocalStorage(standardizedReport);

  // Dispatch custom event for real-time reactivity across tabs / components
  try {
    window.dispatchEvent(
      new CustomEvent("medical_reports_updated", {
        detail: { report: standardizedReport, total: updatedList.length },
      })
    );
  } catch (_) {}

  return standardizedReport;
}

/**
 * Remove a specific report from localStorage
 */
export function deleteLocalStorageReport(reportId) {
  const existingReports = getLocalStorageReports();
  const updatedList = existingReports.filter(
    (r) => String(r.id) !== String(reportId)
  );
  safeSetItem(STORAGE_KEYS.REPORTS, updatedList);

  // Clear active report if deleted
  const active = getActiveReportFromLocalStorage();
  if (active && String(active.id) === String(reportId)) {
    clearActiveReportFromLocalStorage();
  }

  try {
    window.dispatchEvent(
      new CustomEvent("medical_reports_updated", {
        detail: { deletedId: reportId, total: updatedList.length },
      })
    );
  } catch (_) {}

  return updatedList;
}

/**
 * Clear all locally stored medical reports
 */
export function clearAllLocalStorageReports() {
  try {
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    clearActiveReportFromLocalStorage();
    window.dispatchEvent(
      new CustomEvent("medical_reports_updated", { detail: { total: 0 } })
    );
    return true;
  } catch (err) {
    console.error("[reportStorage] Failed to clear reports:", err);
    return false;
  }
}

/**
 * Set the currently active viewed report
 */
export function setActiveReportInLocalStorage(report) {
  if (!report) {
    clearActiveReportFromLocalStorage();
    return;
  }
  safeSetItem(STORAGE_KEYS.ACTIVE_REPORT, {
    id: report.id,
    filename: report.filename,
    report_type: report.report_type,
    language: report.language,
    created_at: report.created_at,
    analysis: report.analysis,
  });
}

/**
 * Get the currently active viewed report
 */
export function getActiveReportFromLocalStorage() {
  return safeGetItem(STORAGE_KEYS.ACTIVE_REPORT, null);
}

/**
 * Clear the currently active viewed report
 */
export function clearActiveReportFromLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_REPORT);
  } catch (_) {}
}

/**
 * Export all saved localStorage reports as a downloadable JSON file
 */
export function exportReportsAsJSON() {
  const reports = getLocalStorageReports();
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(reports, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute(
    "download",
    `medical_reports_backup_${new Date().toISOString().slice(0, 10)}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
