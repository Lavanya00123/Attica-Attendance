package com.atticaeyenew;

import android.database.Cursor;
import android.provider.CallLog;
import android.util.Log;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.json.JSONArray;
import org.json.JSONObject;

public class CallLogModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "CallLogModule";

    public CallLogModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void getCallLogs(Promise promise) {
        try {
            Cursor cursor = getCurrentActivity().getContentResolver().query(CallLog.Calls.CONTENT_URI, null, null, null, CallLog.Calls.DATE + " DESC");

            if (cursor != null) {
                JSONArray callLogsArray = new JSONArray();

                int numberColumn = cursor.getColumnIndex(CallLog.Calls.NUMBER);
                int typeColumn = cursor.getColumnIndex(CallLog.Calls.TYPE);
                int dateColumn = cursor.getColumnIndex(CallLog.Calls.DATE);
                int durationColumn = cursor.getColumnIndex(CallLog.Calls.DURATION);

                while (cursor.moveToNext()) {
                    JSONObject callLog = new JSONObject();
                    String number = cursor.getString(numberColumn);
                    String type = cursor.getString(typeColumn);
                    String date = cursor.getString(dateColumn);
                    String duration = cursor.getString(durationColumn);

                    // Create a JSON object for each call log entry
                    callLog.put("number", number);
                    callLog.put("type", type);
                    callLog.put("date", date);
                    callLog.put("duration", duration);

                    // Add to the array of call logs
                    callLogsArray.put(callLog);
                }
                cursor.close();
                promise.resolve(callLogsArray); // Send the array of call logs back to React Native
            } else {
                promise.reject("ERROR", "Failed to retrieve call logs");
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
            Log.e(MODULE_NAME, "Error retrieving call logs: " + e.getMessage());
        }
    }
}
