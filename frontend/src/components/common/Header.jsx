import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserRound,
  Home,
  LayoutDashboard,
  Ticket,
  BookOpen,
  Wrench,
  FileText,
  MessageCircle,
  Star,
  Lightbulb,
  Bot,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
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

export default function Header() {
  const { isAuthenticated, logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  const isTransparent = location.pathname === "/" && !isAuthPage && !scrolled;
  const links = isAuthenticated ? clientLinks : publicLinks;
  const showNav = !isAuthPage;

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 10);
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

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
      setIsMobileMenuOpen(false);
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

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

  const isSmallDesktop = windowWidth < 1280 && windowWidth >= 1024;
  const isMediumDesktop = windowWidth < 1140 && windowWidth >= 1024;
  const navFontSize = isMediumDesktop ? "11px" : isSmallDesktop ? "12px" : "14px";
  const navPadding = isMediumDesktop ? "4px 6px" : isSmallDesktop ? "4px 8px" : "6px 12px";
  const navGap = isMediumDesktop ? "2px" : isSmallDesktop ? "3px" : "4px";

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
          borderBottom: isTransparent
            ? "none"
            : isDark
              ? "1px solid #1a2d4a"
              : "1px solid #e2e8f0",
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
            padding: "0 16px",
            width: "100%",
            maxWidth: "1280px",
            margin: "0 auto",
            gap: "8px",
          }}
        >
          {/* Left: Logo ONLY */}
          <NavLink
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: "32px",
                height: "32px",
                display: "grid",
                placeItems: "center",
                borderRadius: "8px",
                background: "#2563eb",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "14px",
              }}
            >
              K
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
              <strong style={{ fontSize: "14px", color: getTextColor() }}>
                KIT
              </strong>
              <small
                style={{
                  fontSize: "10px",
                  color: isTransparent
                    ? "rgba(255,255,255,0.7)"
                    : isDark
                      ? "rgba(255,255,255,0.7)"
                      : "#64748b",
                  display: windowWidth < 500 ? "none" : "inline",
                }}
              >
                Support Hub
              </small>
            </span>
          </NavLink>

          {/* Center: Desktop Navigation */}
          {showNav && (
            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: navGap,
                flex: "1",
                justifyContent: "center",
                overflow: "hidden",
                flexWrap: "nowrap",
              }}
              className="desktop-nav"
            >
              {links.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    style={{
                      color: getLinkColor(isActive),
                      fontSize: navFontSize,
                      fontWeight: isActive ? 700 : 500,
                      padding: navPadding,
                      borderRadius: "6px",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease",
                      background: getLinkBackground(isActive),
                    }}
                    onMouseEnter={(e) => {
                      const active = location.pathname === item.to;
                      if (!active) {
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
                      const active = location.pathname === item.to;
                      if (!active) {
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

          {/* Right: Actions - Icons ONLY */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              flexShrink: 0,
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
                  background: "transparent",
                  border: "none",
                  color: getTextColor(),
                  width: "36px",
                  height: "36px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  cursor: "pointer",
                  padding: "0",
                }}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
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
                    minHeight: "36px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    border: "none",
                    borderRadius: "8px",
                    padding: "2px 4px",
                    background: "transparent",
                    color: getTextColor(),
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      width: "32px",
                      height: "32px",
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "50%",
                      background: isTransparent
                        ? "rgba(255,255,255,0.2)"
                        : "#dbeafe",
                      color: isTransparent ? "#ffffff" : "#1d4ed8",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                  <ChevronDown
                    size={14}
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
                      width: "180px",
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
                        minHeight: "40px",
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
                        minHeight: "40px",
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
                        minHeight: "40px",
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
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <NavLink
                    to="/login"
                    style={{
                      minHeight: "36px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      border: isTransparent
                        ? "1px solid rgba(255,255,255,0.3)"
                        : "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "0 12px",
                      background: isTransparent
                        ? "rgba(255,255,255,0.1)"
                        : "#ffffff",
                      color: getTextColor(),
                      fontSize: "13px",
                      fontWeight: 600,
                      textDecoration: "none",
                      cursor: "pointer",
                    }}
                  >
                    Log in
                  </NavLink>
                  <NavLink
                    to="/register"
                    style={{
                      minHeight: "36px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      border: "1px solid transparent",
                      borderRadius: "8px",
                      padding: "0 12px",
                      background: "#2563eb",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: 600,
                      textDecoration: "none",
                      cursor: "pointer",
                    }}
                  >
                    Get started
                  </NavLink>
                </div>
              )
            )}

            {/* Mobile Hamburger */}
            {showNav && (
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                aria-label={
                  isMobileMenuOpen ? "Close navigation" : "Open navigation"
                }
                aria-expanded={isMobileMenuOpen}
                style={{
                  background: "transparent",
                  border: "none",
                  color: getTextColor(),
                  width: "36px",
                  height: "36px",
                  display: "none",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  cursor: "pointer",
                  padding: "0",
                }}
                className="mobile-hamburger"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {showNav && isMobileMenuOpen && (
          <nav
            style={{
              position: "absolute",
              top: "64px",
              left: 0,
              right: 0,
              display: "grid",
              gap: "2px",
              borderBottom: "1px solid #e2e8f0",
              padding: "12px 16px",
              background: isDark ? "#0a1628" : "#ffffff",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              maxHeight: "calc(100vh - 64px)",
              overflowY: "auto",
            }}
          >
            {links.map((item) => {
              const isActive = location.pathname === item.to;
              let icon;
              const label = item.label.toLowerCase();
              if (label === "home") icon = <Home size={18} />;
              else if (label === "dashboard") icon = <LayoutDashboard size={18} />;
              else if (label === "tickets") icon = <Ticket size={18} />;
              else if (label === "knowledge base") icon = <BookOpen size={18} />;
              else if (label === "error codes") icon = <Wrench size={18} />;
              else if (label === "documents") icon = <FileText size={18} />;
              else if (label === "forum") icon = <MessageCircle size={18} />;
              else if (label === "reviews") icon = <Star size={18} />;
              else if (label === "features") icon = <Lightbulb size={18} />;
              else if (label === "robots") icon = <Bot size={18} />;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeMobileMenu}
                  style={{
                    borderRadius: "8px",
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    color: isDark
                      ? isActive
                        ? "#60a5fa"
                        : "#94a3b8"
                      : isActive
                        ? "#2563eb"
                        : "#64748b",
                    fontSize: "15px",
                    fontWeight: isActive ? 700 : 500,
                    textDecoration: "none",
                    background: isActive
                      ? isDark
                        ? "rgba(37, 99, 235, 0.2)"
                        : "#eff6ff"
                      : "transparent",
                    transition: "all 0.2s ease-in-out",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = isDark ? "#ffffff" : "#2563eb";
                      e.currentTarget.style.background = isDark
                        ? "rgba(255,255,255,0.08)"
                        : "#f1f5f9";
                      e.currentTarget.style.transform = "translateX(4px)";
                      const svg = e.currentTarget.querySelector("svg");
                      if (svg) svg.style.color = isDark ? "#60a5fa" : "#2563eb";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = isDark ? "#94a3b8" : "#64748b";
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.transform = "translateX(0px)";
                      const svg = e.currentTarget.querySelector("svg");
                      if (svg) svg.style.color = "#64748b";
                    }
                  }}
                >
                  {icon && (
                    <span
                      style={{
                        color: isActive
                          ? isDark
                            ? "#60a5fa"
                            : "#2563eb"
                          : "#64748b",
                      }}
                    >
                      {icon}
                    </span>
                  )}
                  {item.label}
                </NavLink>
              );
            })}
            {!isAuthenticated && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  borderTop: "1px solid #e2e8f0",
                  marginTop: "8px",
                  paddingTop: "10px",
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




