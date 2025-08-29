import { useState } from "react";
import { type SignUpProps } from "../App";
import { api } from "../utils/api";
import { API_BASE } from "../App";
import {
  validateAge,
  validateEmail,
  validateName,
  validateOTP,
} from "../utils/validate";

export function SignUp({ onAuth, onSwitchToSignIn }: SignUpProps) {
  const [signupFormData, setSignupFormData] = useState({
    name: "",
    dob: "",
    email: "",
  });
  const [signupOtp, setSignupOtp] = useState("");
  const [signupStep, setSignupStep] = useState<"form" | "otp">("form");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const validateFormStep = () => {
    const errors: { [key: string]: string } = {};

    if (!signupFormData.name.trim()) {
      errors.name = "Name is required";
    } else if (!validateName(signupFormData.name)) {
      errors.name =
        "Name must be at least 2 characters and contain only letters";
    }

    if (!signupFormData.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(signupFormData.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!signupFormData.dob) {
      errors.dob = "Date of birth is required";
    } else if (!validateAge(signupFormData.dob)) {
      errors.dob = "You must be at least 13 years old to sign up";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateOtpStep = () => {
    const errors: { [key: string]: string } = {};

    if (!signupOtp.trim()) {
      errors.otp = "OTP is required";
    } else if (!validateOTP(signupOtp.trim())) {
      errors.otp = "OTP must be exactly 6 digits";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendSignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFormStep()) {
      return;
    }

    setSignupLoading(true);
    setSignupError("");

    try {
      await api.signupWithOTP({
        ...signupFormData,
        name: signupFormData.name.trim(),
        email: signupFormData.email.trim().toLowerCase(),
      });
      setSignupStep("otp");
      setSignupOtp("");
    } catch (error: any) {
      setSignupError(error.message || "Failed to send OTP");
    } finally {
      setSignupLoading(false);
    }
  };

  const handleVerifySignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateOtpStep()) {
      return;
    }

    setSignupLoading(true);
    setSignupError("");

    try {
      const response = await api.verifySignupOTP({
        ...signupFormData,
        name: signupFormData.name.trim(),
        email: signupFormData.email.trim().toLowerCase(),
        otp: signupOtp.trim(),
      });
      onAuth(response.user, response.accessToken);
    } catch (error: any) {
      setSignupError(error.message || "Invalid OTP");
    } finally {
      setSignupLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  const handleResendOTP = async () => {
    setSignupLoading(true);
    setSignupError("");
    try {
      await api.signupWithOTP({
        ...signupFormData,
        name: signupFormData.name.trim(),
        email: signupFormData.email.trim().toLowerCase(),
      });
      setSignupError("");
    } catch (error: any) {
      setSignupError(error.message || "Failed to resend OTP");
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-2">Sign up</h2>
      <p className="text-gray-600 mb-8">Sign up to enjoy the feature of HD</p>

      {signupError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {signupError}
        </div>
      )}

      {signupStep === "form" ? (
        <form onSubmit={handleSendSignupOtp} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={signupFormData.name}
              onChange={(e) => {
                setSignupFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }));
                if (validationErrors.name) {
                  setValidationErrors((prev) => ({ ...prev, name: "" }));
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                validationErrors.name
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Enter your full name"
              required
            />
            {validationErrors.name && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth *
            </label>
            <input
              type="date"
              value={signupFormData.dob}
              onChange={(e) => {
                setSignupFormData((prev) => ({ ...prev, dob: e.target.value }));
                if (validationErrors.dob) {
                  setValidationErrors((prev) => ({ ...prev, dob: "" }));
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                validationErrors.dob
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              max={new Date().toISOString().split("T")[0]}
              required
            />
            {validationErrors.dob && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.dob}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={signupFormData.email}
              onChange={(e) => {
                setSignupFormData((prev) => ({
                  ...prev,
                  email: e.target.value,
                }));
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
            disabled={signupLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {signupLoading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Verify your account</p>
              <p className="mb-2">
                Name: <span className="font-medium">{signupFormData.name}</span>
              </p>
              <p className="mb-2">
                Date of Birth:{" "}
                <span className="font-medium">{signupFormData.dob}</span>
              </p>
              <p>
                Email:{" "}
                <span className="font-medium">{signupFormData.email}</span>
              </p>
            </div>
            <button
              onClick={() => {
                setSignupStep("form");
                setSignupOtp("");
                setValidationErrors({});
              }}
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              Edit Details
            </button>
          </div>

          <form onSubmit={handleVerifySignupOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OTP Code *
              </label>
              <input
                type="text"
                value={signupOtp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setSignupOtp(value);
                  if (validationErrors.otp) {
                    setValidationErrors((prev) => ({ ...prev, otp: "" }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  validationErrors.otp
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
              />
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
                disabled={signupLoading}
                className="text-blue-600 text-sm hover:underline disabled:opacity-50"
              >
                Resend OTP
              </button>
            </div>

            <button
              type="submit"
              disabled={signupLoading || signupOtp.length !== 6}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {signupLoading ? "Verifying..." : "Verify & Sign Up"}
            </button>
          </form>
        </div>
      )}

      {signupStep === "form" && (
        <>
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{" "}
            </span>
            <button
              onClick={onSwitchToSignIn}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Sign In
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
              onClick={handleGoogleSignUp}
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
      )}
    </>
  );
}
