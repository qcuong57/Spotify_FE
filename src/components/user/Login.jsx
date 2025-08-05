import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { login } from "../../services/authService";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../context/auth/authContext";
import { useTheme } from "../../context/themeContext.js";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    general: "",
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const { saveTokens, setUser } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    if (location.state?.error) {
      setErrors((prev) => ({ ...prev, general: location.state.error }));
    }
  }, [location]);

  const validateForm = () => {
    const newErrors = { username: "", password: "", general: "" };
    let isValid = true;

    if (!username.trim()) {
      newErrors.username = "Tên đăng nhập không được để trống.";
      isValid = false;
    } else if (username.length < 3) {
      newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự.";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Mật khẩu không được để trống.";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({ username: "", password: "", general: "" });

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login(username, password);
      const { access, refresh, user: userData } = res.data;

      // Lưu token
      saveTokens({ access, refresh });

      // Giải mã token để lấy user_id
      const decodedToken = jwtDecode(access);

      if (!decodedToken.user_id) {
        throw new Error("Token JWT không hợp lệ: thiếu user_id");
      }

      // Lấy role từ userData (trả về từ API) hoặc decodedToken
      const role = userData.role || decodedToken.role || "user";

      // Tạo object user để lưu vào context và localStorage
      const user = {
        id: decodedToken.user_id,
        username: userData.username || username,
        first_name: userData.first_name || username,
        last_name: userData.last_name || "",
        role: role,
        avatar: userData.image || "https://via.placeholder.com/30",
        email: userData.email || "",
      };

      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));

      // Điều hướng dựa trên vai trò
      navigate(role === "admin" ? "/admin" : "/", { replace: true });
    } catch (err) {
      const newErrors = { username: "", password: "", general: "" };

      if (err.response?.data?.detail) {
        newErrors.general =
          err.response.data.detail === "Invalid credentials" ||
          err.response.data.detail ===
            "No active account found with the given credentials"
            ? "Tên đăng nhập hoặc mật khẩu không đúng."
            : err.response.data.detail;
      } else {
        newErrors.general =
          err.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      }

      setErrors(newErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    if (window.googleLoginInProgress) return;
    window.googleLoginInProgress = true;
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = "email profile";
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(
      scope
    )}&prompt=select_account`;
    window.location.href = url;
    setTimeout(() => {
      window.googleLoginInProgress = false;
    }, 2000);
  };

  // Dynamic styles using theme context
  const themeStyles = useMemo(() => {
    return {
      // Background styles using theme colors
      backgroundStyle: {
        background: `linear-gradient(to bottom, ${theme.colors.rgb.cardGradient.normal})`,
      },
      
      // Card styles with theme integration
      cardStyle: {
        background: `linear-gradient(135deg, ${theme.colors.rgb.cardGradient.hover})`,
        backdropFilter: "blur(20px)",
        border: `1px solid rgb(255, 255, 255, 0.1)`,
        boxShadow: `0 25px 45px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)`,
      },

      // Input styles with theme colors
      inputStyle: {
        background: `rgba(255, 255, 255, 0.05)`,
        border: `1px solid rgba(255, 255, 255, 0.1)`,
        backdropFilter: "blur(10px)",
        color: "white",
      },

      inputFocusStyle: {
        borderColor: `rgb(${theme.colors.rgb.buttonGradient.hover.split(',')[0].replace('rgb(', '').replace(')', '')})`,
        boxShadow: `0 0 0 3px rgba(${theme.colors.rgb.buttonGradient.hover.split(',')[0].replace('rgb(', '').replace(')', '')}, 0.1)`,
      },

      // Button styles with theme gradients
      primaryButtonStyle: {
        background: `linear-gradient(135deg, ${theme.colors.rgb.buttonGradient.normal})`,
        boxShadow: `0 8px 25px rgba(0, 0, 0, 0.3)`,
      },

      primaryButtonHoverStyle: {
        background: `linear-gradient(135deg, ${theme.colors.rgb.buttonGradient.hover})`,
        transform: "translateY(-2px)",
        boxShadow: `0 12px 35px rgba(0, 0, 0, 0.4)`,
      },

      // Google button with theme integration
      googleButtonStyle: {
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
      },

      googleButtonHoverStyle: {
        background: "rgba(255, 255, 255, 0.1)",
        borderColor: `rgb(${theme.colors.rgb.buttonGradient.normal.split(',')[0].replace('rgb(', '').replace(')', '')})`,
      },

      // Error message styles
      errorStyle: {
        background: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        backdropFilter: "blur(10px)",
        color: "rgb(252, 165, 165)",
      },

      // Text colors based on theme
      titleStyle: {
        background: `linear-gradient(135deg, ${theme.colors.rgb.buttonGradient.normal})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      },
    };
  }, [theme]);

  return (
    <div 
      className="flex flex-1 flex-col w-full overflow-x-hidden items-center min-h-screen pt-10 relative"
      style={themeStyles.backgroundStyle}
    >
      {/* Background Image with Theme */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${theme.backgroundImage})` }}
      />

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {theme.particles?.map((particle, index) => (
          <div
            key={index}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              fontSize: "1.5rem",
              opacity: 0.6,
            }}
          >
            {particle}
          </div>
        ))}
      </div>

      <div
        className="w-full max-w-[734px] flex flex-col items-center justify-center rounded-2xl px-10 py-10 relative z-10"
        style={themeStyles.cardStyle}
      >
        {/* Logo */}
        <div className="mb-4">
          <img
            className="h-12 drop-shadow-lg"
            src="https://yzfbdwvbybecxhbitkmc.supabase.co/storage/v1/object/sign/image/78ed005b-b0aa-427b-bc0d-6f1efb29e653.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OTc4ZGU2My0wOWQzLTRhYmYtOWRjZC0wZjY0NTBlN2VlYmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS83OGVkMDA1Yi1iMGFhLTQyN2ItYmMwZC02ZjFlZmIyOWU2NTMucG5nIiwiaWF0IjoxNzU0MTM1Mzk4LCJleHAiOjIwNjk0OTUzOTh9.MxsdoFIdkMKWNqhTMN5PTDT2k_K-ELn-q7OzxBEF9PM"
            alt="UIAMusic Logo"
          />
        </div>

        <h1
          className="text-3xl font-bold mb-10 text-center drop-shadow-lg"
          style={themeStyles.titleStyle}
        >
          Đăng nhập vào UIAMusic
        </h1>

        {errors.general && (
          <div
            className="text-center mb-4 px-4 py-2 rounded-md"
            style={themeStyles.errorStyle}
          >
            {errors.general}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            className="w-[330px] flex items-center justify-left gap-2 rounded-full py-2 px-8 font-medium transition-all duration-300 hover:scale-105 text-white"
            style={themeStyles.googleButtonStyle}
            onMouseEnter={(e) => {
              Object.assign(e.target.style, themeStyles.googleButtonHoverStyle);
            }}
            onMouseLeave={(e) => {
              Object.assign(e.target.style, themeStyles.googleButtonStyle);
            }}
          >
            <img
              src="https://cdn.freebiesupply.com/logos/large/2x/google-icon-logo-png-transparent.png"
              alt="Google"
              className="mr-6 w-6 h-6"
            />
            Tiếp tục bằng Google
          </button>
        </div>

        <div className="my-4 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-transparent text-white/70">hoặc</span>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="flex flex-col gap-2 justify-center">
            <label className="block text-white/90 font-medium">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-[330px] p-3 rounded-lg ${
                errors.username ? "border-red-400" : ""
              } focus:outline-none transition-all duration-300 placeholder-white/50`}
              style={themeStyles.inputStyle}
              onFocus={(e) => {
                if (!errors.username) {
                  Object.assign(e.target.style, {
                    ...themeStyles.inputStyle,
                    ...themeStyles.inputFocusStyle,
                  });
                }
              }}
              onBlur={(e) => {
                Object.assign(e.target.style, themeStyles.inputStyle);
              }}
              placeholder="Tên đăng nhập"
              required
            />
            {errors.username && (
              <div className="text-red-400 text-sm">{errors.username}</div>
            )}

            <label className="block text-white/90 font-medium mt-4">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-[330px] p-3 rounded-lg ${
                errors.password ? "border-red-400" : ""
              } focus:outline-none transition-all duration-300 placeholder-white/50`}
              style={themeStyles.inputStyle}
              onFocus={(e) => {
                if (!errors.password) {
                  Object.assign(e.target.style, {
                    ...themeStyles.inputStyle,
                    ...themeStyles.inputFocusStyle,
                  });
                }
              }}
              onBlur={(e) => {
                Object.assign(e.target.style, themeStyles.inputStyle);
              }}
              placeholder="Mật khẩu"
              required
            />
            {errors.password && (
              <div className="text-red-400 text-sm">{errors.password}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:scale-105"
            } font-bold py-3 px-8 rounded-full transition-all duration-300 flex justify-center items-center mt-6 text-white`}
            style={themeStyles.primaryButtonStyle}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                Object.assign(e.target.style, themeStyles.primaryButtonHoverStyle);
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                Object.assign(e.target.style, themeStyles.primaryButtonStyle);
              }
            }}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Đang xử lý...
              </span>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-white/70">
            Bạn chưa có tài khoản?{" "}
            <Link
              to="/signup"
              className="text-white hover:underline font-medium transition-colors duration-300"
              style={{ 
                color: `rgb(${theme.colors.rgb.buttonGradient.normal.split(',')[1].replace('rgb(', '').replace(')', '').trim()})` 
              }}
            >
              Đăng ký UIAMusic
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;