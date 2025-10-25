import React from 'react';

const VoiceAgentIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8.7a4 4 0 0 0-7.4 2.5c0 1.6.8 2.9 2.4 3.4" />
    <path d="M12 16v2a4 4 0 0 0 8 0V9a6 6 0 0 0-12 0v1" />
    <path d="M12 18h.01" />
    <path d="M7 18a5 5 0 0 0-5 5h14" />
  </svg>
);

export default VoiceAgentIcon;
