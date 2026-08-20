/**
 * Escapes a single CSV field: wraps in quotes and doubles any internal
 * quotes if the value contains a comma, quote, or newline.
 */
function escapeCsvField(value) {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Builds a CSV string (with header row) from a list of populated
 * Registration documents. Kept dependency-free - CSV is a simple enough
 * format that pulling in a library for it would be overkill here.
 */
function buildAttendanceCsv(registrations, eventTitle) {
  const header = [
    'Student Name',
    'Student Email',
    'Registration ID',
    'Event',
    'Attendance Status',
    'Attendance Time',
  ];

  const rows = registrations.map((reg) => [
    reg.student?.name || '',
    reg.student?.email || '',
    reg.registrationId,
    eventTitle,
    reg.attendanceStatus === 'attended' ? 'Present' : 'Absent',
    reg.attendedAt ? new Date(reg.attendedAt).toISOString() : '',
  ]);

  const lines = [header, ...rows].map((row) => row.map(escapeCsvField).join(','));
  return lines.join('\n');
}

module.exports = { buildAttendanceCsv };
