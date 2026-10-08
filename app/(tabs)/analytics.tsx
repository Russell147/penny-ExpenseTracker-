import React from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
import { Card, Empty } from '../../src/components/ui';
import { useStore } from '../../src/store/useStore';
import { useColors } from '../../src/store/useColors';
import { CATEGORIES } from '../../src/constants/categories';
import { thisMonth, byCategory, fmt } from '../../src/utils/helpers';
const charts = Platform.OS === 'web' ? null : require('react-native-gifted-charts');
export default function Analytics() {
  const c = useColors(); const { expenses, currency } = useStore(); const m = thisMonth(expenses); const bc = byCategory(m);
  const pie = CATEGORIES.filter(x=>bc[x.id]).map(x=>({value:bc[x.id],color:x.color,text:x.name}));
  const days = [...Array(7)].map((_,i)=>{ const d = new Date(Date.now()-(6-i)*864e5); const k = d.toISOString().slice(0,10);
    return {label:['S','M','T','W','T','F','S'][d.getDay()], value:expenses.filter(e=>e.date===k).reduce((s,e)=>s+e.amount,0), frontColor:c.primary}; });
  const maxCategory = Math.max(...pie.map(p=>p.value),1);
  const maxDay = Math.max(...days.map(d=>d.value),1);
  return <ScrollView style={{flex:1,backgroundColor:c.bg}} contentContainerStyle={{padding:20,paddingTop:60,paddingBottom:120}}>
    <Text style={{color:c.text,fontSize:26,fontWeight:'800',marginBottom:12}}>Analytics</Text>
    <Card><Text style={{color:c.text,fontWeight:'700',marginBottom:12}}>By category (this month)</Text>
      {pie.length? <View style={{alignItems:'center'}}>{charts ? <charts.PieChart data={pie} donut radius={90} innerRadius={55} innerCircleColor={c.card}/> :
        <View style={{width:'100%',marginBottom:8}}>{pie.map(p=><View key={p.text} style={{marginBottom:8}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:4}}><Text style={{color:c.text}}>{p.text}</Text><Text style={{color:c.text}}>{fmt(p.value,currency)}</Text></View>
          <View style={{height:8,backgroundColor:c.border,borderRadius:4}}><View style={{height:8,width:`${p.value/maxCategory*100}%`,backgroundColor:p.color,borderRadius:4}}/></View></View>)}</View>}
        {pie.map(p=><Text key={p.text} style={{color:p.color,marginTop:4}}>● {p.text}: {fmt(p.value,currency)}</Text>)}</View> : <Empty text="Add expenses to see charts."/>}</Card>
    <Card><Text style={{color:c.text,fontWeight:'700',marginBottom:12}}>Last 7 days</Text>
      {charts ? <charts.BarChart data={days} barWidth={24} noOfSections={3} yAxisTextStyle={{color:c.sub}} xAxisLabelTextStyle={{color:c.sub}} isAnimated hideRules/> :
        <View style={{height:130,flexDirection:'row',justifyContent:'space-around',alignItems:'flex-end'}}>{days.map((d,i)=><View key={i} style={{alignItems:'center',flex:1}}>
          <View style={{height:Math.max(d.value/maxDay*100,4),width:20,backgroundColor:c.primary,borderRadius:5}}/>
          <Text style={{color:c.sub,fontSize:12,marginTop:6}}>{d.label}</Text></View>)}</View>}</Card></ScrollView>; }
