import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Btn } from '../src/components/ui';
import { useColors } from '../src/store/useColors';
import { useStore } from '../src/store/useStore';
import {
  authErrorMessage,
  continueAsGuest,
  resetPassword,
  signInWithEmail,
  signUpWithEmail,
} from '../src/services/authService';
import { isFirebaseConfigured, NOT_CONFIGURED_MESSAGE } from '../src/services/firebase';

export default function SignIn() {
  const c = useColors();
  const router = useRouter();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  const goNext = () => router.replace(useStore.getState().onboarded ? '/(tabs)/home' : '/onboarding');

  const submit = async () => {
    if (busy) return;
    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Enter your email and password.');
      return;
    }
    if (!isFirebaseConfigured) {
      Alert.alert('Not set up yet', NOT_CONFIGURED_MESSAGE);
      return;
    }
    setBusy(true);
    try {
      if (mode === 'in') await signInWithEmail(email, password);
      else await signUpWithEmail(email, password);
      goNext();
    } catch (e) {
      Alert.alert(mode === 'in' ? 'Sign-in failed' : 'Sign-up failed', authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const forgotPassword = async () => {
    if (busy) return;
    if (!email.trim()) {
      Alert.alert('Enter your email', 'Type your email above first, then tap “Forgot password?”.');
      return;
    }
    if (!isFirebaseConfigured) {
      Alert.alert('Not set up yet', NOT_CONFIGURED_MESSAGE);
      return;
    }
    setBusy(true);
    try {
      await resetPassword(email);
      Alert.alert('Reset email sent', 'Check your inbox for a password reset link.');
    } catch (e) {
      Alert.alert('Could not send email', authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const asGuest = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await continueAsGuest();
    } catch (e) {
      Alert.alert('Guest mode failed', authErrorMessage(e));
      setBusy(false);
      return;
    }
    setBusy(false);
    router.replace('/onboarding');
  };

  const inputStyle = {
    flex: 1,
    color: c.text,
    paddingVertical: 14,
    fontSize: 16,
  } as const;
  const fieldStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: c.card,
    borderColor: c.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginTop: 8,
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, paddingVertical: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: 'center', marginBottom: 36 }}>
          <Image
            source={require('../assets/logo-transparent.png')}
            accessibilityLabel="PennyWise logo"
            style={{ width: 88, height: 88 }}
          />
          <Text style={{ color: c.text, fontSize: 30, fontWeight: '900', marginTop: 10 }}>PennyWise</Text>
          <Text style={{ color: c.sub, fontSize: 16, marginTop: 8, textAlign: 'center' }}>
            Sign in to make every penny count.
          </Text>
        </View>

        <Text style={{ color: c.text, fontSize: 28, fontWeight: '800' }}>
          {mode === 'in' ? 'Welcome back' : 'Create your account'}
        </Text>
        <Text style={{ color: c.sub, marginTop: 6, marginBottom: 24 }}>
          {mode === 'in'
            ? 'Sign in to continue to your account.'
            : 'Your expenses and budgets sync securely across your devices.'}
        </Text>

        <Text style={{ color: c.text, fontWeight: '700' }}>Email</Text>
        <View style={fieldStyle}>
          <Ionicons name="mail-outline" size={20} color={c.sub} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={c.sub}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            style={[inputStyle, { marginLeft: 10 }]}
            accessibilityLabel="Email"
          />
        </View>

        <Text style={{ color: c.text, fontWeight: '700', marginTop: 18 }}>Password</Text>
        <View style={fieldStyle}>
          <Ionicons name="lock-closed-outline" size={20} color={c.sub} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={mode === 'in' ? 'Enter your password' : 'At least 6 characters'}
            placeholderTextColor={c.sub}
            secureTextEntry={!passwordVisible}
            autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
            textContentType={mode === 'in' ? 'password' : 'newPassword'}
            style={[inputStyle, { marginLeft: 10 }]}
            accessibilityLabel="Password"
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(visible => !visible)}
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
            hitSlop={10}
          >
            <Ionicons name={passwordVisible ? 'eye-off-outline' : 'eye-outline'} size={20} color={c.sub} />
          </TouchableOpacity>
        </View>

        {mode === 'in' && (
          <TouchableOpacity onPress={forgotPassword} style={{ alignSelf: 'flex-end', marginTop: 14 }}>
            <Text style={{ color: c.primary, fontWeight: '700' }}>Forgot password?</Text>
          </TouchableOpacity>
        )}

        {busy ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: 30 }} />
        ) : (
          <Btn title={mode === 'in' ? 'Sign in' : 'Create account'} onPress={submit} style={{ marginTop: 24 }} />
        )}

        <TouchableOpacity
          onPress={() => setMode(mode === 'in' ? 'up' : 'in')}
          style={{ alignItems: 'center', paddingVertical: 14 }}
          accessibilityRole="button"
        >
          <Text style={{ color: c.sub }}>
            {mode === 'in' ? 'New here? ' : 'Already have an account? '}
            <Text style={{ color: c.primary, fontWeight: '700' }}>
              {mode === 'in' ? 'Create an account' : 'Sign in'}
            </Text>
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12 }}>
          <View style={{ height: 1, flex: 1, backgroundColor: c.border }} />
          <Text style={{ color: c.sub, marginHorizontal: 14 }}>or</Text>
          <View style={{ height: 1, flex: 1, backgroundColor: c.border }} />
        </View>

        <TouchableOpacity
          onPress={asGuest}
          disabled={busy}
          style={{ alignItems: 'center', padding: 14, borderRadius: 14, borderColor: c.border, borderWidth: 1 }}
          accessibilityRole="button"
        >
          <Text style={{ color: c.text, fontWeight: '700', fontSize: 16 }}>Continue as guest</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
