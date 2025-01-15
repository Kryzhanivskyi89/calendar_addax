
import { useState, useEffect } from 'react';
import styles from './style.module.css';
import {Country} from '../../types/types';
import { fetchAvailableCountries } from '../../api/holidayApi';

const CountrySelect = () => {
const [selectedCountry, setSelectedCountry] = useState('UA');
const [countries, setCountries] = useState<Country[]>([]);

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

  return (
        <select 
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className={styles.countrySelect}
          >
            {countries.map(country => (
              <option key={country.countryCode} value={country.countryCode}>
                {country.name}
              </option>
            ))}
          </select>
  
)
}

export default CountrySelect;