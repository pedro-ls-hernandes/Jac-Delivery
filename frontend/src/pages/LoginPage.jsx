import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightToBracket, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { request } from '../api/client.js';

export function LoginPage({ onLogin, onRegisterAdmin }) {
  const [form, setForm] = useState({ role: 'admin', identificador: '', password: '' });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');

    try {
      const result = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          identificador: form.identificador.trim()
        })
      });
      localStorage.setItem('jac_token', result.token);
      localStorage.setItem('jac_user', JSON.stringify(result.user));
      onLogin(result.user);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="login-page">
      <form className="login-panel" onSubmit={submit}>
        <div className="login-brand">Jac Delivery</div>
        <label>
          Perfil
          <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
            <option value="admin">Admin</option>
            <option value="vendedor">Vendedor</option>
            <option value="entregador">Entregador</option>
          </select>
        </label>
        <label>
          Login
          <input value={form.identificador} onChange={(event) => setForm({ ...form, identificador: event.target.value })} required />
        </label>
        <label>
          Senha
          <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="primary" type="submit"><FontAwesomeIcon icon={faRightToBracket} />Entrar</button>
        <button className="link-button" type="button" onClick={onRegisterAdmin}><FontAwesomeIcon icon={faUserPlus} />Criar administrador</button>
      </form>
    </main>
  );
}
