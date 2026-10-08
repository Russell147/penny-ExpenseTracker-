import React from 'react';
import { View, Text, TouchableOpacity, ViewProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../store/useColors';
import { CATEGORIES } from '../constants/categories';
import { Expense } from '../types';
import { useStore } from '../store/useStore';
import { fmt } from '../utils/helpers';
export const Card = ({style,...p}:ViewProps) => { const c = useColors(); return <View {...p} style={[{backgroundColor:c.card,borderRadius:20,padding:16,marginBottom:12},style]} />; };
export const Btn = ({title,onPress,style}:{title:string;onPress:()=>void;style?:any}) => { const c = useColors();
  return <TouchableOpacity onPress={onPress} style={[{backgroundColor:c.primary,padding:15,borderRadius:14,alignItems:'center'},style]}><Text style={{color:'#fff',fontWeight:'700',fontSize:16}}>{title}</Text></TouchableOpacity>; };
export const ExpenseItem = ({e,onLong}:{e:Expense;onLong?:()=>void}) => { const c = useColors(); const cur = useStore(s=>s.currency);
  const cat = CATEGORIES.find(x=>x.id===e.categoryId) || CATEGORIES[0];
  return <TouchableOpacity onLongPress={onLong} style={{flexDirection:'row',alignItems:'center',paddingVertical:10}}>
    <View style={{backgroundColor:cat.color+'22',padding:10,borderRadius:14}}><Ionicons name={cat.icon as any} size={20} color={cat.color} /></View>
    <View style={{flex:1,marginLeft:12}}><Text style={{color:c.text,fontWeight:'600'}}>{e.note||cat.name}</Text><Text style={{color:c.sub,fontSize:12}}>{cat.name} · {e.date}</Text></View>
    <Text style={{color:c.text,fontWeight:'700'}}>-{fmt(e.amount,cur)}</Text></TouchableOpacity>; };
export const Empty = ({text}:{text:string}) => { const c = useColors(); return <View style={{alignItems:'center',padding:32}}><Ionicons name="leaf-outline" size={48} color={c.sub}/><Text style={{color:c.sub,marginTop:8,textAlign:'center'}}>{text}</Text></View>; };
