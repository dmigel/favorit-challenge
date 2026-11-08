import { Component } from 'react';
import ErrorAlert from './ErrorAlert.jsx';

/**
 * Граница ошибок: ловит сбои рендера дочерних компонентов.
 * @extends {Component<{ children: import('react').ReactNode }, { hasError: boolean }>}
 */
class ErrorBoundary extends Component {
  state = { hasError: false };

  /**
   * Переводит границу в состояние ошибки.
   * @returns {{ hasError: boolean }}
   */
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  /**
   * Логирует ошибку рендера.
   * @param {Error} error
   * @param {import('react').ErrorInfo} info
   */
  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info?.componentStack);
  }

  /**
   * Сбрасывает состояние ошибки.
   */
  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorAlert
          title="Что-то пошло не так"
          message="Произошла непредвиденная ошибка интерфейса."
          onRetry={this.handleReset}
          retryLabel="Попробовать снова"
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
