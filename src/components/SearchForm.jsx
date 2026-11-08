import { Component } from 'react';

const INPUT_ID = 'part-number';
const HINT_ID = 'part-number-hint';

/**
 * Форма поиска производителей по номеру детали.
 * @extends {Component<{
 *   initialValue?: string,
 *   onSubmit: (value: string) => void,
 *   onChange?: (value: string) => void,
 *   hint?: string
 * }, { value: string }>}
 */
class SearchForm extends Component {
  static defaultProps = {
    initialValue: '',
  };

  state = {
    value: this.props.initialValue,
  };

  /**
   * Синхронизирует локальное значение с пропом initialValue,
   * не затирая ввод пользователя с тем же trim и завершающим пробелом.
   * @param {{ initialValue?: string }} prevProps
   */
  componentDidUpdate(prevProps) {
    if (
      prevProps.initialValue !== this.props.initialValue &&
      this.state.value.trim() !== this.props.initialValue
    ) {
      this.setState({ value: this.props.initialValue });
    }
  }

  /**
   * Обновляет значение поля ввода и уведомляет родителя (если задан onChange).
   * @param {import('react').ChangeEvent<HTMLInputElement>} event
   */
  handleChange = (event) => {
    const value = event.target.value;
    this.setState({ value });
    this.props.onChange?.(value);
  };

  /**
   * Отправляет обрезанный номер детали родителю.
   * @param {import('react').FormEvent<HTMLFormElement>} event
   */
  handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = this.state.value.trim();
    if (trimmed) {
      this.props.onSubmit(trimmed);
    }
  };

  render() {
    const { value } = this.state;
    const { hint } = this.props;
    const isDisabled = value.trim() === '';

    return (
      <form role="search" className="mb-4" onSubmit={this.handleSubmit}>
        <label htmlFor={INPUT_ID} className="form-label">
          Номер детали
        </label>
        <div className="input-group input-group-lg search-group">
          <input
            id={INPUT_ID}
            type="text"
            className="form-control"
            autoComplete="off"
            placeholder="Например, 0189"
            value={value}
            onChange={this.handleChange}
            aria-describedby={hint ? HINT_ID : undefined}
          />
          <button type="submit" className="btn btn-primary" disabled={isDisabled}>
            Найти
          </button>
        </div>
        {hint ? (
          <div id={HINT_ID} className="form-text">
            {hint}
          </div>
        ) : null}
      </form>
    );
  }
}

export default SearchForm;
