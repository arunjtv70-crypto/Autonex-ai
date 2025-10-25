import React from 'react';

const BrainIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v0A2.5 2.5 0 0 1 9.5 7v0A2.5 2.5 0 0 1 7 9.5v0A2.5 2.5 0 0 1 4.5 12v0A2.5 2.5 0 0 1 2 14.5v0A2.5 2.5 0 0 1 4.5 17v0A2.5 2.5 0 0 1 7 19.5v0A2.5 2.5 0 0 1 9.5 22v0" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v0A2.5 2.5 0 0 0 14.5 7v0A2.5 2.5 0 0 0 17 9.5v0A2.5 2.5 0 0 0 19.5 12v0A2.5 2.5 0 0 0 22 14.5v0A2.5 2.5 0 0 0 19.5 17v0A2.5 2.5 0 0 0 17 19.5v0A2.5 2.5 0 0 0 14.5 22v0" />
    <path d="M12 4.5a2.5 2.5 0 0 0 2.5 2.5v0a2.5 2.5 0 0 0-5 0v0A2.5 2.5 0 0 0 12 4.5Z" />
    <path d="M12 12v0a2.5 2.5 0 0 1-2.5 2.5v0A2.5 2.5 0 0 1 7 12v0" />
    <path d="M12 12v0a2.5 2.5 0 0 0 2.5 2.5v0A2.5 2.5 0 0 0 17 12v0" />
  </svg>
);

export default BrainIcon;