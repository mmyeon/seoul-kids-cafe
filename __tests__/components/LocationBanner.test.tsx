import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LocationBanner from '../../components/LocationBanner';
import type { GeolocationStatus } from '../../src/lib/useGeolocation';

const defaultProps = {
  status: 'idle' as GeolocationStatus,
  selectedDistrict: null,
  onRequestPermission: jest.fn(),
  onSelectDistrict: jest.fn(),
  onChangeDistrict: jest.fn(),
};

describe('LocationBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('idle 상태일 때 위치 권한 유도 배너와 허용 버튼을 표시한다', () => {
    render(<LocationBanner {...defaultProps} status="idle" />);

    expect(screen.getByText(/가까운 카페/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /허용/ })).toBeInTheDocument();
  });

  it('허용 버튼 클릭 시 onRequestPermission을 호출한다', () => {
    render(<LocationBanner {...defaultProps} status="idle" />);

    fireEvent.click(screen.getByRole('button', { name: /허용/ }));

    expect(defaultProps.onRequestPermission).toHaveBeenCalledTimes(1);
  });

  it('loading 상태일 때 위치 확인 중 메시지를 표시하고 허용 버튼을 숨긴다', () => {
    render(<LocationBanner {...defaultProps} status="loading" />);

    expect(screen.getByText(/위치 확인 중/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /허용/ })).not.toBeInTheDocument();
  });

  it('granted 상태일 때 배너를 렌더링하지 않는다', () => {
    const { container } = render(<LocationBanner {...defaultProps} status="granted" />);

    expect(container.firstChild).toBeNull();
  });

  it('denied 상태에서 자치구 미선택 시 경고 메시지와 드롭다운을 표시한다', () => {
    render(<LocationBanner {...defaultProps} status="denied" selectedDistrict={null} />);

    expect(screen.getByText(/위치 권한이 거부됐어요/)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /자치구 선택/ })).toBeInTheDocument();
  });

  it('드롭다운에서 자치구 선택 시 onSelectDistrict를 호출한다', () => {
    render(<LocationBanner {...defaultProps} status="denied" selectedDistrict={null} />);

    fireEvent.change(screen.getByRole('combobox', { name: /자치구 선택/ }), {
      target: { value: '강남구' },
    });

    expect(defaultProps.onSelectDistrict).toHaveBeenCalledWith('강남구');
  });

  it('자치구 선택 완료 시 선택된 자치구와 변경 버튼을 표시한다', () => {
    render(<LocationBanner {...defaultProps} status="denied" selectedDistrict="강남구" />);

    expect(screen.getByText('강남구')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /변경/ })).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('변경 버튼 클릭 시 onChangeDistrict를 호출한다', () => {
    render(<LocationBanner {...defaultProps} status="denied" selectedDistrict="강남구" />);

    fireEvent.click(screen.getByRole('button', { name: /변경/ }));

    expect(defaultProps.onChangeDistrict).toHaveBeenCalledTimes(1);
  });

  it('unsupported 상태일 때 자치구 드롭다운을 표시한다', () => {
    render(<LocationBanner {...defaultProps} status="unsupported" selectedDistrict={null} />);

    expect(screen.getByRole('combobox', { name: /자치구 선택/ })).toBeInTheDocument();
  });
});
