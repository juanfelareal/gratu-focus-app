package com.gratu.blocker

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * Reanuda la sesión de enfoque tras reiniciar el celular.
 * El estado vive en disco (Prefs), así que apagar el teléfono no es escape.
 */
class BootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action == Intent.ACTION_BOOT_COMPLETED && Prefs.isActive(context)) {
      BlockerService.start(context)
    }
  }
}
