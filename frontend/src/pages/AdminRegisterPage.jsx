import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { request } from '../api/client.js';

export function AdminRegisterPage({ onBack }) {
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (form.password !== form.confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    try {
      await request('/auth/register-admin', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          username: form.username,
          email: form.email,
          password: form.password
        })
      });
      setMessage('Administrador criado com sucesso. Volte para entrar.');
      setForm({ name: '', username: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="login-page">
      <form className="login-panel" onSubmit={submit}>
        <div className="login-brand">Novo administrador</div>
        <label>Nome<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
        <label>Usuário<input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required /></label>
        <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
        <label>Senha<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></label>
        <label>Confirmar senha<input type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} required /></label>
        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-success">{message}</p>}
        <button className="primary" type="submit"><FontAwesomeIcon icon={faUserShield} />Criar administrador</button>
        <button className="link-button" type="button" onClick={onBack}><FontAwesomeIcon icon={faArrowLeft} />Voltar para login</button>
      </form>
    </main>
  );
}

