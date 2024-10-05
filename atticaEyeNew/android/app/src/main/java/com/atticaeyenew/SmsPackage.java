package com.atticaeyenew;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.facebook.react.ReactPackage;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class SmsPackage implements ReactPackage {
    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new SmsModule(reactContext)); // Pass reactContext to SmsModule
        return modules;
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();  // Return an empty list if no ViewManagers are used
    }
}
