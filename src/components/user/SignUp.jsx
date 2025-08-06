import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { registerUser } from "../../services/authService";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../context/auth/authContext";
import { useTheme } from "../../context/themeContext.js";
import { useMemo } from "react";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  process.env.REACT_APP_GOOGLE_CLIENT_ID;

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    phone: "",
    gender: "",
    firstName: "",
    lastName: "",
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
    const newErrors = {
      username: "",
      email: "",
      password: "",
      password2: "",
      phone: "",
      gender: "",
      firstName: "",
      lastName: "",
      general: "",
    };
    let isValid = true;

    // Username validation
    if (!username.trim()) {
      newErrors.username = "Tên đăng nhập không được để trống.";
      isValid = false;
    } else if (username.length < 3) {
      newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự.";
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email không được để trống.";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Email không hợp lệ.";
      isValid = false;
    }

    // Phone validation - Vietnamese phone numbers
    const phoneRegex = /^(\+84|84|0)[3-9][0-9]{8}$/;
    if (!phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống.";
      isValid = false;
    } else if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ (VD: 0912345678).";
      isValid = false;
    }

    // Gender validation
    if (!gender) {
      newErrors.gender = "Vui lòng chọn giới tính.";
      isValid = false;
    }

    // First name validation
    if (!firstName.trim()) {
      newErrors.firstName = "Tên không được để trống.";
      isValid = false;
    }

    // Last name validation
    if (!lastName.trim()) {
      newErrors.lastName = "Họ không được để trống.";
      isValid = false;
    }

    // Password validation - stronger validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!password) {
      newErrors.password = "Mật khẩu không được để trống.";
      isValid = false;
    } else if (!passwordRegex.test(password)) {
      newErrors.password =
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ và số.";
      isValid = false;
    }

    // Confirm password validation
    if (!password2) {
      newErrors.password2 = "Xác nhận mật khẩu không được để trống.";
      isValid = false;
    } else if (password !== password2) {
      newErrors.password2 = "Mật khẩu xác nhận không khớp.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Reset errors
    setErrors({
      username: "",
      email: "",
      password: "",
      password2: "",
      phone: "",
      gender: "",
      firstName: "",
      lastName: "",
      general: "",
    });

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = {
        username: username.trim(),
        email: email.trim(),
        password,
        password2,
        phone: phone.trim(),
        gender,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      };

      const res = await registerUser(formData);

      // Kiểm tra phản hồi từ server
      if (res && res.data) {
        const { access, refresh, user: userData } = res.data;

        if (access && refresh) {
          // Lưu token và set user như Login
          saveTokens({ access, refresh });

          // Giải mã token
          const decodedToken = jwtDecode(access);

          if (!decodedToken.user_id) {
            throw new Error("Token JWT không hợp lệ: thiếu user_id");
          }

          // Lấy role từ userData hoặc decodedToken
          const role = userData?.role || decodedToken.role || "user";

          // Tạo đối tượng user
          const user = {
            id: decodedToken.user_id,
            username: userData?.username || username,
            first_name: userData?.first_name || firstName,
            last_name: userData?.last_name || lastName,
            role: role,
            avatar: userData?.image || "https://via.placeholder.com/30",
            email: userData?.email || email,
          };

          setUser(user);
          localStorage.setItem("user", JSON.stringify(user));

          // Điều hướng dựa trên vai trò
          navigate(role === "admin" ? "/admin" : "/", { replace: true });
        } else {
          // Nếu không có token, chuyển đến trang login với thông báo thành công
          navigate("/login", {
            state: {
              message: "Đăng ký thành công! Vui lòng đăng nhập.",
            },
          });
        }
      } else {
        // Fallback: chuyển đến login nếu response không như mong đợi
        navigate("/login", {
          state: {
            message: "Đăng ký thành công! Vui lòng đăng nhập.",
          },
        });
      }
    } catch (err) {
      console.error("Registration error:", err);

      const newErrors = {
        username: "",
        email: "",
        password: "",
        password2: "",
        phone: "",
        gender: "",
        firstName: "",
        lastName: "",
        general: "",
      };

      if (err.response?.data) {
        // Handle specific field errors từ server
        Object.entries(err.response.data).forEach(([key, value]) => {
          const errorMessage = Array.isArray(value) ? value.join(" ") : value;

          // Map các field name từ API về field name trong form
          const fieldMap = {
            first_name: "firstName",
            last_name: "lastName",
          };

          const errorKey = fieldMap[key] || key;

          if (errorKey in newErrors) {
            newErrors[errorKey] = errorMessage;
          } else {
            // Nếu không map được field, hiển thị lỗi general
            newErrors.general = errorMessage || "Đăng ký thất bại.";
          }
        });

        // Nếu không có lỗi general và có lỗi khác
        if (!newErrors.general && Object.keys(err.response.data).length > 0) {
          newErrors.general = "Vui lòng kiểm tra các trường nhập liệu.";
        }
      } else {
        newErrors.general =
          err.message || "Đăng ký thất bại. Vui lòng thử lại sau.";
      }

      setErrors(newErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = () => {
    if (window.googleSignUpInProgress || isGoogleSubmitting) return;

    if (!GOOGLE_CLIENT_ID) {
      setErrors((prev) => ({
        ...prev,
        general: "Cấu hình Google Client ID không hợp lệ.",
      }));
      return;
    }

    setIsGoogleSubmitting(true);
    window.googleSignUpInProgress = true;

    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = "email profile";
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(
      scope
    )}&prompt=select_account`;

    window.location.href = url;

    setTimeout(() => {
      window.googleSignUpInProgress = false;
      setIsGoogleSubmitting(false);
    }, 2000);
  };

  // Dynamic styles using theme context
  const themeStyles = useMemo(() => {
    return {
      backgroundStyle: {
        background: `linear-gradient(to bottom, ${theme.colors.rgb.cardGradient.normal})`,
      },

      cardStyle: {
        background: `linear-gradient(135deg, ${theme.colors.rgb.cardGradient.hover})`,
        backdropFilter: "blur(20px)",
        border: `1px solid rgb(255, 255, 255, 0.1)`,
        boxShadow: `0 25px 45px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)`,
      },

      inputStyle: {
        background: `rgba(255, 255, 255, 0.05)`,
        border: `1px solid rgba(255, 255, 255, 0.1)`,
        backdropFilter: "blur(10px)",
        color: "white",
      },

      inputFocusStyle: {
        borderColor: `rgb(${theme.colors.rgb.buttonGradient.hover
          .split(",")[0]
          .replace("rgb(", "")
          .replace(")", "")})`,
        boxShadow: `0 0 0 3px rgba(${theme.colors.rgb.buttonGradient.hover
          .split(",")[0]
          .replace("rgb(", "")
          .replace(")", "")}, 0.1)`,
      },

      primaryButtonStyle: {
        background: `linear-gradient(135deg, ${theme.colors.rgb.buttonGradient.normal})`,
        boxShadow: `0 8px 25px rgba(0, 0, 0, 0.3)`,
      },

      primaryButtonHoverStyle: {
        background: `linear-gradient(135deg, ${theme.colors.rgb.buttonGradient.hover})`,
        transform: "translateY(-2px)",
        boxShadow: `0 12px 35px rgba(0, 0, 0, 0.4)`,
      },

      googleButtonStyle: {
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
      },

      googleButtonHoverStyle: {
        background: "rgba(255, 255, 255, 0.1)",
        borderColor: `rgb(${theme.colors.rgb.buttonGradient.normal
          .split(",")[0]
          .replace("rgb(", "")
          .replace(")", "")})`,
      },

      errorStyle: {
        background: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        backdropFilter: "blur(10px)",
        color: "rgb(252, 165, 165)",
      },

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
          className="text-3xl font-bold mb-8 text-center drop-shadow-lg"
          style={themeStyles.titleStyle}
        >
          Đăng ký UIAMusic
        </h1>

        {errors.general && (
          <div
            className="text-center mb-4 px-4 py-2 rounded-md"
            style={themeStyles.errorStyle}
          >
            {errors.general}
          </div>
        )}

        <div className="space-y-3 mb-6">
          <button
            onClick={handleGoogleSignUp}
            disabled={isGoogleSubmitting}
            className={`w-[330px] flex items-center justify-left gap-2 rounded-full py-2 px-8 font-medium transition-all duration-300 hover:scale-105 text-white ${
              isGoogleSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={themeStyles.googleButtonStyle}
            onMouseEnter={(e) => {
              if (!isGoogleSubmitting) {
                Object.assign(
                  e.target.style,
                  themeStyles.googleButtonHoverStyle
                );
              }
            }}
            onMouseLeave={(e) => {
              if (!isGoogleSubmitting) {
                Object.assign(e.target.style, themeStyles.googleButtonStyle);
              }
            }}
          >
            <img
              src="https://cdn.freebiesupply.com/logos/large/2x/google-icon-logo-png-transparent.png"
              alt="Google"
              className="mr-6 w-6 h-6"
            />
            {isGoogleSubmitting ? "Đang xử lý..." : "Đăng ký bằng Google"}
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

        <form
          className="space-y-4 w-full max-w-[330px]"
          onSubmit={handleSignUp}
        >
          {/* Username */}
          <div>
            <label className="block text-white/90 font-medium mb-2">
              Tên đăng nhập <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full p-3 rounded-lg ${
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
              <div className="text-red-400 text-sm mt-1">{errors.username}</div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-white/90 font-medium mb-2">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 rounded-lg ${
                errors.email ? "border-red-400" : ""
              } focus:outline-none transition-all duration-300 placeholder-white/50`}
              style={themeStyles.inputStyle}
              onFocus={(e) => {
                if (!errors.email) {
                  Object.assign(e.target.style, {
                    ...themeStyles.inputStyle,
                    ...themeStyles.inputFocusStyle,
                  });
                }
              }}
              onBlur={(e) => {
                Object.assign(e.target.style, themeStyles.inputStyle);
              }}
              placeholder="Email"
              required
            />
            {errors.email && (
              <div className="text-red-400 text-sm mt-1">{errors.email}</div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-white/90 font-medium mb-2">
              Số điện thoại <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full p-3 rounded-lg ${
                errors.phone ? "border-red-400" : ""
              } focus:outline-none transition-all duration-300 placeholder-white/50`}
              style={themeStyles.inputStyle}
              onFocus={(e) => {
                if (!errors.phone) {
                  Object.assign(e.target.style, {
                    ...themeStyles.inputStyle,
                    ...themeStyles.inputFocusStyle,
                  });
                }
              }}
              onBlur={(e) => {
                Object.assign(e.target.style, themeStyles.inputStyle);
              }}
              placeholder="0912345678"
              required
            />
            {errors.phone && (
              <div className="text-red-400 text-sm mt-1">{errors.phone}</div>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-white/90 font-medium mb-2">
              Giới tính <span className="text-red-400">*</span>
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={`w-full p-3 rounded-lg ${
                errors.gender ? "border-red-400" : ""
              } focus:outline-none transition-all duration-300`}
              style={{
                ...themeStyles.inputStyle,
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                backgroundSize: "16px",
                paddingRight: "40px",
                appearance: "none",
              }}
              required
            >
              <option
                value=""
                style={{ background: "#242424", color: "white" }}
              >
                Chọn giới tính
              </option>
              <option
                value="0"
                style={{ background: "#242424", color: "white" }}
              >
                Nam
              </option>
              <option
                value="1"
                style={{ background: "#242424", color: "white" }}
              >
                Nữ
              </option>
              <option
                value="2"
                style={{ background: "#242424", color: "white" }}
              >
                Khác
              </option>
            </select>
            {errors.gender && (
              <div className="text-red-400 text-sm mt-1">{errors.gender}</div>
            )}
          </div>

          {/* First Name and Last Name Row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-white/90 font-medium mb-2">
                Tên <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`w-full p-3 rounded-lg ${
                  errors.firstName ? "border-red-400" : ""
                } focus:outline-none transition-all duration-300 placeholder-white/50`}
                style={themeStyles.inputStyle}
                onFocus={(e) => {
                  if (!errors.firstName) {
                    Object.assign(e.target.style, {
                      ...themeStyles.inputStyle,
                      ...themeStyles.inputFocusStyle,
                    });
                  }
                }}
                onBlur={(e) => {
                  Object.assign(e.target.style, themeStyles.inputStyle);
                }}
                placeholder="Tên"
                required
              />
              {errors.firstName && (
                <div className="text-red-400 text-sm mt-1">
                  {errors.firstName}
                </div>
              )}
            </div>

            <div className="flex-1">
              <label className="block text-white/90 font-medium mb-2">
                Họ <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`w-full p-3 rounded-lg ${
                  errors.lastName ? "border-red-400" : ""
                } focus:outline-none transition-all duration-300 placeholder-white/50`}
                style={themeStyles.inputStyle}
                onFocus={(e) => {
                  if (!errors.lastName) {
                    Object.assign(e.target.style, {
                      ...themeStyles.inputStyle,
                      ...themeStyles.inputFocusStyle,
                    });
                  }
                }}
                onBlur={(e) => {
                  Object.assign(e.target.style, themeStyles.inputStyle);
                }}
                placeholder="Họ"
                required
              />
              {errors.lastName && (
                <div className="text-red-400 text-sm mt-1">
                  {errors.lastName}
                </div>
              )}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-white/90 font-medium mb-2">
              Mật khẩu <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-3 rounded-lg ${
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
              placeholder="Ít nhất 8 ký tự, có chữ và số"
              required
            />
            {errors.password && (
              <div className="text-red-400 text-sm mt-1">{errors.password}</div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-white/90 font-medium mb-2">
              Xác nhận mật khẩu <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className={`w-full p-3 rounded-lg ${
                errors.password2 ? "border-red-400" : ""
              } focus:outline-none transition-all duration-300 placeholder-white/50`}
              style={themeStyles.inputStyle}
              onFocus={(e) => {
                if (!errors.password2) {
                  Object.assign(e.target.style, {
                    ...themeStyles.inputStyle,
                    ...themeStyles.inputFocusStyle,
                  });
                }
              }}
              onBlur={(e) => {
                Object.assign(e.target.style, themeStyles.inputStyle);
              }}
              placeholder="Nhập lại mật khẩu"
              required
            />
            {errors.password2 && (
              <div className="text-red-400 text-sm mt-1">
                {errors.password2}
              </div>
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
                Object.assign(
                  e.target.style,
                  themeStyles.primaryButtonHoverStyle
                );
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
              "Đăng ký"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-white/70">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-white hover:underline font-medium transition-colors duration-300"
              style={{
                color: `rgb(${theme.colors.rgb.buttonGradient.normal
                  .split(",")[1]
                  .replace("rgb(", "")
                  .replace(")", "")
                  .trim()})`,
              }}
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
