import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/auth";
import { useTheme } from "../../contexts/theme";
import { ROLE_LABELS } from "../../utils/roles";
import ConfirmDialog from "./ConfirmDialog";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/knowledge-base", label: "Knowledge Base" },
  { to: "/error-codes", label: "Error Codes" },
  { to: "/forum", label: "Forum" },
  { to: "/reviews", label: "Reviews" },
];

const clientLinks = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/tickets", label: "Tickets" },
  { to: "/knowledge-base", label: "Knowledge Base" },
  { to: "/error-codes", label: "Error Codes" },
  { to: "/documents", label: "Documents" },
  { to: "/forum", label: "Forum" },
  { to: "/reviews", label: "Reviews" },
  { to: "/features", label: "Features" },
  { to: "/robots", label: "Robots" },
];

const staffLinks = publicLinks.concat({ to: "/features", label: "Features" });

export default function Header({ onOpenNavigation, showNavigation = false }) {
  const { isAuthenticated, logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  const showTopNavigation = !isAuthPage;
  const links = !isAuthenticated
    ? publicLinks
    : user?.role === "client"
      ? clientLinks
      : staffLinks;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("Signed out successfully");
      navigate("/login");
    } catch {
      toast.error("You were signed out locally");
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
      setIsUserMenuOpen(false);
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const isHomePage = location.pathname === "/";
  const isTransparent = !scrolled && isHomePage && !isAuthPage;

  const getTextColor = () => {
    if (isTransparent) return "#ffffff";
    if (isDark) return "#ffffff";
    return "#0f172a";
  };

  const getBackground = () => {
    if (isTransparent) return "transparent";
    if (isDark) return "#0a1628";
    return "#ffffff";
  };

  const getBorderColor = () => {
    if (isTransparent) return "none";
    if (isDark) return "1px solid #1a2d4a";
    return "1px solid #e2e8f0";
  };

  const getLinkColor = (isActive) => {
    if (isTransparent) {
      return isActive ? "#ffffff" : "#ffffff";
    }
    if (isDark) {
      return isActive ? "#60a5fa" : "#94a3b8";
    }
    return isActive ? "#2563eb" : "#64748b";
  };

  const getLinkBackground = (isActive) => {
    if (isActive) {
      if (isTransparent) return "rgba(255,255,255,0.15)";
      if (isDark) return "rgba(37, 99, 235, 0.2)";
      return "#eff6ff";
    }
    return "transparent";
  };

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          width: "100%",
          height: "64px",
          display: "flex",
          alignItems: "center",
          background: getBackground(),
          borderBottom: getBorderColor(),
          boxShadow: isTransparent ? "none" : "0 1px 2px rgba(0,0,0,0.05)",
          backdropFilter: isTransparent ? "blur(12px)" : "none",
          transition:
            "background 0.3s ease, backdrop-filter 0.3s ease, border-bottom 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            padding: "0 24px",
            width: "100%",
            maxWidth: "1280px",
            margin: "0 auto",
            color: getTextColor(),
          }}
        >
          {showNavigation && (
            <button
              type="button"
              onClick={onOpenNavigation}
              aria-label="Open workspace navigation"
              title="Open navigation"
              style={{
                background: isTransparent ? "rgba(255,255,255,0.15)" : "transparent",
                borderColor: isTransparent ? "rgba(255,255,255,0.3)" : "#e2e8f0",
                color: getTextColor(),
                width: "40px",
                height: "40px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                border: "1px solid",
                cursor: "pointer",
              }}
            >
              <Menu size={20} />
            </button>
          )}
          {showTopNavigation && !showNavigation && (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-label={
                isMobileMenuOpen ? "Close navigation" : "Open navigation"
              }
              aria-expanded={isMobileMenuOpen}
              style={{
                background: isTransparent ? "rgba(255,255,255,0.15)" : "transparent",
                borderColor: isTransparent ? "rgba(255,255,255,0.3)" : "#e2e8f0",
                color: getTextColor(),
                width: "40px",
                height: "40px",
                display: isMobile ? "inline-flex" : "none",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                border: "1px solid",
                cursor: "pointer",
              }}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}

          <NavLink
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              color: getTextColor(),
            }}
          >
            <span
              style={{
                width: "34px",
                height: "34px",
                display: "grid",
                placeItems: "center",
                borderRadius: "9px",
                background: "#2563eb",
                color: "#ffffff",
                fontWeight: 800,
              }}
            >
              K
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", width: "max-content"}}>
              <strong
                style={{
                  fontSize: "15px",
                  color: getTextColor(),
                }}
              >
                KIT
              </strong>
              <small
                style={{
                  fontSize: "11px",
                  color: isTransparent ? "rgba(255,255,255,0.7)" : isDark ? "rgba(255,255,255,0.7)" : "#64748b",
                }}
              >
                Support Hub
              </small>
            </span>
          </NavLink>

          {showTopNavigation && (
            <nav
              style={{
                display: isMobile ? "none" : "flex",
                alignItems: "center",
                gap: "4px",
                flex: "1 1 auto",
                justifyContent: "center",
              }}
            >
              {links.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    style={{
                      color: getLinkColor(isActive),
                      fontSize: "14px",
                      fontWeight: isActive ? 700 : 500,
                      padding: "6px 14px",
                      borderRadius: "8px",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease",
                      background: getLinkBackground(isActive),
                    }}
                    onMouseEnter={(e) => {
                      const isActiveLink = location.pathname === item.to;
                      if (!isActiveLink) {
                        e.currentTarget.style.color = isTransparent
                          ? "#ffffff"
                          : isDark
                          ? "#ffffff"
                          : "#2563eb";
                        e.currentTarget.style.background = isTransparent
                          ? "rgba(255,255,255,0.1)"
                          : isDark
                          ? "rgba(255,255,255,0.05)"
                          : "#f1f5f9";
                      }
                    }}
                    onMouseLeave={(e) => {
                      const isActiveLink = location.pathname === item.to;
                      if (!isActiveLink) {
                        e.currentTarget.style.color = getLinkColor(false);
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginLeft: "auto",
            }}
          >
            {!isAuthPage && (
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Use ${isDark ? "light" : "dark"} mode`}
                title={`Use ${isDark ? "light" : "dark"} mode`}
                style={{
                  background: isTransparent ? "rgba(255,255,255,0.15)" : "transparent",
                  borderColor: isTransparent ? "rgba(255,255,255,0.3)" : "#e2e8f0",
                  color: getTextColor(),
                  width: "40px",
                  height: "40px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  border: "1px solid",
                  cursor: "pointer",
                }}
              >
                {isDark ? <Sun size={19} /> : <Moon size={19} />}
              </button>
            )}
            {isAuthenticated ? (
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                  style={{
                    minHeight: "42px",
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    border: "0",
                    borderRadius: "8px",
                    padding: "4px 7px",
                    background: isTransparent ? "rgba(255,255,255,0.1)" : "transparent",
                    color: getTextColor(),
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      width: "34px",
                      height: "34px",
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "50%",
                      background: isTransparent ? "rgba(255,255,255,0.2)" : "#dbeafe",
                      color: isTransparent ? "#ffffff" : "#1d4ed8",
                      fontSize: "13px",
                      fontWeight: 800,
                    }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                  <span
                    style={{
                      minWidth: 0,
                      textAlign: "left",
                      display: "block",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        fontSize: "13px",
                        maxWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: getTextColor(),
                      }}
                    >
                      {user.name}
                    </strong>
                    <small
                      style={{
                        display: "block",
                        marginTop: "2px",
                        color: isTransparent ? "rgba(255,255,255,0.7)" : isDark ? "rgba(255,255,255,0.7)" : "#64748b",
                        fontSize: "11px",
                        textTransform: "capitalize",
                      }}
                    >
                      {ROLE_LABELS[user.role] || user.role}
                    </small>
                  </span>
                  <ChevronDown
                    size={15}
                    aria-hidden="true"
                    style={{ color: getTextColor() }}
                  />
                </button>
                {isUserMenuOpen && (
                  <div
                    style={{
                      position: "absolute",
                      zIndex: 80,
                      top: "calc(100% + 8px)",
                      right: 0,
                      width: "190px",
                      overflow: "hidden",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      background: "#ffffff",
                      boxShadow: "0 24px 60px rgba(15, 23, 42, 0.18)",
                    }}
                  >
                    <NavLink
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      style={{
                        width: "100%",
                        minHeight: "42px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        border: 0,
                        padding: "0 14px",
                        background: "transparent",
                        color: "#0f172a",
                        fontSize: "13px",
                        fontWeight: 600,
                        textAlign: "left",
                        textDecoration: "none",
                        cursor: "pointer",
                      }}
                    >
                      <UserRound size={16} />
                      Profile
                    </NavLink>
                    <NavLink
                      to="/notifications"
                      onClick={() => setIsUserMenuOpen(false)}
                      style={{
                        width: "100%",
                        minHeight: "42px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        border: 0,
                        padding: "0 14px",
                        background: "transparent",
                        color: "#0f172a",
                        fontSize: "13px",
                        fontWeight: 600,
                        textAlign: "left",
                        textDecoration: "none",
                        cursor: "pointer",
                      }}
                    >
                      <Bell size={16} />
                      Notifications
                    </NavLink>
                    <button
                      type="button"
                      onClick={() => setShowLogoutDialog(true)}
                      style={{
                        width: "100%",
                        minHeight: "42px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        border: 0,
                        padding: "0 14px",
                        background: "transparent",
                        color: "#0f172a",
                        fontSize: "13px",
                        fontWeight: 600,
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              !isAuthPage && (
                <>
                  <NavLink
                    to="/login"
                    style={{
                      minHeight: "40px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      border: isTransparent ? "1px solid rgba(255,255,255,0.3)" : "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "0 16px",
                      background: isTransparent ? "rgba(255,255,255,0.1)" : "#ffffff",
                      color: getTextColor(),
                      fontSize: "14px",
                      fontWeight: 700,
                      textDecoration: "none",
                      cursor: "pointer",
                    }}
                  >
                    Log in
                  </NavLink>
                  <NavLink
                    to="/register"
                    style={{
                      minHeight: "40px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      border: "1px solid transparent",
                      borderRadius: "8px",
                      padding: "0 16px",
                      background: "#2563eb",
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: 700,
                      textDecoration: "none",
                      cursor: "pointer",
                    }}
                  >
                    Get started
                  </NavLink>
                </>
              )
            )}
          </div>
        </div>

        {showTopNavigation && isMobileMenuOpen && isMobile && (
          <nav
            style={{
              position: "absolute",
              top: "64px",
              left: 0,
              right: 0,
              display: "grid",
              gap: "4px",
              borderBottom: "1px solid #e2e8f0",
              padding: "14px",
              background: "#ffffff",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
            }}
          >
            {links.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeMobileMenu}
                style={{
                  borderRadius: "8px",
                  padding: "11px 12px",
                  color: "#0f172a",
                  fontSize: "14px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                {item.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  borderTop: "1px solid #e2e8f0",
                  marginTop: "8px",
                  paddingTop: "12px",
                }}
              >
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  style={{
                    minHeight: "40px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "0 16px",
                    background: "#ffffff",
                    color: "#0f172a",
                    fontSize: "14px",
                    fontWeight: 700,
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  style={{
                    minHeight: "40px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    border: "1px solid transparent",
                    borderRadius: "8px",
                    padding: "0 16px",
                    background: "#2563eb",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: 700,
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  Get started
                </Link>
              </div>
            )}
          </nav>
        )}
      </header>

      <ConfirmDialog
        isOpen={showLogoutDialog}
        title="Log out of KIT Support Hub?"
        message="You will need to enter your credentials again to access protected support pages."
        confirmLabel="Log out"
        isBusy={isLoggingOut}
        onCancel={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}