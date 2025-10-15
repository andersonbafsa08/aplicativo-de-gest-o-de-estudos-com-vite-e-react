import { useState, useEffect } from 'react';

/**
 * Custom hook to persist state in localStorage.
 * @param key The key to use for localStorage.
 * @param initialValue The initial value if nothing is found in localStorage.
 * @returns A tuple containing the stored value and a setter function.
 */
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Erro ao ler localStorage para a chave “' + key + '”:', error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error('Erro ao escrever localStorage para a chave “' + key + '”:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
