package expo.modules.stayonblocker

import android.content.ComponentName
import android.content.Context
import android.provider.Settings

/**
 * O que está bloqueado e até quando, guardado em disco.
 *
 * Mora em SharedPreferences, e não em memória, porque quem lê é o
 * [BlockerService], que vive fora do React e pode ser reiniciado pelo sistema
 * a qualquer momento — inclusive com o StayOn fechado. Lendo do disco, o
 * serviço acorda já sabendo o que fazer.
 *
 * Guardar o horário de término, em vez de uma chave de ligado/desligado, faz o
 * bloqueio expirar sozinho. Sem isso, o aplicativo morto no meio da sessão
 * deixaria o aparelho bloqueado para sempre.
 */
object BlockerState {
  private const val PREFS = "stay_on_blocker"
  private const val PACOTES = "pacotes"
  private const val TERMINA_EM = "terminaEm"
  private const val ESTRITO = "estrito"

  private fun prefs(context: Context) =
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  /**
   * Liga o bloqueio dos pacotes informados até o horário dado, em milissegundos.
   * No modo estrito o aplicativo é fechado; fora dele a pessoa só é avisada.
   */
  fun start(context: Context, pacotes: Set<String>, terminaEm: Long, estrito: Boolean) {
    prefs(context).edit()
      .putStringSet(PACOTES, pacotes)
      .putLong(TERMINA_EM, terminaEm)
      .putBoolean(ESTRITO, estrito)
      .apply()
  }

  /** Se o aplicativo bloqueado deve ser fechado, e não apenas sinalizado. */
  fun isStrict(context: Context): Boolean = prefs(context).getBoolean(ESTRITO, true)

  /** Desliga o bloqueio antes da hora, quando a sessão é encerrada na mão. */
  fun stop(context: Context) {
    prefs(context).edit().putLong(TERMINA_EM, 0L).apply()
  }

  fun isActive(context: Context): Boolean =
    prefs(context).getLong(TERMINA_EM, 0L) > System.currentTimeMillis()

  /** Se este pacote deve ser barrado agora. */
  fun shouldBlock(context: Context, pacote: String): Boolean {
    val prefs = prefs(context)
    if (prefs.getLong(TERMINA_EM, 0L) <= System.currentTimeMillis()) return false
    return prefs.getStringSet(PACOTES, emptySet())?.contains(pacote) == true
  }

  /**
   * Se a pessoa já concedeu a permissão de acessibilidade ao StayOn.
   *
   * A lista do sistema vem como nomes de componente separados por dois pontos,
   * e em formatos que variam entre fabricantes — por isso cada item é
   * reconstruído em ComponentName antes de comparar, em vez de comparar texto.
   */
  fun isServiceEnabled(context: Context): Boolean {
    val alvo = ComponentName(context, BlockerService::class.java)
    val ativos = Settings.Secure.getString(
      context.contentResolver,
      Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES,
    ) ?: return false

    return ativos.split(':')
      .mapNotNull { ComponentName.unflattenFromString(it) }
      .any { it == alvo }
  }
}
