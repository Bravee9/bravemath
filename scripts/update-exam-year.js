#!/usr/bin/env node
/**
 * Automated THPTQG Exam Year Rollover Script
 * Checks whether the currently active THPTQG examination date has passed,
 * automatically transitions `activeYear` to the next upcoming examination year
 * (e.g., 2027 -> 2028), updates schedule statuses, and pre-generates future
 * examination entries using the Ministry of Education and Training (MOET) late-June rule.
 *
 * Usage:
 *   node scripts/update-exam-year.js
 *   node scripts/update-exam-year.js --simulate-date 2027-06-26T00:00:00+07:00
 *   node scripts/update-exam-year.js --dry-run
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCHEDULE_PATH = resolve(__dirname, '../data/exam-schedule.json');

/**
 * Compute the 4th Thursday of June for a given year (standard MOET THPTQG window).
 * @param {number} year
 * @returns {{ startDay: number, endDay: number }}
 */
export function computeLateJuneExamDays(year) {
    // June has 30 days; month index in JS Date is 5
    const firstDayOfJune = new Date(Date.UTC(year, 5, 1));
    const dayOfWeek = firstDayOfJune.getUTCDay(); // 0 = Sun, 4 = Thu
    const offsetToFirstThursday = (4 - dayOfWeek + 7) % 7;
    const firstThursday = 1 + offsetToFirstThursday;
    const fourthThursday = firstThursday + 21;
    return {
        startDay: fourthThursday,
        endDay: fourthThursday + 1
    };
}

/**
 * Build a default schedule entry for a given year.
 * @param {number} year
 */
export function createScheduleForYear(year) {
    const { startDay, endDay } = computeLateJuneExamDays(year);
    const pad = (n) => String(n).padStart(2, '0');
    return {
        year,
        label: `Kỳ thi Tốt nghiệp THPT Quốc gia ${year}`,
        examDate: `${year}-06-${pad(startDay)}T07:30:00+07:00`,
        mathExamDate: `${year}-06-${pad(startDay)}T14:20:00+07:00`,
        endDate: `${year}-06-${pad(endDay)}T17:00:00+07:00`,
        status: 'scheduled',
        isOfficial: false,
        note: `Lịch thi dự kiến ngày ${pad(startDay)}–${pad(endDay)}/06/${year} theo khung kế hoạch năm học của Bộ GD&ĐT.`
    };
}

/**
 * Evaluate and update the exam schedule object for a reference timestamp.
 * @param {Object} data - Parsed exam-schedule.json content
 * @param {Date} now - Current or simulated Date
 * @returns {{ updatedData: Object, changed: boolean, previousYear: number, activeYear: number }}
 */
export function reconcileExamSchedule(data, now = new Date()) {
    const cloned = JSON.parse(JSON.stringify(data));
    const previousYear = cloned.activeYear;

    if (!Array.isArray(cloned.schedules)) {
        cloned.schedules = [];
    }

    // Sort schedules ascending by year
    cloned.schedules.sort((a, b) => a.year - b.year);

    // Ensure schedules exist up to at least (currentYear + 4)
    const minMaxYear = now.getUTCFullYear() + 4;
    let highestYear = cloned.schedules.length > 0
        ? cloned.schedules[cloned.schedules.length - 1].year
        : now.getUTCFullYear();

    while (highestYear < minMaxYear) {
        highestYear += 1;
        cloned.schedules.push(createScheduleForYear(highestYear));
    }

    // Update status of each schedule and find the active upcoming/ongoing exam
    let nextActive = null;
    for (const item of cloned.schedules) {
        const endMs = new Date(item.endDate).getTime();
        const startMs = new Date(item.examDate).getTime();
        const nowMs = now.getTime();

        if (nowMs >= endMs) {
            item.status = 'completed';
        } else if (nowMs >= startMs && nowMs < endMs) {
            item.status = 'ongoing';
            if (!nextActive) nextActive = item;
        } else {
            if (!nextActive) {
                item.status = 'upcoming';
                nextActive = item;
            } else {
                item.status = 'scheduled';
            }
        }
    }

    // Fallback if all existing entries are completed
    if (!nextActive) {
        const fallbackYear = highestYear + 1;
        const newEntry = createScheduleForYear(fallbackYear);
        newEntry.status = 'upcoming';
        cloned.schedules.push(newEntry);
        nextActive = newEntry;
    }

    cloned.activeYear = nextActive.year;

    const changed =
        cloned.activeYear !== previousYear ||
        JSON.stringify(cloned.schedules) !== JSON.stringify(data.schedules);

    if (changed) {
        cloned.lastChecked = now.toISOString();
    }

    return {
        updatedData: cloned,
        changed,
        previousYear,
        activeYear: cloned.activeYear
    };
}

// CLI execution
const isMain = process.argv[1] && resolve(process.argv[1]) === __filename;
if (isMain) {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const simIdx = args.indexOf('--simulate-date');
    const referenceDate = (simIdx !== -1 && args[simIdx + 1])
        ? new Date(args[simIdx + 1])
        : new Date();

    if (Number.isNaN(referenceDate.getTime())) {
        console.error('Invalid date passed to --simulate-date');
        process.exit(1);
    }

    const raw = readFileSync(SCHEDULE_PATH, 'utf8');
    const currentData = JSON.parse(raw);
    const { updatedData, changed, previousYear, activeYear } = reconcileExamSchedule(currentData, referenceDate);

    if (changed) {
        if (!dryRun) {
            writeFileSync(SCHEDULE_PATH, JSON.stringify(updatedData, null, 2) + '\n', 'utf8');
        }
        console.log(`[THPTQG Rollover] Updated active exam year: ${previousYear} -> ${activeYear} (dryRun=${dryRun})`);
    } else {
        console.log(`[THPTQG Rollover] Active exam year ${activeYear} is still current. No changes required.`);
    }
}
