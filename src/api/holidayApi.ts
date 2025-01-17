import {Country, Holiday, LongWeekend, CountryInfo} from '../types/types';

const BASE_URL = 'https://date.nager.at/api/v3';

const handleFetch = async <T>(url: string, retries = 3): Promise<T> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === retries) {
        throw new Error(`Failed to fetch data after ${retries} attempts.`);
      }
    }
  }
  throw new Error('Unexpected error');
};

export const fetchCountryInfo = async (countryCode: string): Promise<CountryInfo> => {
  return handleFetch<CountryInfo>(`${BASE_URL}/CountryInfo/${countryCode}`);
};

export const fetchAvailableCountries = async (): Promise<Country[]> => {
  return handleFetch<Country[]>(`${BASE_URL}/AvailableCountries`);
};

export const fetchLongWeekends = async (year: number, countryCode: string): Promise<LongWeekend[]> => {
  return handleFetch<LongWeekend[]>(`${BASE_URL}/LongWeekend/${year}/${countryCode}`);
};

export const fetchPublicHolidays = async (year: number, countryCode: string): Promise<Holiday[]> => {
  return handleFetch<Holiday[]>(`${BASE_URL}/PublicHolidays/${year}/${countryCode}`);
};

export const checkIfTodayIsHoliday = async (countryCode: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/IsTodayPublicHoliday/${countryCode}`);
    return response.status === 200;
  } catch (error) {
    console.error('Error checking if today is a holiday:', error);
    return false;
  }
};

export const fetchNextPublicHolidays = async (countryCode: string): Promise<Holiday[]> => {
  return handleFetch<Holiday[]>(`${BASE_URL}/NextPublicHolidays/${countryCode}`);
};