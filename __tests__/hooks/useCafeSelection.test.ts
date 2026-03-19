import { renderHook, act } from '@testing-library/react';
import { useCafeSelection } from '../../src/lib/useCafeSelection';

describe('useCafeSelection', () => {
  it('shouldReturnNullSelectedCafeInitially', () => {
    const { result } = renderHook(() => useCafeSelection());

    expect(result.current.selectedCafeId).toBeNull();
  });

  it('shouldSelectCafeWhenSelectCalled', () => {
    const { result } = renderHook(() => useCafeSelection());

    act(() => {
      result.current.selectCafe('cafe-123');
    });

    expect(result.current.selectedCafeId).toBe('cafe-123');
  });

  it('shouldDeselectCafeWhenSameCafeSelectedAgain', () => {
    const { result } = renderHook(() => useCafeSelection());

    act(() => {
      result.current.selectCafe('cafe-123');
    });
    act(() => {
      result.current.selectCafe('cafe-123');
    });

    expect(result.current.selectedCafeId).toBeNull();
  });

  it('shouldSwitchSelectionToNewCafe', () => {
    const { result } = renderHook(() => useCafeSelection());

    act(() => {
      result.current.selectCafe('cafe-123');
    });
    act(() => {
      result.current.selectCafe('cafe-456');
    });

    expect(result.current.selectedCafeId).toBe('cafe-456');
  });

  it('shouldClearSelectionWhenClearCalled', () => {
    const { result } = renderHook(() => useCafeSelection());

    act(() => {
      result.current.selectCafe('cafe-123');
    });
    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedCafeId).toBeNull();
  });
});
