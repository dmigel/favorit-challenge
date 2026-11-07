import { Component } from 'react';

const INPUT_ID = 'part-number';

/**
 * Форма поиска производителей по номеру детали.
 * @extends {Component<{ initialValue?: string, onSubmit: (value: string) => void }, { value: string }>}
 */
class SearchForm extends Component {
  static defaultProps = {
    initialValue: '',
  };

  state = {
    value: this.props.initialValue,
  };

  /**
   * Синхронизирует локальное значение с пропом initialValue.
   * @param {{ initialValue?: string }} prevProps
   */
  componentDidUpdate(prevProps) {
    if (prevProps.initialValue !== this.props.initialValue) {
      this.setState({ value: this.props.initialValue });
    }
  }

  /**
   * Обновляет значение поля ввода.
   * @param {import('react').ChangeEvent<HTMLInputElement>} event
   */
  handleChange = (event) => {
    this.setState({ value: event.target.value });
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
    const isDisabled = value.trim() === '';

    return (
      <form role="search" className="mb-4" onSubmit={this.handleSubmit}>
        <label htmlFor={INPUT_ID} className="form-label">
          Номер детали
        </label>
        <div className="input-group input-group-lg">
          <input
            id={INPUT_ID}
            type="text"
            className="form-control"
            autoComplete="off"
            placeholder="Например, 0189"
            value={value}
            onChange={this.handleChange}
          />
          <button type="submit" className="btn btn-primary" disabled={isDisabled}>
            Найти
          </button>
        </div>
      </form>
    );
  }
}

export default SearchForm;
