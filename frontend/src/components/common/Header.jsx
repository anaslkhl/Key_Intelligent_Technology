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
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  const isHeroPage = location.pathname === "/";
  const isTransparent = isHeroPage && !isAuthPage && scrolled;

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
          background: isTransparent ? "transparent" : "#ffffff",
          borderBottom: isTransparent ? "none" : "1px solid #e2e8f0",
          boxShadow: isTransparent ? "none" : "0 1px 2px rgba(0,0,0,0.05)",
          backdropFilter: isTransparent ? "blur(12px)" : "none",
          transition: "background 0.3s ease, backdrop-filter 0.3s ease",
        }}
      >
        <div
          className="header-inner"
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            padding: "0 24px",
            width: "100%",
            maxWidth: "1280px",
            margin: "0 auto",
            color: "#0f172a",
          }}
        >
          {showNavigation && (
            <button
              type="button"
              className="icon-button menu-button"
              onClick={onOpenNavigation}
              aria-label="Open workspace navigation"
              title="Open navigation"
              style={{
                background: isTransparent ? "rgba(0,0,0,0.05)" : "transparent",
                borderColor: isTransparent ? "rgba(0,0,0,0.1)" : "#e2e8f0",
                color: "#0f172a",
              }}
            >
              <Menu size={20} />
            </button>
          )}
          {showTopNavigation && !showNavigation && (
            <button
              type="button"
              className="icon-button mobile-nav-button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-label={
                isMobileMenuOpen ? "Close navigation" : "Open navigation"
              }
              aria-expanded={isMobileMenuOpen}
              style={{
                background: isTransparent ? "rgba(0,0,0,0.05)" : "transparent",
                borderColor: isTransparent ? "rgba(0,0,0,0.1)" : "#e2e8f0",
                color: "#0f172a",
              }}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}

          <NavLink
            to="/"
            className="brand"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              color: "#0f172a",
            }}
          >
            <span
              className="brand-mark"
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
            <span className="brand-copy">
              <strong
                style={{
                  display: "block",
                  lineHeight: 1.05,
                  fontSize: "15px",
                  color: "#0f172a",
                }}
              >
                KIT
              </strong>
              <small
                style={{
                  display: "block",
                  lineHeight: 1.05,
                  marginTop: "4px",
                  fontSize: "11px",
                  color: "#64748b",
                }}
              >
                Support Hub
              </small>
            </span>
          </NavLink>

          {showTopNavigation && (
            <nav
              className="marketing-nav"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
                flex: "1 1 auto",
                justifyContent: "center",
              }}
            >
              {links.map((item, index) => (
                <Link
                  key={`${item.label}-${index}`}
                  to={item.to}
                  style={{
                    color: "#0f172a",
                    fontSize: "14px",
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "color 160ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "#2563eb";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "#0f172a";
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          <div
            className="account-nav"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              marginLeft: "auto",
            }}
          >
            {!isAuthPage && (
              <button
                type="button"
                className="icon-button"
                onClick={toggleTheme}
                aria-label={`Use ${isDark ? "light" : "dark"} mode`}
                title={`Use ${isDark ? "light" : "dark"} mode`}
                style={{
                  background: isTransparent
                    ? "rgba(0,0,0,0.05)"
                    : "transparent",
                  borderColor: isTransparent ? "rgba(0,0,0,0.1)" : "#e2e8f0",
                  color: "#0f172a",
                }}
              >
                {isDark ? <Sun size={19} /> : <Moon size={19} />}
              </button>
            )}
            {isAuthenticated ? (
              <div
                className="header-user-menu"
                style={{ position: "relative" }}
              >
                <button
                  type="button"
                  className="header-user-trigger"
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
                    background: "transparent",
                    color: "#0f172a",
                    cursor: "pointer",
                  }}
                >
                  <span
                    className="user-avatar"
                    style={{
                      width: "34px",
                      height: "34px",
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "50%",
                      background: "#dbeafe",
                      color: "#1d4ed8",
                      fontSize: "13px",
                      fontWeight: 800,
                    }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                  <span
                    className="header-user-copy"
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
                        color: "#0f172a",
                      }}
                    >
                      {user.name}
                    </strong>
                    <small
                      style={{
                        display: "block",
                        marginTop: "2px",
                        color: "#64748b",
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
                    style={{ color: "#0f172a" }}
                  />
                </button>
                {isUserMenuOpen && (
                  <div
                    className="user-dropdown"
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
                      role="menuitem"
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
                      role="menuitem"
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
                      role="menuitem"
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
                    className="button button-secondary button-md header-login-button"
                    style={{
                      minHeight: "40px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "0 16px",
                      background: "transparent",
                      color: "#0f172a",
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
                    className="button button-primary button-md header-cta"
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

        {showTopNavigation && isMobileMenuOpen && (
          <nav
            className="mobile-marketing-menu"
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
            {links.map((item, index) => (
              <Link
                key={`${item.label}-${index}`}
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
                className="mobile-auth-actions"
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
                  className="button button-secondary"
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
                  className="button button-primary"
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
