package expo.modules.stayonblocker

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.widget.Toast

/**
 * Expulsa os aplicativos bloqueados enquanto a sessão de foco está correndo.
 *
 * Usa acessibilidade em vez de consultar o UsageStatsManager em laço: os dois
 * conseguem saber qual aplicativo está na frente, mas aqui é o sistema que
 * avisa, no instante em que a janela troca. Não há consulta periódica, a
 * reação é imediata e o custo de bateria é desprezível.
 *
 * O serviço não lê conteúdo de tela — só o nome do pacote que abriu.
 */
class BlockerService : AccessibilityService() {
  private var ultimoAviso = 0L

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

    val pacote = event.packageName?.toString() ?: return
    if (pacote == packageName) return
    if (!BlockerState.shouldBlock(this, pacote)) return

    performGlobalAction(GLOBAL_ACTION_HOME)
    avisar()
  }

  /**
   * Sem o aviso o aplicativo simplesmente fecha sozinho, o que parece defeito.
   * A janela de alguns segundos evita repetir a mensagem quando o sistema
   * dispara vários eventos na mesma tentativa de abrir.
   */
  private fun avisar() {
    val agora = System.currentTimeMillis()
    if (agora - ultimoAviso < INTERVALO_AVISO) return

    ultimoAviso = agora
    Toast.makeText(this, "StayOn: sessão de foco em andamento", Toast.LENGTH_SHORT).show()
  }

  override fun onInterrupt() = Unit

  private companion object {
    const val INTERVALO_AVISO = 3_000L
  }
}
