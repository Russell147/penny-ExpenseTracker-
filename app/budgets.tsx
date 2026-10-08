import React from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../src/components/ui';
import { useStore } from '../src/store/useStore';
import { useColors } from '../src/store/useColors';
import { CATEGORIES } from '../src/constants/categories';
import { thisMonth, byCategory, fmt } from '../src/utils/helpers';
export default function Budgets() {
  const c = useColors(); const r = useRouter(); const { budget, catBudgets, expenses, currency, set } = useStore(); const bc = byCategory(thisMonth(expenses));
  const inp = {backgroundColor:c.bg,color:c.text,padding:8,borderRadius:8,minWidth:80,textAlign:'right'} as const;
  const goBack = () => r.replace('/(tabs)/home');
  return <ScrollView style={{flex:1,backgroundColor:c.bg}} contentContainerStyle={{padding:20,paddingTop:60}}>
    <Text onPress={goBack} style={{color:c.primary,fontWeight:'700'}}>← Back</Text>
    <Text style={{color:c.text,fontSize:26,fontWeight:'800',marginVertical:12}}>Budgets</Text>
    <Card><View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}><Text style={{color:c.text,fontWeight:'700'}}>Monthly total</Text>
      <TextInput keyboardType="decimal-pad" defaultValue={String(budget)} onEndEditing={e=>set({budget:parseFloat(e.nativeEvent.text)||budget})} style={inp}/></View></Card>
    {CATEGORIES.map(x=>{ const lim = catBudgets[x.id]; const sp = bc[x.id]||0; const over = lim && sp>=lim; const near = lim && sp>=lim*0.8;
      return <Card key={x.id}><View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
        <View><Text style={{color:c.text,fontWeight:'600'}}>{x.name}</Text><Text style={{color:over?c.danger:near?c.accent:c.sub,fontSize:12}}>{fmt(sp,currency)} spent{over?' · over limit':near?' · 80%+ used':''}</Text></View>
        <TextInput keyboardType="decimal-pad" placeholder="Limit" placeholderTextColor={c.sub} defaultValue={lim?String(lim):''} onEndEditing={e=>set({catBudgets:{...catBudgets,[x.id]:parseFloat(e.nativeEvent.text)||0}})} style={inp}/></View></Card>; })}</ScrollView>; }
