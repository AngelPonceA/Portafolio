package io.ionic.starter;

import android.content.Intent;
import android.net.Uri;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.JSObject;

public class MainActivity extends BridgeActivity {

  @Override
  protected void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    Uri data = intent.getData();
    if (data != null && "fleamarket".equals(data.getScheme())) {
      String token = data.getQueryParameter("token_ws");
      android.util.Log.e("DEEPLINK", "🔁 Token recibido: " + token);
      handleDeepLink(token);
    } else {
      android.util.Log.e("DEEPLINK", "⚠️ URI no válida o schema incorrecto");
    }
  }

  private void handleDeepLink(String token) {
    JSObject payload = new JSObject();
    payload.put("token_ws", token);
    String json = payload.toString();
    getBridge().triggerWindowJSEvent("webpayRedirect", json); 
  }
}
