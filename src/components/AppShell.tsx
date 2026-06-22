import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { tokenStore } from '../api/client';

export function AppShell() {
  const navigate = useNavigate();

  function logout() {
    tokenStore.clear();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="nav">
        <div className="brand">FamilyBudget AI</div>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/subscriptions">Subscriptions</NavLink>
        <NavLink to="/assistant">AI Assistant</NavLink>
        <button className="ghost-button" onClick={logout}>Logout</button>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
