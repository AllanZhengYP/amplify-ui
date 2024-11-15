import React from 'react';
import { render } from '@testing-library/react';

import { INITIAL_STATUS_COUNTS } from '../../../../tasks';

import * as UseUploadViewModule from '../useUploadView';
import { UploadViewState } from '../types';
import { UploadView } from '../UploadView';

jest.mock('../../../../displayText', () => ({
  useDisplayText: () => ({ UploadView: {} }),
}));

const mockControlsContextProvider = jest.fn(
  (_: any) => 'ControlsContextProvider'
);
jest.mock('../../../../controls/context', () => ({
  ControlsContextProvider: (ctx: any) => mockControlsContextProvider(ctx),
  useControlsContext: () => ({ actionConfig: {}, data: {} }),
}));

const onActionCancel = jest.fn();
const onActionStart = jest.fn();
const onActionExit = jest.fn();
const onDropFiles = jest.fn();
const onSelectFiles = jest.fn();
const onToggleOverwrite = jest.fn();

const callbacks = {
  onActionCancel,
  onActionStart,
  onDropFiles,
  onActionExit,
  onSelectFiles,
  onToggleOverwrite,
};

const statusCounts = { ...INITIAL_STATUS_COUNTS };

const testFile = new File([], 'test-ooo');
const data = { id: 'some-uuid', file: testFile, key: testFile.name };

const taskOne = {
  data,
  cancel: jest.fn(),
  message: undefined,
  remove: jest.fn(),
  progress: 0,
  status: 'QUEUED' as const,
};

const location = {
  id: 'an-id-👍🏼',
  bucket: 'test-bucket',
  permission: 'READWRITE',
  prefix: 'test-prefix/',
  type: 'PREFIX',
} as const;

const initialViewState: UploadViewState = {
  ...callbacks,
  location: { current: location, path: '', key: '' },
  isOverwritingEnabled: false,
  isProcessingComplete: false,
  isProcessing: false,
  tasks: [],
  statusCounts,
};

const preprocessingViewState: UploadViewState = {
  ...initialViewState,
  tasks: [taskOne],
  statusCounts: { ...statusCounts, QUEUED: 1, TOTAL: 1 },
};

const processingViewState: UploadViewState = {
  ...initialViewState,
  isProcessing: true,
  tasks: [{ ...taskOne, status: 'PENDING' }],
  statusCounts: { ...statusCounts, PENDING: 1, TOTAL: 1 },
};

const postProcessingViewState: UploadViewState = {
  ...initialViewState,
  isProcessingComplete: true,
  tasks: [{ ...taskOne, status: 'COMPLETE' }],
  statusCounts: { ...statusCounts, COMPLETE: 1, TOTAL: 1 },
};

const useUploadViewSpy = jest
  .spyOn(UseUploadViewModule, 'useUploadView')
  .mockReturnValue(initialViewState);

describe('UploadView', () => {
  afterEach(jest.clearAllMocks);

  it('provides the expected boolean flags to `ControlsContextProvider` prior to processing when tasks is empty', () => {
    render(<UploadView />);

    const { calls } = mockControlsContextProvider.mock;
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toMatchObject({
      data: {
        isActionStartDisabled: true,
        isActionExitDisabled: false,
        isActionCancelDisabled: true,
        isAddFilesDisabled: false,
        isAddFolderDisabled: false,
        isOverwriteToggleDisabled: false,
      },
    });
  });

  it('provides the expected boolean flags to `ControlsContextProvider` prior to processing', () => {
    useUploadViewSpy.mockReturnValue(preprocessingViewState);

    render(<UploadView />);

    const { calls } = mockControlsContextProvider.mock;
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toMatchObject({
      data: {
        isActionStartDisabled: false,
        isActionExitDisabled: false,
        isActionCancelDisabled: true,
        isAddFilesDisabled: false,
        isAddFolderDisabled: false,
        isOverwriteToggleDisabled: false,
      },
    });
  });

  it('provides the expected boolean flags to `ControlsContextProvider` while processing', () => {
    useUploadViewSpy.mockReturnValue(processingViewState);

    render(<UploadView />);

    const { calls } = mockControlsContextProvider.mock;
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toMatchObject({
      data: {
        isActionStartDisabled: true,
        isActionExitDisabled: true,
        isActionCancelDisabled: false,
        isAddFilesDisabled: true,
        isAddFolderDisabled: true,
        isOverwriteToggleDisabled: true,
      },
    });
  });

  it('provides the expected boolean flags to `ControlsContextProvider` post processing', () => {
    useUploadViewSpy.mockReturnValue(postProcessingViewState);

    render(<UploadView />);

    const { calls } = mockControlsContextProvider.mock;
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toMatchObject({
      data: {
        isActionStartDisabled: true,
        isActionExitDisabled: false,
        isActionCancelDisabled: true,
        isAddFilesDisabled: true,
        isAddFolderDisabled: true,
        isOverwriteToggleDisabled: true,
      },
    });
  });
});