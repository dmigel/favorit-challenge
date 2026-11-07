import { useSearchParams } from 'react-router-dom';
import AsyncView from '../components/AsyncView.jsx';
import BrandList from '../components/BrandList.jsx';
import SearchForm from '../components/SearchForm.jsx';
import { useBrands } from '../hooks/useBrands.js';

/**
 * Главная страница: поиск производителей по номеру детали (этап 1).
 */
function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const number = (searchParams.get('number') ?? '').trim();
  const { status, error, isEmpty, retry } = useBrands(number);

  /**
   * Обновляет номер в URL или повторяет запрос для текущего номера.
   * @param {string} next
   */
  function handleSubmit(next) {
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

      <SearchForm initialValue={number} onSubmit={handleSubmit} />

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
