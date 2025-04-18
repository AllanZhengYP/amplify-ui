import React from 'react';

import { STORAGE_BROWSER_BLOCK } from '../base';
import { ButtonElement } from '../elements';

export interface ActionStartProps {
  onStart?: () => void;
  isDisabled?: boolean;
  label?: string;
}

export const ActionStart = ({
  onStart,
  isDisabled,
  label,
}: ActionStartProps): React.JSX.Element => (
  <ButtonElement
    variant="primary"
    className={`${STORAGE_BROWSER_BLOCK}__action-start`}
    onClick={onStart}
    disabled={isDisabled}
  >
    {label}
  </ButtonElement>
);
