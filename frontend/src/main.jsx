import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faMotorcycle, faRightFromBracket, faTruckFast } from '@fortawesome/free-solid-svg-icons';
import { loadOperationData } from './api/client.js';
import { MENU_ITEMS } from './constants/domain.js';
import { getName } from './utils/format.js';
import { AdminRegisterPage } from './pages/AdminRegisterPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { EntregasPage } from './pages/EntregasPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { NovaEntregaPage } from './pages/NovaEntregaPage.jsx';
import { PessoasPage } from './pages/PessoasPage.jsx';
import { RelatoriosPage } from './pages/RelatoriosPage.jsx';
import './styles.css';
import companyLogo from './assets/logo.png';
// Para usar um logo real:
// 1. Coloque o arquivo em frontend/src/assets/logo.png
// 2. Descomente a linha abaixo
// 3. Troque null por companyLogo no JSX do Sidebar

//const companyLogo = null;

const INITIAL_DATA = {
  entregas: [],
  entregadores: [],
  vendedores: [],
  metricas: null
};

const PAGE_TO_PATH = {
  dashboard: '/dashboard',
  entregas: '/entregas',
  'nova-entrega': '/nova-entrega',
  relatorios: '/relatorios',
  vendedores: '/vendedores',
  entregadores: '/entregadores'
};

const PATH_TO_PAGE = Object.fromEntries(
  Object.entries(PAGE_TO_PATH).map(([page, path]) => [path, page])
);

function getInitialAuthPage() {
  return window.location.pathname === '/registrar-admin' ? 'register-admin' : 'login';
}

function getInitialPage() {
  return PATH_TO_PAGE[window.location.pathname] || 'dashboard';
}

function navigateTo(path) {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
  }
}

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('jac_user') || 'null'));
  const [authPage, setAuthPage] = useState(getInitialAuthPage);
  const [page, setPageState] = useState(getInitialPage);
  const [data, setData] = useState(INITIAL_DATA);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  function setPage(nextPage) {
    setPageState(nextPage);
    navigateTo(PAGE_TO_PATH[nextPage] || '/dashboard');
  }

  function setPublicPage(nextPage) {
    setAuthPage(nextPage);
    navigateTo(nextPage === 'register-admin' ? '/registrar-admin' : '/login');
  }

  async function loadData() {
    if (!localStorage.getItem('jac_token')) return;

    setLoading(true);
    try {
      setData(await loadOperationData());
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    function handlePopState() {
      if (!localStorage.getItem('jac_token')) {
        setAuthPage(getInitialAuthPage());
        return;
      }

      setPageState(getInitialPage());
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (user && ['/login', '/registrar-admin', '/'].includes(window.location.pathname)) {
      navigateTo(PAGE_TO_PATH[page] || '/dashboard');
    }

    if (!user && !['/login', '/registrar-admin'].includes(window.location.pathname)) {
      navigateTo('/login');
      setAuthPage('login');
    }
  }, [user, page]);

  function logout() {
    localStorage.removeItem('jac_token');
    localStorage.removeItem('jac_user');
    setUser(null);
    setData(INITIAL_DATA);
    setPageState('dashboard');
    navigateTo('/login');
  }

  if (!user) {
    if (authPage === 'register-admin') {
      return <AdminRegisterPage onBack={() => setPublicPage('login')} />;
    }

    return <LoginPage onLogin={setUser} onRegisterAdmin={() => setPublicPage('register-admin')} />;
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={page} setPage={setPage} logout={logout} />
      <main className="main-content">
        <Topbar user={user} loading={loading} />
        {message && <div className="notice">{message}<button onClick={() => setMessage('')}>×</button></div>}
        <CurrentPage
          page={page}
          data={data}
          setData={setData}
          setPage={setPage}
          refresh={loadData}
          setMessage={setMessage}
        />
      </main>
    </div>
  );
}

function Sidebar({ activePage, setPage, logout }) {
  return (
    <aside className="sidebar">
      <div className="brand-mark">
        <span><FontAwesomeIcon icon={faMotorcycle} /></span>
        <strong>Jac Delivery</strong>
      </div>
      <nav>
        {MENU_ITEMS.map((item) => (
          <button key={item.id} className={activePage === item.id ? 'active' : ''} onClick={() => setPage(item.id)}>
            <span><FontAwesomeIcon icon={item.icon} /></span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="company-logo">
          {companyLogo ? <img src={companyLogo} alt="Logo Jac Delivery" /> : 'JAC'}
        </div>
        <button className="ghost" onClick={logout}><FontAwesomeIcon icon={faRightFromBracket} />Sair</button>
      </div>
    </aside>
  );
}

function Topbar({ user, loading }) {
  return (
    <header className="topbar">
      <div>
        <h1><FontAwesomeIcon icon={faTruckFast} /> Operação de entregas</h1>
        <p><FontAwesomeIcon icon={faCalendarDay} /> {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
      </div>
      <div className="user-pill">{loading ? 'Atualizando...' : getName(user)}</div>
    </header>
  );
}

function CurrentPage({ page, data, setData, setPage, refresh, setMessage }) {
  const commonProps = { data, refresh, setMessage };

  if (page === 'entregas') {
    return <EntregasPage {...commonProps} go={setPage} />;
  }

  if (page === 'nova-entrega') {
    return <NovaEntregaPage {...commonProps} navigate={setPage} />;
  }

  if (page === 'relatorios') {
    return <RelatoriosPage {...commonProps} setData={setData} />;
  }

  if (page === 'vendedores') {
    return <PessoasPage tipo="vendedor" items={data.vendedores} refresh={refresh} setMessage={setMessage} />;
  }

  if (page === 'entregadores') {
    return <PessoasPage tipo="entregador" items={data.entregadores} refresh={refresh} setMessage={setMessage} />;
  }

  return <DashboardPage data={data} go={setPage} />;
}

createRoot(document.getElementById('root')).render(<App />);
