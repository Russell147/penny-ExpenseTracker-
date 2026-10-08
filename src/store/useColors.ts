import { useStore } from './useStore';
import { light, dark } from '../theme/colors';
export const useColors = () => (useStore(s=>s.dark) ? dark : light);
