import { renderHook, act } from '@testing-library/react';
import { useAgeFilter } from '../../src/lib/useAgeFilter';
import type { AgeFilter } from '../../types/index';

describe('useAgeFilter', () => {
  it('shouldReturnEmptySelectedAgesInitially', () => {
    const { result } = renderHook(() => useAgeFilter());

    expect(result.current.selectedAges).toEqual([]);
  });

  it('shouldAddAgeWhenToggleCalled', () => {
    const { result } = renderHook(() => useAgeFilter());

    act(() => {
      result.current.toggleAge('1' as AgeFilter);
    });

    expect(result.current.selectedAges).toEqual(['1']);
  });

  it('shouldRemoveAgeWhenSameAgeToggledTwice', () => {
    const { result } = renderHook(() => useAgeFilter());

    act(() => {
      result.current.toggleAge('1' as AgeFilter);
    });
    act(() => {
      result.current.toggleAge('1' as AgeFilter);
    });

    expect(result.current.selectedAges).toEqual([]);
  });

  it('shouldAccumulateMultipleSelectedAges', () => {
    const { result } = renderHook(() => useAgeFilter());

    act(() => {
      result.current.toggleAge('1' as AgeFilter);
    });
    act(() => {
      result.current.toggleAge('2' as AgeFilter);
    });
    act(() => {
      result.current.toggleAge('3' as AgeFilter);
    });

    expect(result.current.selectedAges).toEqual(['1', '2', '3']);
  });

  it('shouldClearAllSelectedAgesWhenClearCalled', () => {
    const { result } = renderHook(() => useAgeFilter());

    act(() => {
      result.current.toggleAge('1' as AgeFilter);
      result.current.toggleAge('2' as AgeFilter);
    });
    act(() => {
      result.current.clearAll();
    });

    expect(result.current.selectedAges).toEqual([]);
  });
});
