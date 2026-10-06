import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { AppState, StyleSheet } from 'react-native';

import {
  AppText,
  Button,
  Card,
  Checkbox,
  EmptyState,
  IconButton,
  ListRow,
  Screen,
  ScreenHeader,
  TextField,
} from '@/components';
import { useBlockedApps, type InstalledApp } from '@/state';
import { spacing } from '@/theme';

/** Escolha dos aplicativos que ficam barrados enquanto a sessão corre. */
export function BlockedAppsScreen() {
  const router = useRouter();
  const { packages, available, hasPermission, openSettings, listApps, toggle } = useBlockedApps();

  const [apps, setApps] = useState<readonly InstalledApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [granted, setGranted] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    let active = true;

    void listApps().then((list) => {
      if (!active) return;
      setApps(list);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [listApps]);

  // A permissão é concedida nos ajustes do sistema, fora daqui. Reler a cada
  // volta ao primeiro plano é o que faz o aviso sumir assim que ela é dada.
  useEffect(() => {
    const ler = () => setGranted(hasPermission());

    ler();
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') ler();
    });

    return () => subscription.remove();
  }, [hasPermission]);

  const visible = useMemo(() => {
    const termo = filter.trim().toLowerCase();
    if (termo === '') return apps;
    return apps.filter((app) => app.label.toLowerCase().includes(termo));
  }, [apps, filter]);

  const fechar = (
    <IconButton name="close" onPress={() => router.back()} accessibilityLabel="Fechar" size={22} />
  );

  if (!available) {
    return (
      <Screen bottomInset={spacing.section}>
        <ScreenHeader title="Apps bloqueados" action={fechar} />
        <EmptyState
          icon="ban"
          title="Só no StayOn do Android"
          description="O bloqueio depende de um serviço do sistema que só existe no Android, no aplicativo instalado no aparelho. O resto do StayOn funciona normalmente."
        />
      </Screen>
    );
  }

  return (
    <Screen bottomInset={spacing.section}>
      <ScreenHeader
        title="Apps bloqueados"
        subtitle={
          packages.length === 0
            ? 'Nenhum app escolhido ainda.'
            : `${packages.length} ${packages.length === 1 ? 'app barrado' : 'apps barrados'} durante a sessão.`
        }
        action={fechar}
      />

      {granted ? null : (
        <Card style={styles.permission}>
          <AppText variant="bodyStrong">Falta a permissão</AppText>
          <AppText variant="supporting" color="textMuted" style={styles.permissionText}>
            Para fechar outros aplicativos o StayOn precisa do serviço de acessibilidade. Nos
            ajustes, procure StayOn na lista e ative.
          </AppText>
          <Button
            label="Abrir ajustes do sistema"
            onPress={openSettings}
            style={styles.permissionButton}
          />
        </Card>
      )}

      <TextField label="Procurar" value={filter} onChangeText={setFilter} placeholder="Instagram" />

      {loading ? (
        <AppText variant="supporting" color="textDim">
          Lendo os aplicativos instalados…
        </AppText>
      ) : null}

      {!loading && visible.length === 0 ? (
        <EmptyState
          icon="ban"
          title="Nada encontrado"
          description="Nenhum aplicativo instalado com esse nome."
        />
      ) : null}

      {visible.map((app) => (
        <ListRow
          key={app.packageName}
          title={app.label}
          subtitle={app.packageName}
          onPress={() => toggle(app.packageName)}
          leading={<Checkbox checked={packages.includes(app.packageName)} />}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  permission: {
    marginBottom: spacing.section,
  },
  permissionText: {
    marginTop: spacing.sm,
  },
  permissionButton: {
    marginTop: spacing.xxl,
  },
});
