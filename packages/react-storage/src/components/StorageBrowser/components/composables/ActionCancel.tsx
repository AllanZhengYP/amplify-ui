import React from 'react';

import { STORAGE_BROWSER_BLOCK } from '../base';
import { ButtonElement } from '../elements';

export interface ActionCancelProps {
  onCancel?: () => void;
  isDisabled?: boolean;
  label?: string;
}

export const ActionCancel = ({
  onCancel,
  isDisabled,
  label,
}: ActionCancelProps): React.JSX.Element => (
  <ButtonElement
    variant="cancel"
    className={`${STORAGE_BROWSER_BLOCK}__cancel`}
    onClick={onCancel}
    disabled={isDisabled}
  >
    {label}
  </ButtonElement>
);
