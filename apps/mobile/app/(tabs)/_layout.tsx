import { Tabs } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Icon, type IconName } from '@/icons';
import { colors, textVariants } from '@/theme';

/** Abas da navegação inferior, na ordem definida para o produto. */
const TABS: readonly { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'Início', icon: 'home' },
  { name: 'planner', title: 'Planejar', icon: 'planner' },
  { name: 'focus', title: 'Foco', icon: 'focus' },
  { name: 'insights', title: 'Insights', icon: 'insights' },
  { name: 'profile', title: 'Perfil', icon: 'profile' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: styles.scene,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textDim,
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) => (
              <Icon name={tab.icon} size={23} strokeWidth={focused ? 2 : 1.6} color={color} />
            ),
            tabBarLabel: ({ color, focused }) => (
              <Text
                style={[
                  focused ? textVariants.tabLabelActive : textVariants.tabLabel,
                  styles.label,
                  { color },
                ]}
              >
                {tab.title}
              </Text>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scene: {
    backgroundColor: colors.background,
  },
  tabBar: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    paddingTop: 8,
  },
  label: {
    marginTop: 4,
  },
});
