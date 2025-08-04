import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { registerUser } from "../../services/authService";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../context/auth/authContext";
import { useTheme } from "../../context/themeContext.js";

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

    if (!username.trim()) {
      newErrors.username = "Tên đăng nhập không được để trống.";
      isValid = false;
    } else if (username.length < 3) {
      newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự.";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = "Email không được để trống.";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Email không hợp lệ.";
      isValid = false;
    }

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phone) {
      newErrors.phone = "Số điện thoại không được để trống.";
      isValid = false;
    } else if (!phoneRegex.test(phone)) {
      newErrors.phone =
        "Số điện thoại không hợp lệ (chỉ chứa số, 10-15 ký tự).";
      isValid = false;
    }

    if (!gender) {
      newErrors.gender = "Vui lòng chọn giới tính.";
      isValid = false;
    }

    if (!firstName.trim()) {
      newErrors.firstName = "Tên không được để trống.";
      isValid = false;
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Họ không được để trống.";
      isValid = false;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!password) {
      newErrors.password = "Mật khẩu không được để trống.";
      isValid = false;
    } else if (!passwordRegex.test(password)) {
      newErrors.password =
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ và số.";
      isValid = false;
    }

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
        username,
        email,
        password,
        password2,
        phone,
        gender,
        first_name: firstName,
        last_name: lastName,
      };

      const res = await registerUser(formData);
      const { access, refresh, user: userData } = res.data;

      // Lưu token
      saveTokens({ access, refresh });

      // Giải mã token
      const decodedToken = jwtDecode(access);

      if (!decodedToken.user_id) {
        throw new Error("Token JWT không hợp lệ: thiếu user_id");
      }

      // Lấy role từ userData hoặc decodedToken
      const role = userData.role || decodedToken.role || "user";

      // Tạo đối tượng user
      const user = {
        id: decodedToken.user_id,
        username: userData.username || username,
        first_name: userData.first_name || firstName,
        last_name: userData.last_name || lastName,
        role: role,
        avatar: userData.image || "https://via.placeholder.com/30",
        email: userData.email || email,
      };

      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));

      // Điều hướng dựa trên vai trò
      navigate(role === "admin" ? "/admin" : "/", { replace: true });
    } catch (err) {
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
        Object.entries(err.response.data).forEach(([key, value]) => {
          const errorMessage = Array.isArray(value) ? value.join(" ") : value;
          const fieldMap = {
            first_name: "firstName",
            last_name: "lastName",
          };
          const errorKey = fieldMap[key] || key;
          if (errorKey in newErrors) {
            newErrors[errorKey] = errorMessage;
          } else {
            newErrors.general = errorMessage || "Đăng ký thất bại.";
          }
        });

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

  // Dynamic styles based on theme - same as Login
  const getThemeStyles = () => {
    switch (theme.id) {
      case "ocean":
        return {
          background: "bg-gradient-to-b from-teal-900 via-teal-800 to-teal-700",
          card: "bg-teal-900/40 border border-teal-700/30 shadow-2xl shadow-teal-500/20",
          input: "bg-teal-900/60 border border-teal-400/30 text-white placeholder-teal-300/70 focus:border-teal-300 focus:shadow-lg focus:shadow-teal-500/25",
          select: "bg-teal-900/60 border border-teal-400/30 text-white focus:border-teal-300 focus:shadow-lg focus:shadow-teal-500/25",
          button: "bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30",
          googleButton: "border-teal-400/50 hover:border-teal-300 hover:bg-teal-900/30 text-white backdrop-blur-sm",
          text: "text-teal-300",
          title: `bg-gradient-to-r ${theme.colors.gradient} text-transparent bg-clip-text`,
          errorBg: "bg-red-900/30 border border-red-400/30 text-red-300"
        };
      case "forest":
        return {
          background: "bg-gradient-to-b from-green-900 via-green-800 to-emerald-700",
          card: "bg-green-900/40 border border-amber-600/40 shadow-2xl shadow-amber-500/20",
          input: "bg-green-900/60 border border-amber-400/40 text-white placeholder-green-300/70 focus:border-amber-300 focus:shadow-lg focus:shadow-amber-500/30",
          select: "bg-green-900/60 border border-amber-400/40 text-white focus:border-amber-300 focus:shadow-lg focus:shadow-amber-500/30",
          button: "bg-gradient-to-r from-green-600 to-lime-500 hover:from-green-500 hover:to-lime-400 text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40",
          googleButton: "border-amber-400/50 hover:border-amber-300 hover:bg-green-900/30 text-white backdrop-blur-sm",
          text: "text-green-300",
          title: `bg-gradient-to-r ${theme.colors.gradient} text-transparent bg-clip-text`,
          errorBg: "bg-red-900/30 border border-red-400/30 text-red-300"
        };
      case "space":
        return {
          background: "bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-700",
          card: "bg-purple-900/40 border border-purple-700/30 shadow-2xl shadow-purple-500/20",
          input: "bg-purple-900/60 border border-purple-400/30 text-white placeholder-purple-300/70 focus:border-purple-300 focus:shadow-lg focus:shadow-purple-500/25",
          select: "bg-purple-900/60 border border-purple-400/30 text-white focus:border-purple-300 focus:shadow-lg focus:shadow-purple-500/25",
          button: "bg-gradient-to-r from-purple-600 to-violet-500 hover:from-indigo-600 hover:to-purple-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30",
          googleButton: "border-purple-400/50 hover:border-purple-300 hover:bg-purple-900/30 text-white backdrop-blur-sm",
          text: "text-purple-300",
          title: `bg-gradient-to-r ${theme.colors.gradient} text-transparent bg-clip-text`,
          errorBg: "bg-red-900/30 border border-red-400/30 text-red-300"
        };
      case "sunset":
        return {
          background: "bg-gradient-to-b from-orange-900 via-red-800 to-yellow-700",
          card: "bg-orange-900/40 border border-orange-700/30 shadow-2xl shadow-orange-500/20",
          input: "bg-orange-900/60 border border-orange-400/30 text-white placeholder-orange-300/70 focus:border-orange-300 focus:shadow-lg focus:shadow-orange-500/25",
          select: "bg-orange-900/60 border border-orange-400/30 text-white focus:border-orange-300 focus:shadow-lg focus:shadow-orange-500/25",
          button: "bg-gradient-to-r from-orange-600 to-amber-500 hover:from-red-500 hover:to-orange-400 text-white shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30",
          googleButton: "border-orange-400/50 hover:border-orange-300 hover:bg-orange-900/30 text-white backdrop-blur-sm",
          text: "text-orange-300",
          title: `bg-gradient-to-r ${theme.colors.gradient} text-transparent bg-clip-text`,
          errorBg: "bg-red-900/30 border border-red-400/30 text-red-300"
        };
      default:
        return {
          background: "bg-gradient-to-b from-teal-900 via-teal-800 to-teal-700",
          card: "bg-teal-900/40 border border-teal-700/30 shadow-2xl shadow-teal-500/20",
          input: "bg-teal-900/60 border border-teal-400/30 text-white placeholder-teal-300/70 focus:border-teal-300 focus:shadow-lg focus:shadow-teal-500/25",
          select: "bg-teal-900/60 border border-teal-400/30 text-white focus:border-teal-300 focus:shadow-lg focus:shadow-teal-500/25",
          button: "bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30",
          googleButton: "border-teal-400/50 hover:border-teal-300 hover:bg-teal-900/30 text-white backdrop-blur-sm",
          text: "text-teal-300",
          title: `bg-gradient-to-r ${theme.colors.gradient} text-transparent bg-clip-text`,
          errorBg: "bg-red-900/30 border border-red-400/30 text-red-300"
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div className={`flex flex-1 flex-col w-full overflow-x-hidden items-center min-h-screen pt-10 ${styles.background} relative`}>
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
              fontSize: '1.5rem',
              opacity: 0.6
            }}
          >
            {particle}
          </div>
        ))}
      </div>

      <div className={`${styles.card} w-full max-w-[734px] flex flex-col items-center justify-center rounded-lg px-10 py-10 backdrop-blur-lg relative z-10`}>
        {/* Logo */}
        <div className="mb-4">
          <img
            className="h-12 drop-shadow-lg"
            src="https://yzfbdwvbybecxhbitkmc.supabase.co/storage/v1/object/sign/image/78ed005b-b0aa-427b-bc0d-6f1efb29e653.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OTc4ZGU2My0wOWQzLTRhYmYtOWRjZC0wZjY0NTBlN2VlYmIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS83OGVkMDA1Yi1iMGFhLTQyN2ItYmMwZC02ZjFlZmIyOWU2NTMucG5nIiwiaWF0IjoxNzU0MTM1Mzk4LCJleHAiOjIwNjk0OTUzOTh9.MxsdoFIdkMKWNqhTMN5PTDT2k_K-ELn-q7OzxBEF9PM"
            alt="UIAMusic Logo"
          />
        </div>

        <h1 className={`text-3xl font-bold ${styles.title} mb-10 text-center drop-shadow-lg`}>
          Đăng ký UIAMusic
        </h1>

        {errors.general && (
          <div className={`${styles.errorBg} text-center mb-4 px-4 py-2 rounded-md backdrop-blur-sm`}>
            {errors.general}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleGoogleSignUp}
            disabled={isGoogleSubmitting}
            className={`w-[330px] flex items-center justify-left gap-2 ${styles.googleButton} rounded-full py-2 px-8 font-medium transition-all duration-300 hover:scale-105 ${
              isGoogleSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
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
            <span className={`px-4 bg-transparent ${styles.text}`}>hoặc</span>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSignUp}>
          <div className="flex flex-col gap-2 justify-center">
            <label className={`block ${styles.text} font-medium`}>Tên người dùng</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-[330px] p-3 rounded-[4px] ${styles.input} ${
                errors.username ? "border-red-400" : ""
              } focus:outline-none transition-all duration-300 backdrop-blur-sm`}
              placeholder="Tên người dùng"
              required
            />
            {errors.username && (
              <div className="text-red-400 text-sm">{errors.username}</div>
            )}

            <label className={`block ${styles.text} font-medium mt-3`}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-[330px] p-3 rounded-[4px] ${styles.input} ${
                errors.email ? "border-red-400" : ""
              } focus:outline-none transition-all duration-300 backdrop-blur-sm`}
              placeholder="Email"
              required
            />
            {errors.email && (
              <div className="text-red-400 text-sm">{errors.email}</div>
            )}

            <label className={`block ${styles.text} font-medium mt-3`}>Số điện thoại</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-[330px] p-3 rounded-[4px] ${styles.input} ${
                errors.phone ? "border-red-400" : ""
              } focus:outline-none transition-all duration-300 backdrop-blur-sm`}
              placeholder="Số điện thoại"
              required
            />
            {errors.phone && (
              <div className="text-red-400 text-sm">{errors.phone}</div>
            )}

            <label className={`block ${styles.text} font-medium mt-3`}>Giới tính</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={`w-[330px] p-3 rounded-[4px] ${styles.select} ${
                errors.gender ? "border-red-400" : ""
              } focus:outline-none transition-all duration-300 backdrop-blur-sm`}
              required
            >
              <option value="" disabled>
                Chọn giới tính
              </option>
              <option value="0">Nam</option>
              <option value="1">Nữ</option>
              <option value="2">Khác</option>
            </select>
            {errors.gender && (
              <div className="text-red-400 text-sm">{errors.gender}</div>
            )}

            <label className={`block ${styles.text} font-medium mt-3`}>Tên</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`w-[330px] p-3 rounded-[4px] ${styles.input} ${
                errors.firstName ? "border-red-400" : ""
              } focus:outline-none transition-all duration-300 backdrop-blur-sm`}
              placeholder="Tên"
              required
            />
            {errors.firstName && (
              <div className="text-red-400 text-sm">{errors.firstName}</div>
            )}

            <label className={`block ${styles.text} font-medium mt-3`}>Họ</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`w-[330px] p-3 rounded-[4px] ${styles.input} ${
                errors.lastName ? "border-red-400" : ""
              } focus:outline-none transition-all duration-300 backdrop-blur-sm`}
              placeholder="Họ"
              required
            />
            {errors.lastName && (
              <div className="text-red-400 text-sm">{errors.lastName}</div>
            )}

            <label className={`block ${styles.text} font-medium mt-3`}>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-[330px] p-3 rounded-[4px] ${styles.input} ${
                errors.password ? "border-red-400" : ""
              } focus:outline-none transition-all duration-300 backdrop-blur-sm`}
              placeholder="Mật khẩu"
              required
            />
            {errors.password && (
              <div className="text-red-400 text-sm">{errors.password}</div>
            )}

            <label className={`block ${styles.text} font-medium mt-3`}>Xác nhận mật khẩu</label>
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className={`w-[330px] p-3 rounded-[4px] ${styles.input} ${
                errors.password2 ? "border-red-400" : ""
              } focus:outline-none transition-all duration-300 backdrop-blur-sm`}
              placeholder="Xác nhận mật khẩu"
              required
            />
            {errors.password2 && (
              <div className="text-red-400 text-sm">{errors.password2}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${styles.button} ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:scale-105"
            } font-bold py-3 px-8 rounded-full transition-all duration-300 flex justify-center items-center mt-6`}
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
          <p className={`${styles.text}`}>
            Bạn đã có tài khoản?{" "}
            <Link to="/login" className="text-white hover:underline font-medium transition-colors duration-300">
              Đăng nhập UIAMusic
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;