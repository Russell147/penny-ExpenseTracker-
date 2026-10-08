import React, { useState, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../src/store/useStore';
import { useColors } from '../../src/store/useColors';
import { askAI } from '../../src/services/aiService';
const prompts = ['How much did I spend on food this month?','Where did I overspend?','Give me a savings tip','Spent 12 on lunch yesterday'];
export default function Assistant() {
  const c = useColors(); const { chat, pushChat, expenses, budget, currency, add } = useStore(); const [text,setText] = useState(''); const [busy,setBusy] = useState(false); const ref = useRef<FlatList>(null);
  const send = async (q:string) => { if(!q.trim()||busy) return; setText(''); setBusy(true);
    pushChat({id:Date.now()+'u',role:'user',content:q});
    try { const res = await askAI(q,expenses,budget,currency);
      if(res.expense) add({amount:res.expense.amount,categoryId:res.expense.categoryId,note:res.expense.note,date:res.expense.date,method:'Card'});
      pushChat({id:Date.now()+'a',role:'assistant',content:res.reply});
    } catch { pushChat({id:Date.now()+'e',role:'assistant',content:"Sorry, I can't reach the AI right now. Check your connection and try again."}); }
    setBusy(false); };
  return <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1,backgroundColor:c.bg,paddingTop:60}}>
    <Text style={{color:c.text,fontSize:26,fontWeight:'800',paddingHorizontal:20}}>Penny AI</Text>
    <Text style={{color:c.sub,fontSize:11,paddingHorizontal:20,marginBottom:8}}>Not financial advice. Only a summary of your spending is shared to answer.</Text>
    <FlatList ref={ref} data={chat} keyExtractor={m=>m.id} onContentSizeChange={()=>ref.current?.scrollToEnd()} contentContainerStyle={{padding:16}}
      ListEmptyComponent={<View>{prompts.map(p=><Text key={p} onPress={()=>send(p)} style={{backgroundColor:c.card,color:c.text,padding:14,borderRadius:14,marginBottom:8,overflow:'hidden'}}>{p}</Text>)}</View>}
      renderItem={({item})=><View style={{alignSelf:item.role==='user'?'flex-end':'flex-start',maxWidth:'82%',backgroundColor:item.role==='user'?c.primary:c.card,padding:12,borderRadius:16,marginBottom:8}}>
        <Text style={{color:item.role==='user'?'#fff':c.text}}>{item.content}</Text></View>}/>
    {busy && <ActivityIndicator color={c.primary} style={{marginBottom:6}}/>}
    <View style={{flexDirection:'row',padding:12,paddingBottom:90,alignItems:'center'}}>
      <TextInput value={text} onChangeText={setText} placeholder="Ask or add an expense…" placeholderTextColor={c.sub} onSubmitEditing={()=>send(text)} style={{flex:1,backgroundColor:c.card,color:c.text,padding:12,borderRadius:22}}/>
      <TouchableOpacity onPress={()=>send(text)} style={{marginLeft:8,backgroundColor:c.primary,padding:12,borderRadius:22}}><Ionicons name="send" size={18} color="#fff"/></TouchableOpacity></View></KeyboardAvoidingView>; }
