import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="characters" />
      <Stack.Screen name="lobby" />
      <Stack.Screen name="game" />
      <Stack.Screen name="victory" />
      <Stack.Screen name="shop" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="leaderboard" />
      <Stack.Screen name="missions" />
    </Stack>
  );
}
