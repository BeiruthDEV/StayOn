import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, SegmentedControl, Sheet, TextField } from '@/components';
import { itemsForWeekday, parseRoutineText, weekdayShort, WEEK_ORDER } from '@/domain/routine';
import { Icon } from '@/icons';
import { useRoutine, useToast } from '@/state';
import { colors, motion, radius, spacing } from '@/theme';

import { pickRoutineFile } from './readRoutineFile';

type RoutineImportSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const MODES = ['Substituir', 'Somar'] as const;

const EXAMPLE = [
  'seg 09:00-12:00 Estudo | Teoria',
  'ter e qui 7h30 às 9h Treino | Academia',
  'seg a sex 18:00-19:00 Inglês',
  'domingo 10h-11h Planejar a semana',
].join('\n');

/**
 * Importa a rotina de um arquivo TXT/PDF ou de texto colado. O texto fica
 * editável e a prévia mostra, dia a dia, o que vai entrar e cada linha com
 * problema, antes de qualquer bloco ser salvo.
 */
export function RoutineImportSheet({ visible, onClose }: RoutineImportSheetProps) {
  const { items, replaceAll, addMany } = useRoutine();
  const { showToast } = useToast();
  const [text, setText] = useState('');
  const [source, setSource] = useState<string | undefined>(undefined);
  const [reading, setReading] = useState(false);
  const [fileError, setFileError] = useState<string | undefined>(undefined);
  const [showHelp, setShowHelp] = useState(false);
  const [mode, setMode] = useState<(typeof MODES)[number]>('Substituir');

  useEffect(() => {
    if (!visible) return;
    setText('');
    setSource(undefined);
    setFileError(undefined);
    setShowHelp(false);
    setMode('Substituir');
  }, [visible]);

  const parsed = useMemo(() => parseRoutineText(text), [text]);
  const found = parsed.items;
  const daysWithItems = WEEK_ORDER.filter((day) => itemsForWeekday(found, day).length > 0);

  const handlePick = async () => {
    setFileError(undefined);
    setReading(true);
    // deixa o indicador aparecer antes da leitura, que roda no mesmo thread
    await new Promise((resolve) => setTimeout(resolve, 50));
    const result = await pickRoutineFile();
    setReading(false);
    if (result.kind === 'error') setFileError(result.message);
    if (result.kind === 'text') {
      setText(result.text);
      setSource(result.name);
    }
  };

  const handleImport = () => {
    if (found.length === 0) return;
    const previous = items;
    if (mode === 'Substituir' || items.length === 0) replaceAll(found);
    else addMany(found);
    showToast(`${found.length} blocos importados`, () => replaceAll(previous));
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      title="Importar rotina"
      onClose={onClose}
      footer={
        <Button
          label={
            found.length > 0
              ? `Importar ${found.length} ${found.length === 1 ? 'bloco' : 'blocos'}`
              : 'Escolha um arquivo ou cole o texto'
          }
          onPress={handleImport}
        />
      }
    >
      <AppText variant="supporting" color="textMuted" style={styles.intro}>
        Traga a rotina de um arquivo ou cole o texto. Nada é salvo antes de você conferir a prévia.
      </AppText>

      <Pressable
        onPress={handlePick}
        disabled={reading}
        accessibilityRole="button"
        accessibilityLabel="Escolher arquivo TXT ou PDF"
        style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
      >
        {reading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Icon name="book" size={20} color={colors.text} />
        )}
        <View style={styles.tileText}>
          <AppText variant="bodyStrong">
            {reading ? 'Lendo o arquivo…' : 'Escolher arquivo'}
          </AppText>
          <AppText variant="caption" color="textDim">
            {source ? `Lido: ${source}` : 'TXT ou PDF com a rotina escrita'}
          </AppText>
        </View>
      </Pressable>

      {fileError ? (
        <AppText variant="caption" color="danger" style={styles.fileError}>
          {fileError}
        </AppText>
      ) : null}

      <Pressable
        onPress={() => setShowHelp(!showHelp)}
        accessibilityRole="button"
        accessibilityState={{ expanded: showHelp }}
        style={styles.helpToggle}
      >
        <Icon name="info" size={16} color={colors.textDim} />
        <AppText variant="captionMedium" color="textDim">
          {showHelp ? 'Esconder exemplo' : 'Como escrever a rotina'}
        </AppText>
      </Pressable>

      {showHelp ? (
        <View style={styles.help}>
          <AppText variant="caption" color="textMuted">
            Um bloco por linha: dia, horário de início e fim e o nome. A área é opcional e vem antes
            de uma barra {'"|"'}. Linhas sem dia e horário, como títulos, são puladas.
          </AppText>
          <AppText variant="caption" color="text" selectable style={styles.example}>
            {EXAMPLE}
          </AppText>
        </View>
      ) : null}

      <TextField
        label={source ? 'Texto do arquivo (dá para corrigir aqui)' : 'Ou cole o texto aqui'}
        value={text}
        onChangeText={setText}
        placeholder={EXAMPLE}
        multiline
      />

      {text.trim() !== '' ? (
        <View style={styles.preview}>
          <AppText variant="sectionTitle">
            {found.length > 0
              ? `${found.length} ${found.length === 1 ? 'bloco' : 'blocos'} em ${daysWithItems.length} ${daysWithItems.length === 1 ? 'dia' : 'dias'}`
              : 'Nenhum bloco encontrado ainda'}
          </AppText>

          {daysWithItems.map((day) => (
            <View key={day} style={styles.day}>
              <AppText variant="captionStrong" color="text">
                {weekdayShort(day)} · {itemsForWeekday(found, day).length}
              </AppText>
              {itemsForWeekday(found, day).map((item) => (
                <AppText key={item.id} variant="caption" color="textMuted" numberOfLines={1}>
                  {item.start}–{item.end} {item.title}
                  {item.tag !== 'Rotina' ? ` · ${item.tag}` : ''}
                </AppText>
              ))}
            </View>
          ))}

          {parsed.errors.length > 0 ? (
            <View style={styles.errors} accessibilityRole="alert">
              <AppText variant="captionStrong" color="danger">
                {parsed.errors.length === 1
                  ? '1 linha com problema fica de fora'
                  : `${parsed.errors.length} linhas com problema ficam de fora`}
              </AppText>
              {parsed.errors.slice(0, 20).map((error) => (
                <View key={`${error.line}-${error.text}`} style={styles.error}>
                  <AppText variant="caption" color="text">
                    Linha {error.line}: {error.reason}
                  </AppText>
                  <AppText variant="caption" color="textDim" numberOfLines={1}>
                    {error.text}
                  </AppText>
                </View>
              ))}
              <AppText variant="caption" color="textDim">
                Corrija no texto acima e a prévia atualiza na hora.
              </AppText>
            </View>
          ) : null}

          {parsed.ignored > 0 ? (
            <AppText variant="caption" color="textDim">
              {parsed.ignored === 1
                ? '1 linha sem dia e horário foi pulada (título ou anotação).'
                : `${parsed.ignored} linhas sem dia e horário foram puladas (títulos e anotações).`}
            </AppText>
          ) : null}

          {items.length > 0 && found.length > 0 ? (
            <View style={styles.mode}>
              <AppText variant="overlineSmall" color="textDim">
                Sua rotina atual tem {items.length} blocos
              </AppText>
              <SegmentedControl options={MODES} value={mode} onChange={setMode} />
              <AppText variant="caption" color="textDim">
                {mode === 'Substituir'
                  ? 'A rotina atual sai e entra a importada. O histórico dos dias já marcados continua.'
                  : 'Os blocos importados se somam aos que você já tem.'}
              </AppText>
            </View>
          ) : null}
        </View>
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginBottom: spacing.xxl,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    padding: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceRaised,
  },
  tileText: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  fileError: {
    marginTop: spacing.md,
  },
  helpToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  help: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
    padding: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  example: {
    lineHeight: 20,
  },
  preview: {
    gap: spacing.xl,
    marginBottom: spacing.xxl,
  },
  day: {
    gap: spacing.xxs,
  },
  errors: {
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    backgroundColor: colors.dangerSurface,
  },
  error: {
    gap: spacing.xxs,
  },
  mode: {
    gap: spacing.md,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
