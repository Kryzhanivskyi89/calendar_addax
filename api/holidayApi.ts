import {Country, Holiday, LongWeekend, CountryInfo} from '../types/types';

const BASE_URL = 'https://date.nager.at/api/v3';

export const fetchCountryInfo = async (countryCode: string): Promise<CountryInfo> => {
  const response = await fetch(`${BASE_URL}/CountryInfo/${countryCode}`);
  if (!response.ok) throw new Error('Failed to fetch country info');
  return response.json();
};

export const fetchAvailableCountries = async (): Promise<Country[]> => {
  const response = await fetch(`${BASE_URL}/AvailableCountries`);
  if (!response.ok) throw new Error('Failed to fetch countries');
  return response.json();
};

export const fetchLongWeekends = async (year: number, countryCode: string): Promise<LongWeekend[]> => {
  const response = await fetch(`${BASE_URL}/LongWeekend/${year}/${countryCode}`);
  if (!response.ok) throw new Error('Failed to fetch long weekends');
  return response.json();
};

export const fetchPublicHolidays = async (year: number, countryCode: string): Promise<Holiday[]> => {
  const response = await fetch(`${BASE_URL}/PublicHolidays/${year}/${countryCode}`);
  if (!response.ok) throw new Error('Failed to fetch holidays');
  return response.json();
};

export const checkIfTodayIsHoliday = async (countryCode: string): Promise<boolean> => {
  const response = await fetch(`${BASE_URL}/IsTodayPublicHoliday/${countryCode}`);
  return response.status === 200;
};

export const fetchNextPublicHolidays = async (countryCode: string): Promise<Holiday[]> => {
  const response = await fetch(`${BASE_URL}/NextPublicHolidays/${countryCode}`);
  if (!response.ok) throw new Error('Failed to fetch next holidays');
  return response.json();
};
