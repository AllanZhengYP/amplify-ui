import { createContextUtilities } from '@aws-amplify/ui-react-core';
import { ControlsContext } from './types';

const defaultValue = {
  data: {},
  actionsConfig: {},
} as ControlsContext;

export const { useControlsContext, ControlsContextProvider } =
  createContextUtilities({
    contextName: 'ControlsContext',
    defaultValue,
  });