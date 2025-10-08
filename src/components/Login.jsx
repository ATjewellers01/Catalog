import { useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";


const Login = () => {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ id: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(credentials.id, credentials.password);

    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <div className="flex justify-center items-center px-4 min-h-screen bg-gradient-to-tr from-amber-600 via-gray-900 to-black sm:px-6 lg:px-8">
        <div className="p-4 w-full max-w-md rounded-3xl border shadow-2xl backdrop-blur-xl bg-white/10 border-white/20 sm:p-6 lg:p-8 animate-fade-in hover-lift">
        {/* Logo / Branding */}
        <div className="mb-4 text-center sm:mb-6 lg:mb-8">
          <div className="flex justify-center items-center mx-auto w-12 h-12 bg-amber-500 rounded-full shadow-lg sm:w-16 sm:h-16">
            AT
          </div>
          <h1 className="text-lg font-bold text-gray-100 sm:text-xl lg:text-2xl">
            At plus jewellers
          </h1>
          <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl lg:text-3xl">
            Catalog
          </h2>
          <p className="mt-1 text-sm text-gray-400 sm:text-base">
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {error && (
            <div className="p-3 text-sm text-center text-red-400 rounded-lg border bg-red-500/10 border-red-500/30">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="id"
              className="block mb-1 text-sm font-medium text-white"
            >
              User ID
            </label>
            <input
              type="text"
              id="id"
              name="id"
              value={credentials.id}
              onChange={handleChange}
              required
              placeholder="Enter your user ID"
              className="px-4 py-3 w-full placeholder-gray-400 text-white rounded-lg border bg-white/5 border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-1 text-sm font-medium text-white"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="px-4 py-3 pr-12 w-full placeholder-gray-400 text-white rounded-lg border bg-white/5 border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 text-gray-400 -translate-y-1/2 hover:text-white focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex justify-center items-center py-3 space-x-2 w-full font-semibold text-white bg-amber-500 rounded-lg transition-all duration-200 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg
                  className="w-5 h-5 text-white animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <LogIn size={20} />
                <span>Login</span>
              </>
            )}
          </button>
        </form>

     
     
        </div>
      </div>
      
    </>
  );
};

export default Login;
