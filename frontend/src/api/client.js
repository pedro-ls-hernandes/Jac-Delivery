const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export async function request(path, options = {}) {
  const token = localStorage.getItem('jac_token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Erro ao conectar com o servidor');
  }

  return data;
}

export async function loadOperationData() {
  const [entregas, entregadores, vendedores, metricas] = await Promise.all([
    request('/entregas'),
    request('/entregadores'),
    request('/vendedores'),
    request('/metricas/resumo?periodo=dia')
  ]);

  return { entregas, entregadores, vendedores, metricas };
}
