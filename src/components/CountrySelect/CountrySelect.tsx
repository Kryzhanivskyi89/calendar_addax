
import { useState, useEffect } from 'react';
import styles from './style.module.css';
import {Country} from '../../types/types';
import { fetchAvailableCountries } from '../../api/holidayApi';

type CountrySelectProps = {
  onCountryChange: (countryCode: string) => void;
  defaultCountry?: string;
};

const CountrySelect: React.FC<CountrySelectProps> = ({ 
  onCountryChange, 
  defaultCountry = 'UA' 
}) => {

  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await fetchAvailableCountries();
        setCountries(data);
      } catch (error) {
        console.error('Помилка завантаження країн:', error);
      }
    };
    loadCountries();
  }, []);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);
    onCountryChange(newCountry);
  };

  return (
    <select 
      value={selectedCountry}
      onChange={handleCountryChange}
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