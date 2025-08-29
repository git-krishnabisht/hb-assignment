import { useState } from "react";
import { api } from "../utils/api";
import { EyeIcon } from "./Icons";
import { validateEmail, validateOTP } from "../utils/validate";
import { API_BASE } from "../App";
import { type User } from "../interface/User";

interface SignInProps {
  onAuth: (user: User, token: string) => void;
  onSwitchToSignUp?: () => void;
}

export function SignIn({ onAuth, onSwitchToSignUp }: SignInProps) {
  const [userEmail, setUserEmail] = useState("");
  const [userOtp, setUserOtp] = useState("");
  const [currentStep, setCurrentStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showOtpPassword, setShowOtpPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const validateEmailStep = () => {
    const errors: { [key: string]: string } = {};

    if (!userEmail.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(userEmail.trim())) {
      errors.email = "Please enter a valid email address";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateOtpStep = () => {
    const errors: { [key: string]: string } = {};

    if (!userOtp.trim()) {
      errors.otp = "OTP is required";
    } else if (!validateOTP(userOtp.trim())) {
      errors.otp = "OTP must be exactly 6 digits";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmailStep()) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      await api.signinWithOTP(userEmail.trim().toLowerCase());
      setCurrentStep("otp");
      setUserOtp("");
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateOtpStep()) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await api.verifySigninOTP({
        email: userEmail.trim().toLowerCase(),
        otp: userOtp.trim(),
      });
      onAuth(response.user, response.accessToken);
    } catch (error: any) {
      setErrorMessage(error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      await api.signinWithOTP(userEmail.trim().toLowerCase());
      setErrorMessage("");
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-2">Sign In</h2>
      <p className="text-gray-600 mb-8">
        Please login to continue to your account.
      </p>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      {currentStep === "email" ? (
        <form onSubmit={handleSendOtp} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => {
                setUserEmail(e.target.value);
                if (validationErrors.email) {
                  setValidationErrors((prev) => ({ ...prev, email: "" }));
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                validationErrors.email
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Enter your email"
              required
            />
            {validationErrors.email && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.email}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OTP Code *
            </label>
            <div className="relative">
              <input
                type={showOtpPassword ? "text" : "password"}
                value={userOtp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setUserOtp(value);
                  if (validationErrors.otp) {
                    setValidationErrors((prev) => ({ ...prev, otp: "" }));
                  }
                }}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 ${
                  validationErrors.otp
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowOtpPassword(!showOtpPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <EyeIcon isVisible={showOtpPassword} />
              </button>
            </div>
            {validationErrors.otp && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.otp}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading}
              className="text-blue-600 text-sm hover:underline disabled:opacity-50"
            >
              Resend OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentStep("email");
                setUserOtp("");
                setValidationErrors({});
              }}
              className="text-gray-600 text-sm hover:underline"
            >
              Change Email
            </button>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading || userOtp.length !== 6}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? "Verifying..." : "Sign In"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 text-center">
        <span className="text-sm text-gray-600">Need an account? </span>
        <button
          onClick={onSwitchToSignUp}
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          Create one
        </button>
      </div>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="mt-4 w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2 font-medium transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285f4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34a853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#fbbc05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#ea4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Google</span>
        </button>
      </div>
    </>
  );
}
