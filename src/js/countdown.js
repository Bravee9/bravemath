/**
 * THPTQG Examination Countdown & Automatic Year Rollover Module
 *
 * Calculates real-time remaining time (Days, Hours, Minutes, Seconds) to the
 * upcoming Vietnam National High School Graduation Examination (THPTQG).
 *
 * Automatic Rollover Mechanism:
 * 1. Client-Side Real-Time Rollover:
 *    - Evaluates `now` against `exam.endDate` on every tick (1000ms).
 *    - As soon as the current target examination finishes (e.g., THPTQG 2027 ends on
 *      2027-06-25T17:00:00+07:00), the system immediately transitions to THPTQG 2028
 *      (and subsequent years) without requiring a page reload or manual intervention.
 *    - Includes a deterministic late-June rule generator for any future year beyond
 *      the pre-populated schedule list.
 * 2. Server/CI Scheduled Rollover:
 *    - Synchronizes with `data/exam-schedule.json` maintained by `.github/workflows/update-exam-date.yml`.
 */

const FALLBACK_EXAM_DATA = {
    activeYear: 2027,
    timezone: 'Asia/Ho_Chi_Minh',
    utcOffset: '+07:00',
    autoRollover: true,
    schedules: [
        {
            year: 2026,
            label: 'Kỳ thi Tốt nghiệp THPT Quốc gia 2026',
            examDate: '2026-06-11T07:30:00+07:00',
            mathExamDate: '2026-06-11T14:20:00+07:00',
            endDate: '2026-06-12T17:00:00+07:00',
            status: 'completed',
            isOfficial: true,
            note: 'Kỳ thi THPT Quốc gia 2026 đã hoàn thành (11/06/2026 - 12/06/2026).'
        },
        {
            year: 2027,
            label: 'Kỳ thi Tốt nghiệp THPT Quốc gia 2027',
            examDate: '2027-06-24T07:30:00+07:00',
            mathExamDate: '2027-06-24T14:20:00+07:00',
            endDate: '2027-06-25T17:00:00+07:00',
            status: 'upcoming',
            isOfficial: false,
            note: 'Lịch thi dự kiến ngày 24–25/06/2027 theo khung kế hoạch năm học của Bộ GD&ĐT.'
        },
        {
            year: 2028,
            label: 'Kỳ thi Tốt nghiệp THPT Quốc gia 2028',
            examDate: '2028-06-22T07:30:00+07:00',
            mathExamDate: '2028-06-22T14:20:00+07:00',
            endDate: '2028-06-23T17:00:00+07:00',
            status: 'scheduled',
            isOfficial: false,
            note: 'Lịch thi dự kiến ngày 22–23/06/2028 theo khung kế hoạch năm học của Bộ GD&ĐT.'
        },
        {
            year: 2029,
            label: 'Kỳ thi Tốt nghiệp THPT Quốc gia 2029',
            examDate: '2029-06-21T07:30:00+07:00',
            mathExamDate: '2029-06-21T14:20:00+07:00',
            endDate: '2029-06-22T17:00:00+07:00',
            status: 'scheduled',
            isOfficial: false,
            note: 'Lịch thi dự kiến ngày 21–22/06/2029 theo khung kế hoạch năm học của Bộ GD&ĐT.'
        },
        {
            year: 2030,
            label: 'Kỳ thi Tốt nghiệp THPT Quốc gia 2030',
            examDate: '2030-06-27T07:30:00+07:00',
            mathExamDate: '2030-06-27T14:20:00+07:00',
            endDate: '2030-06-28T17:00:00+07:00',
            status: 'scheduled',
            isOfficial: false,
            note: 'Lịch thi dự kiến ngày 27–28/06/2030 theo khung kế hoạch năm học của Bộ GD&ĐT.'
        }
    ]
};

let scheduleData = FALLBACK_EXAM_DATA;
let countdownTimerId = null;

/**
 * Compute a fallback schedule entry for any future year (4th Thursday of June).
 * @param {number} year
 */
export function buildFallbackYearSchedule(year) {
    const firstDayOfJune = new Date(Date.UTC(year, 5, 1));
    const dayOfWeek = firstDayOfJune.getUTCDay();
    const offsetToFirstThursday = (4 - dayOfWeek + 7) % 7;
    const fourthThursday = 1 + offsetToFirstThursday + 21;
    const endDay = fourthThursday + 1;
    const pad = (n) => String(n).padStart(2, '0');

    return {
        year,
        label: `Kỳ thi Tốt nghiệp THPT Quốc gia ${year}`,
        examDate: `${year}-06-${pad(fourthThursday)}T07:30:00+07:00`,
        mathExamDate: `${year}-06-${pad(fourthThursday)}T14:20:00+07:00`,
        endDate: `${year}-06-${pad(endDay)}T17:00:00+07:00`,
        status: 'upcoming',
        isOfficial: false,
        note: `Lịch thi dự kiến ngày ${pad(fourthThursday)}–${pad(endDay)}/06/${year} theo khung kế hoạch năm học của Bộ GD&ĐT.`
    };
}

/**
 * Resolve the currently active examination and the next rollover examination
 * for any given timestamp `now`.
 *
 * @param {Date} [now=new Date()]
 * @param {Array} [schedules=scheduleData.schedules]
 * @returns {{ activeExam: Object, nextExam: Object, previousExam: Object, phase: 'countdown'|'ongoing' }}
 */
export function resolveActiveExam(now = new Date(), schedules = scheduleData.schedules) {
    const nowMs = now.getTime();
    const sorted = [...(schedules || [])].sort((a, b) => a.year - b.year);

    let activeExam = null;
    for (const item of sorted) {
        const endMs = new Date(item.endDate).getTime();
        if (nowMs < endMs) {
            activeExam = item;
            break;
        }
    }

    // If all configured years have passed, synthesize dynamically for current/next year
    if (!activeExam) {
        let candidateYear = now.getFullYear();
        let candidate = buildFallbackYearSchedule(candidateYear);
        if (nowMs >= new Date(candidate.endDate).getTime()) {
            candidateYear += 1;
            candidate = buildFallbackYearSchedule(candidateYear);
        }
        activeExam = candidate;
    }

    const nextYear = activeExam.year + 1;
    const nextExam = sorted.find(s => s.year === nextYear) || buildFallbackYearSchedule(nextYear);

    const prevYear = activeExam.year - 1;
    const previousExam = sorted.find(s => s.year === prevYear) || buildFallbackYearSchedule(prevYear);

    const startMs = new Date(activeExam.examDate).getTime();
    const phase = nowMs >= startMs ? 'ongoing' : 'countdown';

    return {
        activeExam,
        nextExam,
        previousExam,
        phase
    };
}

/**
 * Compute countdown breakdown and academic year progress percentage.
 * @param {Date} [now=new Date()]
 */
export function computeCountdownMetrics(now = new Date()) {
    const { activeExam, nextExam, previousExam, phase } = resolveActiveExam(now);
    const nowMs = now.getTime();
    const targetMs = new Date(activeExam.examDate).getTime();
    const prevEndMs = new Date(previousExam.endDate).getTime();

    const diffMs = Math.max(0, targetMs - nowMs);
    const totalSeconds = Math.floor(diffMs / 1000);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Calculate progress from the end of the previous exam to the start of the active exam
    const cycleTotalMs = Math.max(1, targetMs - prevEndMs);
    const cycleElapsedMs = Math.max(0, Math.min(cycleTotalMs, nowMs - prevEndMs));
    const progressPercent = Math.min(100, Math.max(0, (cycleElapsedMs / cycleTotalMs) * 100));

    return {
        activeExam,
        nextExam,
        previousExam,
        phase,
        days,
        hours,
        minutes,
        seconds,
        totalSeconds,
        progressPercent
    };
}

/**
 * Format an ISO date string into DD/MM/YYYY in Vietnam timezone (GMT+7).
 * @param {string} isoStr
 */
function formatVietnamDate(isoStr) {
    const d = new Date(isoStr);
    const formatter = new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    return formatter.format(d);
}

/**
 * Format an ISO date string into HH:mm — DD/MM/YYYY in Vietnam timezone (GMT+7).
 * @param {string} isoStr
 */
function formatVietnamDateTime(isoStr) {
    const d = new Date(isoStr);
    const datePart = formatVietnamDate(isoStr);
    const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    return `${timeFormatter.format(d)} — ${datePart}`;
}

/**
 * Render the current countdown metrics into the DOM.
 * @param {Date} [now=new Date()]
 */
export function renderCountdownTick(now = new Date()) {
    const root = document.getElementById('thptqg-countdown');
    if (!root) return;

    const metrics = computeCountdownMetrics(now);
    const { activeExam, nextExam, phase, days, hours, minutes, seconds, progressPercent } = metrics;
    const pad2 = (n) => String(n).padStart(2, '0');

    const badgeEl = document.getElementById('cd-exam-badge');
    const titleYearEl = document.getElementById('cd-exam-year');
    const targetDateEl = document.getElementById('cd-exam-date');
    const mathSlotEl = document.getElementById('cd-math-slot');
    const noteEl = document.getElementById('cd-exam-note');
    const rolloverEl = document.getElementById('cd-rollover-info');
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');
    const progressFillEl = document.getElementById('cd-progress-fill');
    const progressPctEl = document.getElementById('cd-progress-pct');

    if (badgeEl) {
        badgeEl.textContent = phase === 'ongoing'
            ? `ĐANG DIỄN RA KỲ THI THPTQG ${activeExam.year}`
            : `ĐẾM NGƯỢC KỲ THI THPT QUỐC GIA ${activeExam.year}`;
    }

    if (titleYearEl) {
        titleYearEl.textContent = `THPT Quốc Gia ${activeExam.year}`;
    }

    if (targetDateEl) {
        targetDateEl.textContent = `${formatVietnamDate(activeExam.examDate)} • 07:30 GMT+7`;
    }

    if (mathSlotEl && activeExam.mathExamDate) {
        mathSlotEl.textContent = `Môn Toán: ${formatVietnamDateTime(activeExam.mathExamDate)}`;
    }

    if (noteEl) {
        noteEl.textContent = activeExam.note || '';
    }

    if (rolloverEl) {
        rolloverEl.textContent = `Tự động chuyển sang kỳ thi ${nextExam.year} sau ${formatVietnamDate(activeExam.endDate)}`;
    }

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = pad2(hours);
    if (minutesEl) minutesEl.textContent = pad2(minutes);
    if (secondsEl) secondsEl.textContent = pad2(seconds);

    const formattedPct = `${progressPercent.toFixed(1)}%`;
    if (progressFillEl) {
        progressFillEl.style.width = formattedPct;
    }
    if (progressPctEl) {
        progressPctEl.textContent = formattedPct;
    }
}

/**
 * Fetch the latest exam schedule JSON from `data/exam-schedule.json`.
 */
async function fetchExamSchedule() {
    try {
        const basePath = import.meta.env?.BASE_URL || '/';
        const response = await fetch(`${basePath}data/exam-schedule.json?v=${Date.now()}`);
        if (!response.ok) return;
        const json = await response.json();
        if (json && Array.isArray(json.schedules) && json.schedules.length > 0) {
            scheduleData = json;
            renderCountdownTick();
        }
    } catch {
        // Fallback schedule is already active
    }
}

/**
 * Initialize the THPTQG Countdown component.
 */
export function initExamCountdown() {
    const root = document.getElementById('thptqg-countdown');
    if (!root) return;

    // Expose public testing & inspection API on window
    window.__BRAVEMATH_COUNTDOWN__ = {
        resolveActiveExam,
        computeCountdownMetrics,
        renderCountdownTick,
        getScheduleData: () => scheduleData
    };

    // Initial synchronous render (prevents any empty flash)
    renderCountdownTick();

    // Start 1-second live interval
    if (countdownTimerId) clearInterval(countdownTimerId);
    countdownTimerId = setInterval(() => {
        renderCountdownTick();
    }, 1000);

    // Hydrate from data/exam-schedule.json
    fetchExamSchedule();
}
