package com.gratu.blocker

import android.content.Context

/**
 * Estado del bloqueo persistido en disco: sobrevive kill del proceso y reboot.
 * El BootReceiver lo lee para reanudar la sesión tras reiniciar el celular.
 */
object Prefs {
  private const val FILE = "gratu_blocker"
  private const val KEY_ACTIVE = "active"
  private const val KEY_BLOCKED = "blocked_packages"

  private fun prefs(context: Context) =
    context.getSharedPreferences(FILE, Context.MODE_PRIVATE)

  fun setActive(context: Context, active: Boolean) {
    prefs(context).edit().putBoolean(KEY_ACTIVE, active).apply()
  }

  fun isActive(context: Context): Boolean =
    prefs(context).getBoolean(KEY_ACTIVE, false)

  fun setBlocked(context: Context, packages: Set<String>) {
    prefs(context).edit().putStringSet(KEY_BLOCKED, packages).apply()
  }

  fun getBlocked(context: Context): Set<String> =
    prefs(context).getStringSet(KEY_BLOCKED, emptySet()) ?: emptySet()
}
