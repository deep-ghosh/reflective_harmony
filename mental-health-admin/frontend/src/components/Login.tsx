import React, { useState } from 'react';
import { Shield, Lock, AlertTriangle, CheckCircle, Home, Eye, EyeOff } from 'lucide-react';

interface LoginFormState {
  email: string;
  password: string;
  remember: boolean;
}

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [loginForm, setLoginForm] = useState<LoginFormState>({
    email: '',
    password: '',
    remember: false
  });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError('');
    
    if (!loginForm.email || !loginForm.password) {
      setLoginError('Please enter email and password');
      return;
    }

    if (!loginForm.email.includes('@')) {
      setLoginError('Please enter a valid email address');
      return;
    }

    if (loginForm.password.length < 6) {
      setLoginError('Password must be at least 6 characters');
      return;
    }

    setLoginLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoginLoading(false);
      setShow2FAModal(true);
    }, 1500);
  };

  const handleVerify2FA = () => {
    if (twoFactorCode.length !== 6) {
      alert('❌ Please enter a 6-digit code');
      return;
    }

    if (!/^\d{6}$/.test(twoFactorCode)) {
      alert('❌ Please enter only numbers');
      return;
    }

    setShow2FAModal(false);
    setTwoFactorCode('');
    
    // Call the success callback
    onLoginSuccess();
    
    // Show success message
    setTimeout(() => {
      const auditRef = 'AUD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      alert(`✓ Login Successful!\n\n━━━━━━━━━━━━━━━━━━━━━━━━\nLOGIN DETAILS\n━━━━━━━━━━━━━━━━━━━━━━━━\n\nEmail: ${loginForm.email}\nRole: ActionAdmin\nAdmin ID: ADM-001\n\n━━━━━━━━━━━━━━━━━━━━━━━━\nAUDIT CONFIRMATION\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n✓ 2FA Verified\n✓ Audit log created: ${auditRef}\n✓ Session started\n✓ Timestamp: ${new Date().toLocaleString()}`);
    }, 300);
  };

  const handleForgotPassword = () => {
    if (!loginForm.email) {
      alert('❌ Please enter your email address first');
      return;
    }
    alert(`✓ Password reset link sent!\n\nCheck your email at ${loginForm.email} for instructions.\n\nLink expires in 24 hours.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-2xl mb-4">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Sign In</h1>
          <p className="text-lg text-gray-600 font-medium">National Student Wellbeing Portal</p>
          <p className="text-sm text-gray-500 mt-1">Ministry of Education • Govt. of India</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => {
                  setLoginForm({ ...loginForm, email: e.target.value });
                  setLoginError('');
                }}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium ${
                  loginError && !loginForm.email 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="admin@university.edu.in"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Use your government email ID</p>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={(e) => {
                    setLoginForm({ ...loginForm, password: e.target.value });
                    setLoginError('');
                  }}
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium ${
                    loginError && !loginForm.password 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={loginForm.remember}
                  onChange={(e) => setLoginForm({ ...loginForm, remember: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-gray-700 font-medium group-hover:text-gray-900">Remember me for 7 days</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{loginError}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loginLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {loginLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
              <button
                type="button"
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Back
              </button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-3 text-xs text-gray-600">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gray-900 mb-1">🔒 Security Notice</p>
                <ul className="space-y-1 text-gray-600">
                  <li>✓ This portal is only for authorized administrators</li>
                  <li>✓ 2FA (Two-Factor Authentication) required for all logins</li>
                  <li>✓ All actions are logged and audited</li>
                  <li>✓ Unauthorized access attempts will be reported</li>
                  <li>✓ Session expires after 1 hour of inactivity</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200 bg-blue-50 rounded-xl p-4">
            <p className="text-xs font-bold text-blue-900 mb-2">📝 Demo Credentials (for testing)</p>
            <div className="space-y-1 text-xs text-blue-800 font-mono">
              <div>Email: <span className="font-bold">demo@university.edu.in</span></div>
              <div>Password: <span className="font-bold">demo123</span></div>
              <div>2FA Code: <span className="font-bold">123456</span></div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-6 text-xs text-gray-600 space-y-2">
          <p>
            Need help? Contact:
            <a href="mailto:support@education.gov.in" className="text-blue-600 hover:text-blue-700 font-bold ml-1">
              support@education.gov.in
            </a>
          </p>
          <p className="text-gray-500">
            © 2025 Ministry of Education, Govt. of India. All rights reserved.
          </p>
        </div>
      </div>

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-200">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 mb-4 shadow-lg">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600">
                Enter the 6-digit code from your authenticator app or SMS
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Authentication Code
              </label>
              <input
                autoFocus
                type="text"
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-4 text-center text-3xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent tracking-widest font-mono"
                placeholder="••••••"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                {twoFactorCode.length}/6 digits entered
              </p>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-bold mb-1">✓ Secure Connection</p>
                  <p>Your authentication code is encrypted and secure.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { 
                  setShow2FAModal(false); 
                  setTwoFactorCode(''); 
                  setLoginLoading(false);
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify2FA}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-800 transition-all shadow-lg disabled:opacity-60"
                disabled={twoFactorCode.length !== 6}
              >
                Verify & Login
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Didn't receive a code?{' '}
              <button className="text-blue-600 hover:text-blue-700 font-bold">
                Resend
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
