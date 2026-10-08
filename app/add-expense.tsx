import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Btn } from '../src/components/ui';
import { useStore } from '../src/store/useStore';
import { useColors } from '../src/store/useColors';
import { CATEGORIES } from '../src/constants/categories';
const methods = ['Cash','Card','Mobile'];
export default function AddExpense() {
  const c = useColors(); const r = useRouter(); const add = useStore(s=>s.add);
  const [amount,setAmount] = useState(''); const [cat,setCat] = useState('food'); const [note,setNote] = useState('');
  const [date,setDate] = useState(new Date().toISOString().slice(0,10)); const [method,setMethod] = useState('Card');
  const save = () => { const a = parseFloat(amount); if(!a||a<=0) return;
    add({amount:a,categoryId:cat,note,date,method}); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    r.replace('/(tabs)/home'); };
  const inp = {backgroundColor:c.card,color:c.text,padding:14,borderRadius:12,marginBottom:14} as const;
  const chip = (on:boolean) => ({paddingHorizontal:14,paddingVertical:8,marginRight:8,marginBottom:8,borderRadius:20,overflow:'hidden',backgroundColor:on?c.primary:c.card,color:on?'#fff':c.text} as const);
  return <ScrollView style={{flex:1,backgroundColor:c.bg}} contentContainerStyle={{padding:20}}>
    <Text style={{color:c.text,fontSize:24,fontWeight:'800',marginBottom:16}}>New expense</Text>
    <TextInput autoFocus keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={c.sub} value={amount} onChangeText={setAmount} style={[inp,{fontSize:32,fontWeight:'800'}]}/>
    <View style={{flexDirection:'row',flexWrap:'wrap'}}>{CATEGORIES.map(x=><Text key={x.id} onPress={()=>setCat(x.id)} style={chip(cat===x.id)}>{x.name}</Text>)}</View>
    <TextInput placeholder="Note" placeholderTextColor={c.sub} value={note} onChangeText={setNote} style={[inp,{marginTop:8}]}/>
    <TextInput placeholder="YYYY-MM-DD" placeholderTextColor={c.sub} value={date} onChangeText={setDate} style={inp}/>
    <View style={{flexDirection:'row',marginBottom:16}}>{methods.map(m=><Text key={m} onPress={()=>setMethod(m)} style={chip(method===m)}>{m}</Text>)}</View>
    <Btn title="Save expense" onPress={save}/></ScrollView>; }
