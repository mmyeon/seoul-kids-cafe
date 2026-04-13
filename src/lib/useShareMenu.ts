'use client';

import { useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export type UseShareMenuReturn = {
  openMenuId: string | null;
  toggleMenu: (id: string) => void;
  closeMenu: () => void;
  copiedId: string | null;
  copyLink: (cafeId: string) => Promise<void>;
  shareKakao: (cafeId: string) => void;
};

export function useShareMenu(): UseShareMenuReturn {
  const searchParams = useSearchParams();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleMenu = useCallback((id: string) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  }, []);

  const closeMenu = useCallback(() => {
    setOpenMenuId(null);
  }, []);

  const buildShareUrl = useCallback(
    (cafeId: string): string => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('cafeId', cafeId);
      return `${window.location.origin}?${params.toString()}`;
    },
    [searchParams],
  );

  const copyLink = useCallback(
    async (cafeId: string): Promise<void> => {
      const url = buildShareUrl(cafeId);
      await navigator.clipboard.writeText(url);
      setCopiedId(cafeId);
      setOpenMenuId(null);
      setTimeout(() => setCopiedId((prev) => (prev === cafeId ? null : prev)), 2000);
    },
    [buildShareUrl],
  );

  const shareKakao = useCallback(
    (cafeId: string): void => {
      if (!window.Kakao) return;
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY ?? '');
      }
      const shareUrl = buildShareUrl(cafeId);
      window.Kakao.Share.sendScrap({ requestUrl: shareUrl });
      setOpenMenuId(null);
    },
    [buildShareUrl],
  );

  return { openMenuId, toggleMenu, closeMenu, copiedId, copyLink, shareKakao };
}
