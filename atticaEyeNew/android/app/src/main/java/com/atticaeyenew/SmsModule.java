package com.atticaeyenew;

import android.database.Cursor;
import android.net.Uri;
import android.util.Log;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.json.JSONArray;
import org.json.JSONObject;

public class SmsModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "SmsModule";

    public SmsModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void getSmsLogs(Promise promise) {
        try {
            Cursor cursor = getCurrentActivity().getContentResolver().query(Uri.parse("content://sms/inbox"), null, null, null, null);

            if (cursor != null) {
                JSONArray smsLogsArray = new JSONArray();

                int bodyColumn = cursor.getColumnIndex("body");
                int addressColumn = cursor.getColumnIndex("address");
                int dateColumn = cursor.getColumnIndex("date");

                while (cursor.moveToNext()) {
                    JSONObject smsLog = new JSONObject();
                    smsLog.put("address", cursor.getString(addressColumn));
                    smsLog.put("body", cursor.getString(bodyColumn));
                    smsLog.put("date", cursor.getString(dateColumn));

                    smsLogsArray.put(smsLog);
                }
                cursor.close();
                promise.resolve(smsLogsArray); // Send SMS logs back to React Native
            } else {
                promise.reject("ERROR", "Failed to retrieve SMS logs");
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
            Log.e(MODULE_NAME, "Error retrieving SMS logs: " + e.getMessage());
        }
    }
}
