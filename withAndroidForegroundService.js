const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withAndroidForegroundService(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    const permissions = [
      "android.permission.FOREGROUND_SERVICE",
      "android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE",
      "android.permission.WAKE_LOCK",
    ];

    manifest["uses-permission"] = manifest["uses-permission"] || [];

    for (const permission of permissions) {
      const exists = manifest["uses-permission"].some(
        (item) => item.$["android:name"] === permission
      );

      if (!exists) {
        manifest["uses-permission"].push({
          $: { "android:name": permission },
        });
      }
    }

    const application = manifest.application[0];
    application.service = application.service || [];

    const serviceName = "com.asterinet.react.bgactions.RNBackgroundActionsTask";

    let service = application.service.find(
      (item) => item.$["android:name"] === serviceName
    );

    if (!service) {
      service = {
        $: { "android:name": serviceName },
      };

      application.service.push(service);
    }

    service.$["android:foregroundServiceType"] = "connectedDevice";

    return config;
  });
};