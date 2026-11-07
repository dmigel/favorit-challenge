import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AsyncView from '../components/AsyncView.jsx';
import BrandList from '../components/BrandList.jsx';
import SearchForm from '../components/SearchForm.jsx';
import { useBrands } from '../hooks/useBrands.js';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback.js';
import {
  MIN_SEARCH_LENGTH,
  SEARCH_DEBOUNCE_MS,
} from '../utils/constants.js';

/**
 * Главная страница: поиск производителей по номеру детали (этап 1).
 */
function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const number = (searchParams.get('number') ?? '').trim();
  const { status, error, isEmpty, retry } = useBrands(number);

  const debouncedSearch = useDebouncedCallback((value) => {
    const next = value.trim();

    if (next === number) {
      return;
    }

    if (next === '') {
      setSearchParams({});
      return;
    }

    if (next.length < MIN_SEARCH_LENGTH) {
      return;
    }

    setSearchParams({ number: next }, { replace: number !== '' });
  }, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    debouncedSearch.cancel();
  }, [number, debouncedSearch]);

  /**
   * Обновляет номер в URL или повторяет запрос для текущего номера.
   * @param {string} next
   */
  function handleSubmit(next) {
    debouncedSearch.cancel();

    if (next === number) {
      retry();
    } else {
      setSearchParams({ number: next });
    }
  }

  return (
    <>
      <h1 className="h2">Поиск по номеру детали</h1>
      <p className="text-muted">
        Шаг 1 из 2: введите номер, затем выберите производителя
      </p>

      <SearchForm
        initialValue={number}
        onSubmit={handleSubmit}
        onChange={debouncedSearch}
        hint={`Поиск запустится сам после паузы в вводе (от ${MIN_SEARCH_LENGTH} символов) или по кнопке «Найти»`}
      />

      {number === '' ? (
        <p className="text-muted">
          Введите номер детали, чтобы увидеть производителей
        </p>
      ) : (
        <>
          <h2 className="h5">Производители для номера «{number}»</h2>
          <AsyncView
            status={status}
            error={error}
            isEmpty={isEmpty}
            onRetry={retry}
            loadingLabel="Ищем производителей…"
            emptyTitle="Ничего не найдено"
            emptyDescription={`По номеру «${number}» производители не найдены. Проверьте номер и попробуйте снова.`}
          >
            <BrandList number={number} />
          </AsyncView>
        </>
      )}
    </>
  );
}

export default HomePage;
