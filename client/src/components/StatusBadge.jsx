import React from 'react';

const CONFIG = {
  registered: { label: 'Registered', className: 'badge-registered' },
  attended: { label: 'Attended \u2713', className: 'badge-attended' },
  cancelled: { label: 'Cancelled', className: 'badge-cancelled' },
};

/**
 * Renders the combined display status for a registration. Takes the two
 * separate backend fields (registrationStatus, attendanceStatus) and maps
 * them to the single "Registered / Attended / Cancelled" label the UI
 * shows - this mapping lives here, once, rather than being duplicated
 * across every page that displays a registration.
 */
export default function StatusBadge({ registrationStatus, attendanceStatus }) {
  let key = 'registered';
  if (registrationStatus === 'cancelled') key = 'cancelled';
  else if (attendanceStatus === 'attended') key = 'attended';

  const { label, className } = CONFIG[key];
  return <span className={`badge ${className}`}>{label}</span>;
}
