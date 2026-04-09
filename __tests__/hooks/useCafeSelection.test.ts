import { renderHook, act } from '@testing-library/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCafeSelection } from '../../src/lib/useCafeSelection';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

const mockUseSearchParams = useSearchParams as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

describe('useCafeSelection', () => {
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

  it('초기 상태에서 선택된 카페가 없다', () => {
    const { result } = renderHook(() => useCafeSelection());
    expect(result.current.selectedCafeId).toBeNull();
  });

  it('selectCafe 호출 시 cafeId가 URL에 추가된다', () => {
    const { result } = renderHook(() => useCafeSelection());

    act(() => {
      result.current.selectCafe('cafe-123');
    });

    expect(mockReplace).toHaveBeenCalledWith('?cafeId=cafe-123');
  });

  it('같은 카페를 다시 선택하면 cafeId가 URL에서 제거된다', () => {
    currentParams = new URLSearchParams('cafeId=cafe-123');
    mockUseSearchParams.mockReturnValue(currentParams);

    const { result } = renderHook(() => useCafeSelection());

    act(() => {
      result.current.selectCafe('cafe-123');
    });

    expect(mockReplace).toHaveBeenCalledWith('?');
  });

  it('다른 카페를 선택하면 cafeId가 새 카페로 변경된다', () => {
    currentParams = new URLSearchParams('cafeId=cafe-123');
    mockUseSearchParams.mockReturnValue(currentParams);

    const { result } = renderHook(() => useCafeSelection());

    act(() => {
      result.current.selectCafe('cafe-456');
    });

    expect(mockReplace).toHaveBeenCalledWith('?cafeId=cafe-456');
  });

  it('clearSelection 호출 시 cafeId가 URL에서 제거된다', () => {
    currentParams = new URLSearchParams('cafeId=cafe-123');
    mockUseSearchParams.mockReturnValue(currentParams);

    const { result } = renderHook(() => useCafeSelection());

    act(() => {
      result.current.clearSelection();
    });

    expect(mockReplace).toHaveBeenCalledWith('?');
  });
});
