import { renderHook, act } from '@testing-library/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAgeFilter } from '../../src/lib/useAgeFilter';
import type { AgeFilter } from '../../types/index';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

const mockUseSearchParams = useSearchParams as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

describe('useAgeFilter', () => {
  let mockReplace: jest.Mock;
  let currentParams: URLSearchParams;

  beforeEach(() => {
    currentParams = new URLSearchParams();
    mockReplace = jest.fn((url: string) => {
      currentParams = new URLSearchParams(url.replace('?', ''));
      mockUseSearchParams.mockReturnValue(currentParams);
    });
    mockUseSearchParams.mockReturnValue(currentParams);
    mockUseRouter.mockReturnValue({ replace: mockReplace });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('초기 상태에서 선택된 나이가 없다', () => {
    const { result } = renderHook(() => useAgeFilter());
    expect(result.current.selectedAges).toEqual([]);
  });

  it('toggleAge 호출 시 나이가 추가된다', () => {
    const { result } = renderHook(() => useAgeFilter());

    act(() => {
      result.current.toggleAge('1' as AgeFilter);
    });

    expect(mockReplace).toHaveBeenCalledWith('?ages=1');
  });

  it('같은 나이를 두 번 toggle하면 나이가 제거된다', () => {
    currentParams = new URLSearchParams('ages=1');
    mockUseSearchParams.mockReturnValue(currentParams);

    const { result } = renderHook(() => useAgeFilter());

    act(() => {
      result.current.toggleAge('1' as AgeFilter);
    });

    expect(mockReplace).toHaveBeenCalledWith('?');
  });

  it('여러 나이를 toggle하면 모두 누적된다', () => {
    const { result, rerender } = renderHook(() => useAgeFilter());

    act(() => {
      result.current.toggleAge('1' as AgeFilter);
    });
    rerender();

    act(() => {
      result.current.toggleAge('2' as AgeFilter);
    });
    rerender();

    act(() => {
      result.current.toggleAge('3' as AgeFilter);
    });

    expect(mockReplace).toHaveBeenLastCalledWith('?ages=1%2C2%2C3');
  });

  it('clearAll 호출 시 선택된 모든 나이가 제거된다', () => {
    currentParams = new URLSearchParams('ages=1,2');
    mockUseSearchParams.mockReturnValue(currentParams);

    const { result } = renderHook(() => useAgeFilter());

    act(() => {
      result.current.clearAll();
    });

    expect(mockReplace).toHaveBeenCalledWith('?');
  });
});
