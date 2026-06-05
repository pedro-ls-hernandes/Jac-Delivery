export function money(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

export function getName(value) {
  if (!value) return '-';
  if (typeof value === 'string') return value;
  return value.name || value.username || value.email || '-';
}

export function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

export function formatPhone(value) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 2) {
    return digits ? `(${digits}` : '';
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function isValidPhone(value) {
  const digits = onlyDigits(value);
  return digits.length === 10 || digits.length === 11;
}

export function formatCurrencyInput(value) {
  const digits = onlyDigits(value);
  const amount = Number(digits || 0) / 100;
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

export function parseCurrencyInput(value) {
  const digits = onlyDigits(value);
  return Number(digits || 0) / 100;
}
