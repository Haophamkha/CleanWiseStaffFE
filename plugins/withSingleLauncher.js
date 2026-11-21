const { AndroidConfig, withAndroidManifest, withMainActivity } = require("expo/config-plugins");

const marker = "// CleanWise: ignore repeated launcher taps";
function patchMainActivity(contents) {
  if (contents.includes(marker)) return contents;
  const anchor = /override fun onCreate\(savedInstanceState: Bundle\?\)\s*\{/;
  if (!anchor.test(contents)) throw new Error("Cannot find Kotlin MainActivity.onCreate for launcher guard");
  return contents.replace(anchor, `$&
    ${marker}
    // Only reject a duplicate launcher Activity. OAuth and notification links still work.
    if (!isTaskRoot && intent?.action == android.content.Intent.ACTION_MAIN &&
        intent?.hasCategory(android.content.Intent.CATEGORY_LAUNCHER) == true) {
      super.onCreate(null /* duplicate launcher */)
      finish()
      return
    }
`).replace(/\n}\s*$/, `
  override fun onNewIntent(intent: android.content.Intent) {
    // singleTask delivers extra icon taps here; do not forward them to JS/router.
    if (intent.action == android.content.Intent.ACTION_MAIN &&
        intent.hasCategory(android.content.Intent.CATEGORY_LAUNCHER)) return
    super.onNewIntent(intent)
  }
}
`);
}

module.exports = function withSingleLauncher(config) {
  config = withAndroidManifest(config, (config) => {
    const activity = AndroidConfig.Manifest.getMainActivityOrThrow(config.modResults);
    activity.$["android:launchMode"] = "singleTask";
    return config;
  });
  return withMainActivity(config, (config) => {
    if (config.modResults.language !== "kt") throw new Error("Launcher guard requires Kotlin MainActivity");
    config.modResults.contents = patchMainActivity(config.modResults.contents);
    return config;
  });
};
module.exports.patchMainActivity = patchMainActivity;
