import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSaveSessionGuard, SaveState } from '@/lib/saveSession';

describe('Save Session Guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts in idle state', () => {
    const guard = createSaveSessionGuard();
    expect(guard.getState()).toBe('idle');
  });

  it('transitions through saving -> saved states on success', async () => {
    const guard = createSaveSessionGuard();
    const mockSave = vi.fn().mockResolvedValue({ id: '123' });

    const states: SaveState[] = [];
    guard.onStateChange(state => states.push(state));

    await guard.save(mockSave);

    expect(states).toContain('saving');
    expect(states).toContain('saved');
    expect(guard.getState()).toBe('saved');
  });

  it('transitions to error state on failure', async () => {
    const guard = createSaveSessionGuard();
    const mockSave = vi.fn().mockRejectedValue(new Error('Network error'));

    const states: SaveState[] = [];
    guard.onStateChange(state => states.push(state));

    await expect(guard.save(mockSave)).rejects.toThrow('Network error');

    expect(states).toContain('saving');
    expect(states).toContain('error');
    expect(guard.getState()).toBe('error');
  });

  it('prevents concurrent saves (mutex behavior)', async () => {
    const guard = createSaveSessionGuard();
    let callCount = 0;

    const slowSave = vi.fn().mockImplementation(async () => {
      callCount++;
      await new Promise(resolve => setTimeout(resolve, 50));
      return { id: `save-${callCount}` };
    });

    // Start two saves simultaneously
    const promise1 = guard.save(slowSave);
    const promise2 = guard.save(slowSave);

    await Promise.all([promise1, promise2]);

    // Only one actual save should have executed
    expect(slowSave).toHaveBeenCalledTimes(1);
  });

  it('allows save after previous save completes', async () => {
    const guard = createSaveSessionGuard();
    const mockSave = vi.fn().mockResolvedValue({ id: '123' });

    await guard.save(mockSave);
    guard.reset(); // Reset to allow another save

    await guard.save(mockSave);

    expect(mockSave).toHaveBeenCalledTimes(2);
  });

  it('can reset from error state', async () => {
    const guard = createSaveSessionGuard();
    const failingSave = vi.fn().mockRejectedValue(new Error('Fail'));
    const successSave = vi.fn().mockResolvedValue({ id: '123' });

    await expect(guard.save(failingSave)).rejects.toThrow();
    expect(guard.getState()).toBe('error');

    guard.reset();
    expect(guard.getState()).toBe('idle');

    await guard.save(successSave);
    expect(guard.getState()).toBe('saved');
  });
});
