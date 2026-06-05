import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

export function PageHeader({ title, actionLabel, onAction, actionIcon = faPlus }) {
  return (
    <div className="page-header">
      <h2>{title}</h2>
      {actionLabel && <button className="primary" onClick={onAction}><FontAwesomeIcon icon={actionIcon} />{actionLabel}</button>}
    </div>
  );
}
