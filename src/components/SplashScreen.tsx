import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
export default function SplashScreen({ onDone }:{ onDone:()=>void }) {
  const o = useRef(new Animated.Value(0)).current, s = useRef(new Animated.Value(0.7)).current;
  useEffect(()=>{ Animated.parallel([Animated.timing(o,{toValue:1,duration:700,useNativeDriver:true}),Animated.spring(s,{toValue:1,useNativeDriver:true})]).start();
    const t = setTimeout(onDone,1800); return ()=>clearTimeout(t); },[]);
  return (<LinearGradient colors={['#0F766E','#115E59']} style={st.c}>
    <Animated.View style={{opacity:o,transform:[{scale:s}],alignItems:'center'}}>
      <Ionicons name="wallet" size={84} color="#F5B83D" />
      <Text style={st.t}>PennyWise</Text><Text style={st.s}>Spend smart. Save more.</Text>
    </Animated.View></LinearGradient>);
}
const st = StyleSheet.create({c:{flex:1,alignItems:'center',justifyContent:'center'},t:{color:'#fff',fontSize:38,fontWeight:'800',marginTop:12},s:{color:'#CFE9E5',marginTop:6}});
