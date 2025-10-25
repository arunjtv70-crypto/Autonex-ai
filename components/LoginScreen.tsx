
import React from 'react';
import LoginIcon from './icons/LoginIcon';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const isDark = document.body.classList.contains('dark');

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen">
      <div className="flex flex-col items-center text-center p-8 max-w-lg">
        <div className="w-20 h-20 mb-6">
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logo-gradient-login" x1="21" y1="3" x2="3" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6EE7B7" />
                <stop offset="1" stopColor="#10B981" />
              </linearGradient>
            </defs>
            <path d="M19.07,5.93 C17.2,4.06 14.68,3 12,3 C7.03,3 3,7.03 3,12 C3,16.97 7.03,21 12,21 C16.1,21 19.68,18.47 21,15" fill="none" stroke="url(#logo-gradient-login)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M17.2,10.2C16.2,9.4 14.2,9.2 12.5,9.8C10.8,10.4 9.8,12 10.4,13.6C11,15.2 13,16 14.5,15.2" fill={isDark ? "#374151" : "#E5E7EB"} />
            <path d="M16,7C14.5,6.5 12,7.5 11,9.5" stroke={isDark ? "white" : "#4B5563"} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-inherit">Welcome to Autonex AI</h1>
        <p className={`mt-2 text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Your advanced conversational and automation assistant.</p>
        <button
          onClick={onLogin}
          className="mt-8 flex items-center justify-center gap-3 px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
        >
          <LoginIcon className="w-5 h-5" />
          <span>Login to Continue</span>
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
