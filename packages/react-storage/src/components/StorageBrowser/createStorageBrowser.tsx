import React from 'react';
import { MergeBaseElements } from '@aws-amplify/ui-react-core/elements';

import { Permission } from './context/types';
import { StorageBrowserElements } from './context/elements';
import createProvider, { CreateProviderInput } from './createProvider';
import { LocationsView, LocationDetailView, LocationActionView } from './Views';
import { useControl } from './context/controls';

const validateRegisterAuthListener = (registerAuthListener: any) => {
  if (typeof registerAuthListener !== 'function') {
    throw new Error(
      'StorageManager: `registerAuthListener` must be a function.'
    );
  }
};

export interface CreateStorageBrowserInput<T, K>
  extends CreateProviderInput<T, K> {}

export interface StorageBrowser<T extends StorageBrowserElements> {
  (): React.JSX.Element;
  LocationDetailView: LocationDetailView<T>;
  LocationsView: LocationsView<T>;
  Provider: (props: { children?: React.ReactNode }) => React.JSX.Element;
}

export interface ResolvedStorageBrowserElements<
  T extends Partial<StorageBrowserElements>,
> extends MergeBaseElements<StorageBrowserElements, T> {}

/**
 * Handles default `StorageBrowser` behavior:
 * - render `LocationsView` on init
 * - render `LocationDetailView` on location selection
 * - render `ActionView` on action selection
 */
function DefaultStorageBrowser(): React.JSX.Element {
  const [{ location }] = useControl({ type: 'NAVIGATE' });
  const [{ selected }] = useControl({ type: 'ACTION_SELECT' });

  const { actionType } = selected ?? {};

  if (actionType) {
    return <LocationActionView />;
  }

  if (location) {
    return <LocationDetailView />;
  }

  return <LocationsView />;
}

export function createStorageBrowser<
  T extends Partial<StorageBrowserElements>,
  K extends Permission,
>(
  input: CreateStorageBrowserInput<T, K>
): {
  StorageBrowser: StorageBrowser<ResolvedStorageBrowserElements<T>>;
} {
  validateRegisterAuthListener(input.config.registerAuthListener);

  const Provider = createProvider(input);

  const StorageBrowser: StorageBrowser<
    ResolvedStorageBrowserElements<T>
  > = () => (
    <Provider>
      <DefaultStorageBrowser />
    </Provider>
  );

  StorageBrowser.Provider = Provider;
  StorageBrowser.LocationDetailView = LocationDetailView;
  StorageBrowser.LocationsView = LocationsView;

  // @ts-expect-error - force allow `displayName`
  StorageBrowser.displayName = 'StorageBrowser';

  return { StorageBrowser };
}