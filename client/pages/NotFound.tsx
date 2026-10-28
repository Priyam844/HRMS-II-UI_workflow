import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Home, SearchX } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Page not found · Tandem — Recruitment & Selection";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "The page you're looking for doesn't exist in the Tandem recruitment workspace.");
  }, [location.pathname]);

  return (
    <div className="notfound-page">
      <span className="placeholder-icon"><SearchX size={24} /></span>
      <div className="eyebrow">RECRUITMENT WORKSPACE</div>
      <h1>Page not found</h1>
      <p>
        We couldn't find <strong>{location.pathname}</strong>. The link may be outdated, or the page may have moved within the workspace.
      </p>
      <div className="notfound-actions">
        <Link to="/" className="button-primary"><Home size={16} /> Back to dashboard</Link>
        <Link to="/applications" className="button-secondary">Browse open roles <ArrowRight size={14} /></Link>
      </div>
      <small className="notfound-help">Need help? Contact a People &amp; Culture administrator.</small>
    </div>
  );
};

export default NotFound;
