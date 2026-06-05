import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faFloppyDisk } from '@fortawesome/free-solid-svg-icons';

export function Input({ label, value, set, type = 'text', required = true, pattern, title, inputMode }) {
  function preventNumberScroll(event) {
    if (type === 'number') {
      event.currentTarget.blur();
    }
  }

  return (
    <label>
      {label}
      <input type={type} value={value} onChange={(event) => set(event.target.value)} onWheel={preventNumberScroll} required={required} pattern={pattern} title={title} inputMode={inputMode} />
    </label>
  );
}

export function Select({ label, value, set, options, required = true }) {
  const normalized = options.map((item) => (
    typeof item === 'string' ? { value: item, label: item } : item
  ));

  return (
    <label>
      {label}
      <select value={value} onChange={(event) => set(event.target.value)} required={required}>
        <option value="">Selecione</option>
        {normalized.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
    </label>
  );
}

export function FormPanel({ title, onSubmit, submitLabel, children }) {
  return (
    <form className="form-panel" onSubmit={onSubmit}>
      <h2>{title}</h2>
      <div className="form-grid">{children}</div>
      <div className="form-actions">
        <button type="reset" className="cancel"><FontAwesomeIcon icon={faBan} />Cancelar</button>
        <button className="primary" type="submit"><FontAwesomeIcon icon={faFloppyDisk} />{submitLabel}</button>
      </div>
    </form>
  );
}
