import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../src/store/useColors';
const icons:any = {home:'home',transactions:'list',analytics:'pie-chart',assistant:'sparkles',settings:'settings'};
export default function Layout() { const c = useColors(); const r = useRouter();
  return <View style={{flex:1}}><Tabs screenOptions={({route})=>({headerShown:false,tabBarActiveTintColor:c.primary,tabBarStyle:{backgroundColor:c.card,borderTopColor:c.border},
    tabBarIcon:({color,size})=><Ionicons name={icons[route.name]} size={size} color={color}/>})}>
    <Tabs.Screen name="home" options={{title:'Home'}}/><Tabs.Screen name="transactions" options={{title:'Activity'}}/>
    <Tabs.Screen name="analytics" options={{title:'Analytics'}}/><Tabs.Screen name="assistant" options={{title:'Penny AI'}}/>
    <Tabs.Screen name="settings" options={{title:'Settings'}}/></Tabs>
    <TouchableOpacity onPress={()=>r.push('/add-expense')} style={{position:'absolute',bottom:70,alignSelf:'center',backgroundColor:c.accent,width:58,height:58,borderRadius:29,alignItems:'center',justifyContent:'center',elevation:6}}>
      <Ionicons name="add" size={32} color="#10231F"/></TouchableOpacity></View>; }
