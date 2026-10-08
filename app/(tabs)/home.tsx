import React, { useEffect, useRef } from 'react';
import { Animated, Image, Platform, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, ExpenseItem, Empty } from '../../src/components/ui';
import { useStore } from '../../src/store/useStore';
import { useColors } from '../../src/store/useColors';
import { thisMonth, total, fmt } from '../../src/utils/helpers';
export default function Home() {
  const c = useColors(); const r = useRouter(); const { expenses, budget, currency } = useStore();
  const logoMotion = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoMotion, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(logoMotion, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [logoMotion]);
  const spent = total(thisMonth(expenses)); const pct = Math.min(spent/budget,1);
  const warn = pct>=1 ? 'You have exceeded your budget!' : pct>=0.8 ? "You've used over 80% of your budget." : '';
  return <ScrollView style={{flex:1,backgroundColor:c.bg}} contentContainerStyle={{padding:20,paddingTop:60,paddingBottom:120}}>
    <View style={{flexDirection:'row',alignItems:'center',marginBottom:16}}>
      <Animated.View style={{transform:[{translateY:logoMotion.interpolate({inputRange:[0,1],outputRange:[0,-5]})}]}}>
        <Image source={require('../../assets/logo-transparent.png')} accessibilityLabel="PennyWise logo" style={{width:64,height:64}} />
      </Animated.View>
      <Animated.View style={{transform:[{translateY:logoMotion.interpolate({inputRange:[0,1],outputRange:[0,-5]})}]}}>
        <Text style={{color:c.primary,fontSize:28,fontWeight:'900',fontFamily:Platform.select({ios:'AvenirNext-Heavy',android:'sans-serif-rounded',web:'Arial Rounded MT Bold'}),letterSpacing:-0.5,marginLeft:12}}>PennyWise</Text>
      </Animated.View>
    </View>
    <Card style={{backgroundColor:c.primary}}><Text style={{color:'#CFE9E5'}}>Spent this month</Text>
      <Text style={{color:'#fff',fontSize:36,fontWeight:'800'}}>{fmt(spent,currency)}</Text>
      <View style={{height:8,backgroundColor:'#ffffff33',borderRadius:4,marginTop:12}}><View style={{height:8,width:`${pct*100}%`,backgroundColor:pct>=1?'#F87171':c.accent,borderRadius:4}}/></View>
      <Text style={{color:'#CFE9E5',marginTop:8}}>of {fmt(budget,currency)} budget</Text>
      {!!warn && <Text style={{color:c.accent,marginTop:6,fontWeight:'700'}}>{warn}</Text>}</Card>
    <Text onPress={()=>r.push('/budgets')} style={{color:c.primary,fontWeight:'700',marginBottom:12}}>Manage budgets →</Text>
    <Text style={{color:c.text,fontWeight:'700',fontSize:18,marginBottom:8}}>Recent</Text>
    <Card>{expenses.length? expenses.slice(0,5).map(e=><ExpenseItem key={e.id} e={e}/>) : <Empty text="No expenses yet. Tap + to add your first."/>}</Card>
  </ScrollView>; }
