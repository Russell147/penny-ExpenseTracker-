import React, { useState } from 'react';
import { FlatList, Text, TextInput, View, Alert, ScrollView } from 'react-native';
import { ExpenseItem, Empty } from '../../src/components/ui';
import { useStore } from '../../src/store/useStore';
import { useColors } from '../../src/store/useColors';
import { CATEGORIES } from '../../src/constants/categories';
export default function Transactions() {
  const c = useColors(); const { expenses, remove } = useStore(); const [q,setQ] = useState(''); const [cat,setCat] = useState('');
  const list = expenses.filter(e=>(!cat||e.categoryId===cat)&&e.note.toLowerCase().includes(q.toLowerCase()));
  return <View style={{flex:1,backgroundColor:c.bg}}>
    <FlatList data={list} keyExtractor={e=>e.id} contentContainerStyle={{padding:20,paddingTop:60,paddingBottom:120,flexGrow:1}}
      ListHeaderComponent={<View>
        <Text style={{color:c.text,fontSize:26,fontWeight:'800'}}>Activity</Text>
        <TextInput placeholder="Search notes" placeholderTextColor={c.sub} value={q} onChangeText={setQ} style={{backgroundColor:c.card,color:c.text,padding:12,borderRadius:12,marginVertical:12}}/>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flexGrow:0,marginBottom:8}}>
          {[{id:'',name:'All'},...CATEGORIES].map(x=><Text key={x.id} onPress={()=>setCat(x.id)} style={{paddingHorizontal:14,paddingVertical:8,marginRight:8,borderRadius:20,overflow:'hidden',backgroundColor:cat===x.id?c.primary:c.card,color:cat===x.id?'#fff':c.text}}>{x.name}</Text>)}
        </ScrollView>
      </View>}
      ListEmptyComponent={<Empty text="Nothing here."/>}
      ListFooterComponent={list.length?<Text style={{color:c.sub,textAlign:'center',fontSize:12}}>Long-press an item to delete</Text>:null}
      renderItem={({item})=><ExpenseItem e={item} onLong={()=>Alert.alert('Delete expense?','',[{text:'Cancel'},{text:'Delete',style:'destructive',onPress:()=>remove(item.id)}])}/>}/></View>; }
