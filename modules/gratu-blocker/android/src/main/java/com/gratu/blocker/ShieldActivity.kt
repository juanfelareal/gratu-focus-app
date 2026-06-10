package com.gratu.blocker

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.os.Build
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

/**
 * Pantalla escudo: aparece encima de la app bloqueada.
 * UI programática (sin recursos XML) con la voz y paleta de Gratu Focus.
 * "Volver a lo importante" lleva al home del launcher.
 */
class ShieldActivity : Activity() {

  companion object {
    private const val EXTRA_PKG = "blocked_package"

    fun show(context: Context, blockedPackage: String) {
      val intent = Intent(context, ShieldActivity::class.java)
        .addFlags(
          Intent.FLAG_ACTIVITY_NEW_TASK or
            Intent.FLAG_ACTIVITY_CLEAR_TOP or
            Intent.FLAG_ACTIVITY_SINGLE_TOP,
        )
        .putExtra(EXTRA_PKG, blockedPackage)
      context.startActivity(intent)
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val appLabel = intent.getStringExtra(EXTRA_PKG)?.let { pkg ->
      try {
        packageManager.getApplicationLabel(packageManager.getApplicationInfo(pkg, 0)).toString()
      } catch (e: Exception) {
        null
      }
    } ?: "Esta app"

    val dark = Color.parseColor("#0B100D")
    val cream = Color.parseColor("#F3F1EC")
    val mutedGreen = Color.parseColor("#93A097")
    val ink = Color.parseColor("#15211B")

    val root = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER
      setBackgroundColor(dark)
      setPadding(dp(40), dp(40), dp(40), dp(40))
    }

    root.addView(TextView(this).apply {
      text = "GRATU FOCUS"
      setTextColor(mutedGreen)
      textSize = 11f
      letterSpacing = 0.28f
      typeface = Typeface.MONOSPACE
      gravity = Gravity.CENTER
    })

    root.addView(TextView(this).apply {
      text = "$appLabel\npuede esperar."
      setTextColor(cream)
      textSize = 32f
      typeface = Typeface.create("sans-serif", Typeface.BOLD)
      gravity = Gravity.CENTER
      setPadding(0, dp(28), 0, dp(14))
    })

    root.addView(TextView(this).apply {
      text = "Estás en modo enfoque. Tu tag está donde lo dejaste — termina lo que empezaste."
      setTextColor(mutedGreen)
      textSize = 14.5f
      gravity = Gravity.CENTER
      setPadding(dp(12), 0, dp(12), dp(40))
    })

    root.addView(Button(this).apply {
      text = "Volver a lo importante"
      setTextColor(ink)
      textSize = 15.5f
      typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
      isAllCaps = false
      background = android.graphics.drawable.GradientDrawable().apply {
        cornerRadius = dp(100).toFloat()
        setColor(cream)
      }
      setPadding(dp(36), dp(16), dp(36), dp(16))
      setOnClickListener { goHome() }
    })

    setContentView(root)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      window.insetsController?.hide(android.view.WindowInsets.Type.statusBars())
    } else {
      @Suppress("DEPRECATION")
      window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_FULLSCREEN
    }
  }

  @Deprecated("Deprecated in Java")
  override fun onBackPressed() {
    // Atrás no vuelve a la app bloqueada: va al home.
    goHome()
  }

  private fun goHome() {
    startActivity(
      Intent(Intent.ACTION_MAIN)
        .addCategory(Intent.CATEGORY_HOME)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
    )
    finish()
  }

  private fun dp(value: Int): Int =
    (value * resources.displayMetrics.density).toInt()
}
