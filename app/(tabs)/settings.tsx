import React, { useEffect, useState } from 'react';
import { ScrollView, Text, Switch, View, Alert, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Btn } from '../../src/components/ui';
import { useStore } from '../../src/store/useStore';
import { useColors } from '../../src/store/useColors';
import { authErrorMessage, signOut, watchAuth, type AuthUser } from '../../src/services/authService';
import { isFirebaseConfigured } from '../../src/services/firebase';

const SettingRow = ({ label, value, onValueChange, helper }: { label: string; value: boolean; onValueChange: (v: boolean) => void; helper?: string }) => {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
      <View style={{ flex: 1, marginRight: 16 }}>
        <Text style={{ color: c.text, fontWeight: '700', fontSize: 16 }}>{label}</Text>
        {helper ? <Text style={{ color: c.sub, fontSize: 12, marginTop: 4 }}>{helper}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
};

export default function Settings() {
  const c = useColors();
  const r = useRouter();
  const { dark, expenses, currency, notifications, budgetAlerts, biometricLock, quickAdd, set, reset, clearSynced } = useStore();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => watchAuth(setUser), []);

  const doSignOut = () =>
    Alert.alert('Sign out?', 'Your data stays safe in your account and will be removed from this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            clearSynced();
          } catch (e) {
            Alert.alert('Sign out failed', authErrorMessage(e));
          }
        },
      },
    ]);

  const exportCsv = () => Share.share({
    message: ['date,category,amount,note,method', ...expenses.map(e => `${e.date},${e.categoryId},${e.amount},"${e.note}",${e.method}`)].join('\n'),
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 120 }}>
      <Text style={{ color: c.text, fontSize: 26, fontWeight: '800', marginBottom: 12 }}>Settings</Text>

      {isFirebaseConfigured && (
        <Card>
          <Text style={{ color: c.text, fontWeight: '800', marginBottom: 6 }}>
            {user && !user.isAnonymous ? 'Account' : user ? 'Guest account' : 'Backup & sync'}
          </Text>
          {user && !user.isAnonymous ? (
            <>
              <Text style={{ color: c.text, marginBottom: 4 }}>{user.email}</Text>
              <Text style={{ color: c.sub, fontSize: 12, marginBottom: 12 }}>
                Your expenses and budgets sync across your devices.
              </Text>
              <Btn title="Sign out" style={{ backgroundColor: c.danger }} onPress={doSignOut} />
            </>
          ) : user ? (
            <>
              <Text style={{ color: c.sub, fontSize: 12, marginBottom: 12 }}>
                You're using PennyWise without an account. Create one to keep your data backed up.
              </Text>
              <Btn title="Create account" onPress={() => r.push('/sign-in')} />
            </>
          ) : (
            <>
              <Text style={{ color: c.sub, fontSize: 12, marginBottom: 12 }}>
                Sign in to back up your expenses and use them on all your devices.
              </Text>
              <Btn title="Sign in" onPress={() => r.push('/sign-in')} />
            </>
          )}
        </Card>
      )}

      <Card>
        <Text style={{ color: c.text, fontWeight: '800', marginBottom: 10 }}>Appearance</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: c.text }}>Dark mode</Text>
          <Switch value={dark} onValueChange={v => set({ dark: v })} />
        </View>
      </Card>

      <Card>
        <Text style={{ color: c.text, fontWeight: '800', marginBottom: 10 }}>Preferences</Text>
        <SettingRow label="Push notifications" value={notifications} onValueChange={v => set({ notifications: v })} helper="Receive expense reminders and updates." />
        <SettingRow label="Budget alerts" value={budgetAlerts} onValueChange={v => set({ budgetAlerts: v })} helper="Warn when you are near or over budget." />
        <SettingRow label="Quick add" value={quickAdd} onValueChange={v => set({ quickAdd: v })} helper="Use faster entry defaults for new expenses." />
      </Card>

      <Card>
        <Text style={{ color: c.text, fontWeight: '800', marginBottom: 10 }}>Privacy & security</Text>
        <SettingRow label="Biometric lock" value={biometricLock} onValueChange={v => set({ biometricLock: v })} helper="Lock the app with Face ID or fingerprint." />
      </Card>

      <Card>
        <Text style={{ color: c.text, marginBottom: 8, fontWeight: '800' }}>Currency</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {['$', '€', '£', 'R', '₦', 'KSh'].map(x => (
            <Text
              key={x}
              onPress={() => set({ currency: x })}
              style={{
                padding: 10,
                borderRadius: 10,
                overflow: 'hidden',
                backgroundColor: currency === x ? c.primary : c.bg,
                color: currency === x ? '#fff' : c.text,
                fontWeight: '700',
              }}
            >
              {x}
            </Text>
          ))}
        </View>
      </Card>

      <Btn title="Export CSV" onPress={exportCsv} style={{ marginBottom: 12 }} />
      <Btn
        title="Clear all data"
        style={{ backgroundColor: c.danger }}
        onPress={() =>
          Alert.alert('Clear all data?', 'This cannot be undone.', [
            { text: 'Cancel' },
            { text: 'Clear', style: 'destructive', onPress: reset },
          ])
        }
      />
    </ScrollView>
  );
}
