export type SeoulKidsCafeRaw = {
  FCLTY_NM: string
  RDNMADR: string
  LTTUD: string
  LNGTD: string
  MIN_AGE: string
  MAX_AGE: string
  OPER_HR: string
  TELNO: string
  RESERVATION_URL: string
  NAVER_PLACE_URL?: string
  IMAGE_URL?: string
}

export type KidsCafe = {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  ageRange: { minAge: number; maxAge: number }
  operatingHours: string
  phone: string
  reservationUrl: string
  naverPlaceUrl?: string
  imageUrl?: string
  parking?: 'available' | 'unavailable' | 'unknown'
}

export type AgeFilter = 'under12m' | '1' | '2' | '3' | '4' | '5' | '6' | '7'

export type MatchStatus = 'full' | 'partial' | 'none'
