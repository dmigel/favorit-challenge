import { combineReducers } from 'redux';
import brandsReducer from '../features/brands/reducer.js';
import offersReducer from '../features/offers/reducer.js';

/**
 * Корневой редьюсер приложения.
 */
const rootReducer = combineReducers({
  brands: brandsReducer,
  offers: offersReducer,
});

export default rootReducer;
