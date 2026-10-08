import React, { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Btn } from '../src/components/ui';
import { useStore } from '../src/store/useStore';
import { useColors } from '../src/store/useColors';
const slides = [{i:'create',t:'Log in seconds',d:'Add an expense in under 10 seconds.'},{i:'pie-chart',t:'See where it goes',d:'Charts and budgets reveal your habits.'},{i:'sparkles',t:'Ask Penny AI',d:'Chat about your spending or add expenses by typing.'}];
const currencies = ['$','€','£','R','₦','KSh'];
export default function Onboarding() {
  const [i,setI] = useState(0); const r = useRouter(); const c = useColors(); const set = useStore(s=>s.set); const cur = useStore(s=>s.currency);
  const picking = i===slides.length;
  const finish = () => { set({onboarded:true}); r.replace('/(tabs)/home'); };
  return <ScrollView style={{flex:1,backgroundColor:c.bg}} contentContainerStyle={{flexGrow:1,padding:28,justifyContent:'center'}}>
    {!picking ? <View style={{alignItems:'center',marginBottom:40}}><Ionicons name={slides[i].i as any} size={96} color={c.primary}/>
      <Text style={{color:c.text,fontSize:28,fontWeight:'800',marginTop:20}}>{slides[i].t}</Text>
      <Text style={{color:c.sub,textAlign:'center',marginTop:8}}>{slides[i].d}</Text></View>
    : <View style={{marginBottom:30}}><Text style={{color:c.text,fontSize:26,fontWeight:'800',marginBottom:16}}>Choose your currency</Text>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>{currencies.map(x=><Text key={x} onPress={()=>set({currency:x})} style={{padding:14,borderRadius:12,overflow:'hidden',backgroundColor:cur===x?c.primary:c.card,color:cur===x?'#fff':c.text,fontWeight:'700'}}>{x}</Text>)}</View></View>}
    <Btn title={picking?'Get started':'Next'} onPress={()=>picking?finish():setI(i+1)} /></ScrollView>;
}
