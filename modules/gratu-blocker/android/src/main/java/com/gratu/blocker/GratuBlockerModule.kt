package com.gratu.blocker

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Process
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class GratuBlockerModule : Module() {
  private val context: Context
    get() = requireNotNull(appContext.reactContext)

  override fun definition() = ModuleDefinition {
    Name("GratuBlocker")

    AsyncFunction("getInstalledApps") {
      val pm = context.packageManager
      val launcherIntent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
      pm.queryIntentActivities(launcherIntent, 0)
        .mapNotNull { resolveInfo ->
          val pkg = resolveInfo.activityInfo.packageName
          if (pkg == context.packageName) {
            null
          } else {
            mapOf(
              "label" to resolveInfo.loadLabel(pm).toString(),
              "packageName" to pkg,
            )
          }
        }
        .distinctBy { it["packageName"] }
    }

    Function("hasUsageAccess") {
      val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
      val mode = appOps.unsafeCheckOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS,
        Process.myUid(),
        context.packageName,
      )
      mode == AppOpsManager.MODE_ALLOWED
    }

    Function("hasOverlayPermission") {
      Settings.canDrawOverlays(context)
    }

    Function("openUsageAccessSettings") {
      context.startActivity(
        Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
          .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
      )
    }

    Function("openOverlaySettings") {
      context.startActivity(
        Intent(
          Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
          Uri.parse("package:${context.packageName}"),
        ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
      )
    }

    Function("startBlocking") { packages: List<String> ->
      Prefs.setBlocked(context, packages.toSet())
      Prefs.setActive(context, true)
      BlockerService.start(context)
    }

    Function("stopBlocking") {
      Prefs.setActive(context, false)
      BlockerService.stop(context)
    }

    Function("isBlocking") {
      Prefs.isActive(context)
    }
  }
}
