import { Redirect } from 'expo-router';
import { useStore } from '../src/store/useStore';
export default function Index() { const ob = useStore(s=>s.onboarded); return <Redirect href={ob?'/(tabs)/home':'/sign-in'} />; }
