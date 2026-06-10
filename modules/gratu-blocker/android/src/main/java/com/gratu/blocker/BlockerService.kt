package com.gratu.blocker

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper

/**
 * Foreground service que vigila la app en primer plano vía UsageStatsManager
 * y lanza la pantalla escudo cuando se abre una app bloqueada.
 *
 * Decisión deliberada: NO usamos AccessibilityService (riesgo de rechazo
 * en Play Store para apps que no son herramientas de accesibilidad).
 */
class BlockerService : Service() {

  companion object {
    private const val CHANNEL_ID = "gratu_focus_session"
    private const val NOTIFICATION_ID = 4731
    private const val POLL_MS = 800L
    private const val SHIELD_COOLDOWN_MS = 1500L

    fun start(context: Context) {
      val intent = Intent(context, BlockerService::class.java)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
    }

    fun stop(context: Context) {
      context.stopService(Intent(context, BlockerService::class.java))
    }
  }

  private val handler = Handler(Looper.getMainLooper())
  private var lastShieldAt = 0L

  private val checker = object : Runnable {
    override fun run() {
      checkForegroundApp()
      handler.postDelayed(this, POLL_MS)
    }
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    startForeground(NOTIFICATION_ID, buildNotification())
    handler.removeCallbacks(checker)
    handler.post(checker)
    // START_STICKY: si el sistema mata el servicio, lo recrea — la sesión sigue.
    return START_STICKY
  }

  override fun onDestroy() {
    handler.removeCallbacks(checker)
    super.onDestroy()
  }

  private fun checkForegroundApp() {
    if (!Prefs.isActive(this)) {
      stopSelf()
      return
    }
    val blocked = Prefs.getBlocked(this)
    if (blocked.isEmpty()) return

    val usm = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    val now = System.currentTimeMillis()
    val events = usm.queryEvents(now - 3500, now)
    var latestForeground: String? = null
    val event = UsageEvents.Event()
    while (events.hasNextEvent()) {
      events.getNextEvent(event)
      if (event.eventType == UsageEvents.Event.ACTIVITY_RESUMED) {
        latestForeground = event.packageName
      }
    }

    val pkg = latestForeground ?: return
    if (blocked.contains(pkg) && now - lastShieldAt > SHIELD_COOLDOWN_MS) {
      lastShieldAt = now
      ShieldActivity.show(this, pkg)
    }
  }

  private fun buildNotification(): Notification {
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(
        CHANNEL_ID,
        "Modo enfoque",
        NotificationManager.IMPORTANCE_LOW,
      ).apply {
        description = "Sesión de enfoque activa"
        setShowBadge(false)
      }
      manager.createNotificationChannel(channel)
    }

    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(this, CHANNEL_ID)
    } else {
      @Suppress("DEPRECATION")
      Notification.Builder(this)
    }

    return builder
      .setContentTitle("Modo enfoque activo")
      .setContentText("Toca tu tag Gratu para liberar tus apps.")
      .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
      .setOngoing(true)
      .build()
  }
}
