import { useState, useEffect } from 'react';

import { Country, Holiday, LongWeekend } from '../types/types';
import { 
  fetchPublicHolidays, 
  fetchAvailableCountries, 
  fetchLongWeekends,
  checkIfTodayIsHoliday,
  fetchNextPublicHolidays,
} from '../api/holidayApi';

export const useHolidayManager = (currentDate: Date) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('UA');
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [longWeekends, setLongWeekends] = useState<LongWeekend[]>([]);
  const [nextHolidays, setNextHolidays] = useState<Holiday[]>([]);
  const [isTodayHoliday, setIsTodayHoliday] = useState(false);

  const handleCountryChange = async (countryCode: string) => {
    try {
      const [
        holidaysData, 
        longWeekendsData, 
        nextHolidaysData, 
        todayHoliday
      ] = await Promise.all([
        fetchPublicHolidays(currentDate.getFullYear(), countryCode),
        fetchLongWeekends(currentDate.getFullYear(), countryCode),
        fetchNextPublicHolidays(countryCode),
        checkIfTodayIsHoliday(countryCode)
      ]);

      setHolidays(holidaysData);
      setLongWeekends(longWeekendsData);
      setNextHolidays(nextHolidaysData);
      setIsTodayHoliday(todayHoliday);
      setSelectedCountry(countryCode);
    } catch (error) {
      console.error('Помилка завантаження свят:', error);
    }
  };

  const isLongWeekend = (date: Date | null): boolean => {
    if (!date) return false;
    
    return longWeekends.some(weekend => {
      const start = new Date(weekend.startDate);
      const end = new Date(weekend.endDate);
      return date >= start && date <= end;
    });
  };

  const getHolidaysForDate = (date: Date | null) => {
    if (!date) return [];
    
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
  
    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      holidayDate.setHours(0, 0, 0, 0);
      return holidayDate.getTime() === targetDate.getTime();
    });
  };

  useEffect(() => {
    const loadHolidayData = async () => {
      try {
        const [
          holidaysData, 
          longWeekendsData, 
          nextHolidaysData, 
          todayHoliday
        ] = await Promise.all([
          fetchPublicHolidays(currentDate.getFullYear(), selectedCountry),
          fetchLongWeekends(currentDate.getFullYear(), selectedCountry),
          fetchNextPublicHolidays(selectedCountry),
          checkIfTodayIsHoliday(selectedCountry)
        ]);

        setHolidays(holidaysData);
        setLongWeekends(longWeekendsData);
        setNextHolidays(nextHolidaysData);
        setIsTodayHoliday(todayHoliday);
      } catch (error) {
        console.error('Failed to fetch holiday data:', error);
      }
    };

    loadHolidayData();
  }, [currentDate, selectedCountry]);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await fetchAvailableCountries();
        setCountries(data);
      } catch (error) {
        console.error('Failed to fetch countries:', error);
      }
    };
    loadCountries();
  }, []);

  return {
    countries,
    selectedCountry,
    holidays,
    longWeekends,
    nextHolidays,
    isTodayHoliday,
    handleCountryChange,
    isLongWeekend,
    getHolidaysForDate
  };
};