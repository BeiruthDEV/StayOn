package expo.modules.stayonblocker

import android.content.Context
import android.content.Intent
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/** O que o JavaScript enxerga do bloqueio de aplicativos. */
class StayOnBlockerModule : Module() {
  private val context: Context
    get() = requireNotNull(appContext.reactContext) { "Aplicativo sem contexto" }

  override fun definition() = ModuleDefinition {
    Name("StayOnBlocker")

    Function("isAccessibilityEnabled") {
      BlockerState.isServiceEnabled(context)
    }

    // A permissão de acessibilidade não pode ser pedida por diálogo: só a
    // própria pessoa consegue conceder, na tela de ajustes do sistema.
    Function("openAccessibilitySettings") {
      context.startActivity(
        Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
      )
    }

    AsyncFunction("listInstalledApps") {
      listarAplicativos()
    }

    // O horário de término chega em milissegundos. Vem como Double porque é
    // assim que um número do JavaScript atravessa a ponte.
    Function("startBlocking") { pacotes: List<String>, terminaEm: Double ->
      BlockerState.start(context, pacotes.toSet(), terminaEm.toLong())
    }

    Function("stopBlocking") {
      BlockerState.stop(context)
    }

    Function("isBlocking") {
      BlockerState.isActive(context)
    }
  }

  /**
   * Aplicativos que a pessoa consegue abrir pela gaveta.
   *
   * A busca é por quem responde ao atalho de abertura, e não pela lista crua de
   * pacotes instalados: isso deixa de fora as centenas de serviços internos do
   * sistema, que não fazem sentido numa lista de bloqueio, e dispensa a
   * permissão QUERY_ALL_PACKAGES — basta o filtro declarado no manifesto.
   */
  @Suppress("DEPRECATION")
  private fun listarAplicativos(): List<Map<String, String>> {
    val pm = context.packageManager
    val atalho = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)

    return pm.queryIntentActivities(atalho, 0)
      .mapNotNull { it.activityInfo?.applicationInfo }
      .filter { it.packageName != context.packageName }
      .distinctBy { it.packageName }
      .map { mapOf("packageName" to it.packageName, "label" to pm.getApplicationLabel(it).toString()) }
      .sortedBy { it.getValue("label").lowercase() }
  }
}
