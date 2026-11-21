const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ts = require('typescript'), React = require('react');
const { create, act } = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;
const root = path.resolve(__dirname, '../..');
function load(file, mocks = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, { exports, require: id => id in mocks ? mocks[id] : require(id) });
  return exports;
}
const labels = load('src/utils/serviceDisplayName.ts');
const fixtures = require('../fixtures/service-labels.json');
for (const item of fixtures) test(`service fixture ${item.service_name}: group label without changing booking data`, () => {
  const before = JSON.stringify(item);
  assert.equal(labels.serviceDisplayName(item.service_name, item.section_code), item.expected_service_name);
  assert.equal(labels.serviceDisplayName(item.service_name), item.expected_service_name);
  assert.equal(JSON.stringify(item), before);
});
test('known shift suffixes, unknown services and missing names', () => {
  for (const suffix of [' - Ca tháng', ' – Ca lẻ', ' (ca lẻ & định kỳ)', ' - Gói tháng', ' (Ca lẻ / Gói tháng)', ' : Ca lẻ & Ca tháng'])
    assert.equal(labels.serviceDisplayName('Dọn dẹp nhà' + suffix), 'Dọn dẹp nhà');
  assert.equal(labels.serviceDisplayName('Lau kính'), 'Lau kính');
  assert.equal(labels.serviceDisplayName('Dọn dẹp nhà máy'), 'Dọn dẹp nhà máy');
  assert.equal(labels.serviceDisplayName('Dịch vụ mới - Tiêu chuẩn'), 'Dịch vụ mới - Tiêu chuẩn');
  assert.equal(labels.serviceDisplayName(null), '');
});
for (const language of ['vi', 'en']) for (const item of fixtures) {
  const dictionary = require(`../../src/features/language/locales/${language}.json`);
  const tr = key => dictionary[key] ?? key;
  const mocks = {
    '@/utils/serviceDisplayName': labels,
    'react-i18next': { useTranslation: () => ({ t: tr }) },
    'react-native': { Text: 'Text', View: 'View', Pressable: 'Pressable' },
    '@expo/vector-icons': { Feather: 'Icon' },
    '@/features/theme/ThemeProvider': { useAppTheme: () => ({ COLORS: {}, SHADOWS: {}, isDark: false }) },
    '@/components/ui/FadeInView': { FadeInView: 'FadeInView' },
    '@/components/ui/PressableScale': { PressableScale: 'PressableScale' },
    '@/components/ui/StatusBadge': { StatusBadge: 'StatusBadge' },
    '@/constants/theme': { RADIUS: {}, SHADOWS: {}, ON_DARK: {} },
    '@/features/language/i18n': { translate: tr },
    '@/hooks/useDistanceToAddress': { formatDistance: () => '', haversineKm: () => null },
    '@/utils/format': { formatCurrency: () => '200.000 đ', formatDayLabel: () => '01/12', formatTime: () => '09:00', formatDuration: () => '2 giờ' },
  };
  for (const [file, component, props] of [
    ['src/features/job/components/JobListCard.tsx', 'JobListCard', { item, location: null, index: 0, onPress() {} }],
    ['src/features/home/components/TodayScheduleCard.tsx', 'TodayScheduleCard', { schedule: item, onPress() {} }],
  ]) test(`${component} renders general name: ${language} ${item.service_name}`, async () => {
    const Component = load(file, mocks)[component];
    let tree;
    await act(async () => { tree = create(React.createElement(Component, props)); });
    const text = JSON.stringify(tree.toJSON());
    assert.ok(text.includes(tr(item.expected_service_name)));
    assert.ok(!text.includes(item.service_name));
    await act(async () => tree.unmount());
  });
}

test('all shift variants group into one label per service, without merging different services', () => {
  const groups = new Map();
  for (const item of fixtures) {
    const names = groups.get(item.section_code) ?? new Set();
    names.add(labels.serviceDisplayName(item.service_name, item.section_code));
    groups.set(item.section_code, names);
  }
  assert.equal(groups.size, 4);
  for (const names of groups.values()) assert.equal(names.size, 1);
  assert.equal(new Set([...groups.values()].map(names => [...names][0])).size, 4);
});
