import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Splash from 'expo-splash-screen';
import SplashScreen from '../src/components/SplashScreen';
import { useStore } from '../src/store/useStore';
import { watchAuth } from '../src/services/authService';
import { startSync, stopSync } from '../src/services/syncService';
Splash.preventAutoHideAsync();
export default function Root() {
  const [done,setDone] = useState(false); const dark = useStore(s=>s.dark);
  useEffect(()=>{ Splash.hideAsync(); },[]);
  useEffect(()=>watchAuth(u=>{ if(u) startSync(u.uid).catch(e=>console.warn('[sync]',e)); else stopSync(); }),[]);
  if(!done) return <SplashScreen onDone={()=>setDone(true)} />;
  return <><StatusBar style={dark?'light':'dark'} /><Stack screenOptions={{headerShown:false}}>
    <Stack.Screen name="add-expense" options={{presentation:'modal'}} /></Stack></>;
}
