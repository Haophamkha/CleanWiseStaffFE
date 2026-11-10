const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const test = require("node:test");
const React = require("react");
const { act, create } = require("react-test-renderer");
const ts = require("typescript");
const { language, react } = require("./language-support.cjs");

global.IS_REACT_ACT_ENVIRONMENT = true;

function load(file, mocks = {}) {
  const filename = path.resolve(__dirname, "../..", file);
  const loaded = new Module(filename, module);
  loaded.paths = module.paths;
  loaded.require = (name) => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name === "@/features/language/i18n") return language;
    return name.startsWith(".") ? require(path.resolve(path.dirname(filename), name)) : require(name);
  };
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  loaded._compile(compiled.outputText, filename);
  return loaded.exports;
}

const scheduleStatus = load("src/features/schedule/utils/scheduleStatus.ts", {
  "@/components/ui/StatusBadge": {},
  "@/utils/format": load("src/utils/format.ts"),
});
const { getCheckOutAvailability } = scheduleStatus;
const scheduledEnd = "2026-11-18T11:00:00+07:00";
const checkOutUntil = "2026-11-18T11:30:00+07:00";
const schedule = { scheduled_end: scheduledEnd, check_out_until: checkOutUntil };
const end = Date.parse(scheduledEnd);
const deadline = Date.parse(checkOutUntil);

test("check-out includes both boundaries and honors a deadline sent by the API", () => {
  for (const [now, allowed] of [
    [end - 15 * 60_000, false],
    [end - 1, false],
    [end, true],
    [end + 15 * 60_000, true],
    [deadline, true],
    [deadline + 1, false],
  ]) {
    assert.equal(getCheckOutAvailability(schedule, language.translate, now).canFinish, allowed);
  }
  const customDeadline = { ...schedule, check_out_until: "2026-11-18T11:10:00+07:00" };
  assert.equal(getCheckOutAvailability(customDeadline, language.translate, end + 15 * 60_000).canFinish, false);
  assert.equal(getCheckOutAvailability({ scheduled_end: scheduledEnd }, language.translate, deadline).canFinish, true);
});

test("the open job screen unlocks at the end time and closes the dialog when the window expires", async (t) => {
  t.mock.timers.enable({ apis: ["Date", "setInterval"], now: end - 1000 });
  const theme = load("src/constants/theme.ts");
  const { JobActions } = load("src/features/job/components/JobActions.tsx", {
    "react-i18next": react,
    "react-native": { View: "View", Text: "Text", TextInput: "TextInput", ActivityIndicator: "ActivityIndicator" },
    "@expo/vector-icons": { Feather: "Feather" },
    "@/features/theme/ThemeProvider": { useAppTheme: () => theme.APP_THEMES.light },
    "@/components/ui/ConfirmModal": { ConfirmModal: "ConfirmModal" },
    "@/components/ui/FadeInView": { FadeInView: "FadeInView" },
    "@/components/ui/PressableScale": { PressableScale: "PressableScale" },
    "@/components/ui/PrimaryButton": {},
    "@/constants/theme": theme,
    "@/features/complaint/components/ComplaintAction": {},
    "@/features/job/components/CancelReasonChips": {},
    "@/features/job/components/CancellationImpact": {},
    "@/features/schedule/utils/scheduleStatus": scheduleStatus,
  });
  const handleCheckOut = t.mock.fn();
  let screen;
  await act(() => {
    screen = create(React.createElement(JobActions, {
      isMine: true,
      isPackage: false,
      item: { status: "IN_PROGRESS" },
      mineItem: { ...schedule, status: "IN_PROGRESS" },
      actions: { isCheckingOut: false, handleCheckOut },
    }));
  });
  try {
    const button = () => screen.root.findByType("PressableScale").props;
    const dialog = () => screen.root.findByType("ConfirmModal").props;
    assert.equal(button().disabled, true);
    assert.match(button().accessibilityHint, /Có thể check-out từ/);
    await act(() => button().onPress());
    assert.equal(dialog().visible, false);

    await act(() => t.mock.timers.tick(1000));
    assert.equal(button().disabled, false);
    await act(() => button().onPress());
    assert.equal(dialog().visible, true);

    await act(() => t.mock.timers.tick(30 * 60_000 + 1000));
    assert.equal(button().disabled, true);
    assert.equal(dialog().visible, false);
    await act(() => dialog().onConfirm());
    assert.equal(handleCheckOut.mock.callCount(), 0);
  } finally {
    await act(() => screen.unmount());
  }
});
