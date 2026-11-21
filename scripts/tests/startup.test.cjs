const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const root = path.resolve(__dirname, "../..");
const withSingleLauncher = require("../../plugins/withSingleLauncher");

function preferences(getItem) {
  const source = fs.readFileSync(path.join(root, "src/utils/startupPreferences.ts"), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const timers = new Set();
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require: () => ({ __esModule: true, default: { getItem } }),
    setTimeout: (fn) => { timers.add(fn); return fn; },
    clearTimeout: (fn) => timers.delete(fn),
  });
  return { read: exports.readStartupPreferences, expire: () => [...timers].forEach(fn => fn()) };
}

test("preferences read concurrently and are shared by both providers", async () => {
  const calls = [];
  const resolves = [];
  const startup = preferences(key => { calls.push(key); return new Promise(resolve => resolves.push(resolve)); });
  const first = startup.read();
  assert.equal(calls.length, 2);
  assert.equal(startup.read(), first);
  resolves[0]("en"); resolves[1]("dark");
  assert.deepEqual(Array.from(await first), ["en", "dark"]);
});

test("one failed preference does not discard the other", async () => {
  const startup = preferences(key => key.endsWith("language") ? Promise.reject(new Error("storage")) : Promise.resolve("dark"));
  assert.deepEqual(Array.from(await startup.read()), [null, "dark"]);
});

test("stalled storage falls back and late reads cannot change startup", async () => {
  const resolves = [];
  const startup = preferences(() => new Promise(resolve => resolves.push(resolve)));
  const pending = startup.read();
  startup.expire();
  assert.deepEqual(Array.from(await pending), [null, null]);
  resolves.forEach(resolve => resolve("late"));
  assert.deepEqual(Array.from(await startup.read()), [null, null]);
});

test("launcher plugin keeps one task and preserves link intent filters", async () => {
  const config = withSingleLauncher({ name: "test", slug: "test" });
  const activity = { $: { "android:name": ".MainActivity", "android:launchMode": "standard" }, "intent-filter": [{ action: [{ $: { "android:name": "android.intent.action.MAIN" } }], category: [{ $: { "android:name": "android.intent.category.LAUNCHER" } }] }, { data: [{ $: { "android:scheme": "cleanwise" } }] }] };
  const filters = JSON.stringify(activity["intent-filter"]);
  await config.mods.android.manifest({ ...config, modResults: { manifest: { application: [{ activity: [activity] }] } }, modRequest: {} });
  assert.equal(activity.$["android:launchMode"], "singleTask");
  assert.equal(JSON.stringify(activity["intent-filter"]), filters);
});

test("Kotlin launcher guard is idempotent and compatible with Expo splash injection", async () => {
  const { withAndroidSplashMainActivity } = require(path.join(root, "node_modules/expo-splash-screen/plugin/build/withAndroidSplashMainActivity.js"));
  const source = `package example
import android.os.Bundle
class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }
}
`;
  for (const splashFirst of [true, false]) {
    let config = { name: "test", slug: "test" };
    config = splashFirst ? withSingleLauncher(withAndroidSplashMainActivity(config)) : withAndroidSplashMainActivity(withSingleLauncher(config));
    const result = await config.mods.android.mainActivity({ ...config, modResults: { contents: source, language: "kt" }, modRequest: {} });
    const kotlin = result.modResults.contents;
    assert.equal(withSingleLauncher.patchMainActivity(kotlin), kotlin);
    assert.equal((kotlin.match(/registerOnActivity/g) || []).length, 1);
    assert.match(kotlin, /registerOnActivity\(this\)[\s\S]*super.onCreate\(null\)/);
    assert.match(kotlin, /!isTaskRoot && intent\?\.action == android.content.Intent.ACTION_MAIN/);
    assert.match(kotlin, /super.onNewIntent\(intent\)/);
  }
});
