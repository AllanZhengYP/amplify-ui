import { toAccessGrantPermission } from '../../permissionParsers';
import { Permission, StorageAccess } from '../../../storage-internal';

describe('toAccessGrantPermission', () => {
  it('should map either of read, get, list - storage access to READ', () => {
    const input: StorageAccess[] = ['read', 'get', 'list'];
    const expectedOutput: Permission = 'READ';
    expect(toAccessGrantPermission(input)).toBe(expectedOutput);
  });

  it('should map write, delete - storage access to WRITE', () => {
    const input: StorageAccess[] = ['write', 'delete'];
    const expectedOutput: Permission = 'WRITE';
    expect(toAccessGrantPermission(input)).toBe(expectedOutput);
  });

  it('should map get, list, and write permissions to READWRITE', () => {
    const input: StorageAccess[] = ['get', 'list', 'write'];
    const expectedOutput: Permission = 'READWRITE';
    expect(toAccessGrantPermission(input)).toBe(expectedOutput);
  });

  it('should return an empty string for unknown permissions', () => {
    // @ts-expect-error
    const input: StorageAccess[] = ['unknown'];
    expect(() => toAccessGrantPermission(input)).toThrow(
      'Improper Permission: Please provide correct permission.'
    );
  });
});
