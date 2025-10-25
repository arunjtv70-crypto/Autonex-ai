import React from 'react';
import LoginIcon from './icons/LoginIcon';
import AutonexBrand from './AutonexBrand';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const isDark = document.body.classList.contains('dark');

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen">
      <div className="flex flex-col items-center text-center p-8 max-w-lg">
        <div className="mb-6">
          <AutonexBrand className="w-52 h-auto" isDark={isDark} />
        </div>
        <h1 className="text-4xl font-bold text-inherit">Welcome</h1>
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