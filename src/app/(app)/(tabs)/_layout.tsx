import { THEME } from '@/config/theme';
import { Tabs } from 'expo-router';
import { CalendarCheck, Compass, PlusCircle, User as UserIcon, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: THEME.colors.surface },
        headerTintColor: THEME.colors.text,
        tabBarStyle: {
          backgroundColor: THEME.colors.surface,
          borderTopColor: THEME.colors.surfaceBorder,
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 6,
        },
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: THEME.colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="mis-partidos"
        options={{
          title: 'Mis Partidos',
          tabBarIcon: ({ color, size }) => <CalendarCheck color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="crear-partido"
        options={{
          title: 'Crear',
          tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="jugadores"
        options={{
          title: 'Jugadores',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <UserIcon color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}