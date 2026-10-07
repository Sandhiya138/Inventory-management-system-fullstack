import React from 'react';
import { Icon } from '../icons/Icons';

export const EmptyState = ({
  icon = 'package',
  title = 'No Data Found',
  description = 'There are no records to display at this time.',
  action,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon name={icon} size={32} />
      </div>
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-desc">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
