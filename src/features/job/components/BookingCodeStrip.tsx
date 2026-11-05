import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/features/theme/ThemeProvider";

import { Platform, Text, View } from "react-native";

const MONO = Platform.select({ ios: "Menlo", default: "monospace" });

export function BookingCodeStrip({ code }: { code: string }) {
  const { t: tr } = useTranslation();
  const { COLORS } = useAppTheme();

  return (
    <View
      className="flex-row items-center rounded-xl px-3 py-2 mb-2.5"
      style={{ backgroundColor: COLORS.accentLight }}
    >
      <Text
        className="text-ink-muted text-[10px] font-bold mr-2"
        style={{ letterSpacing: 0.6 }}
      >
        {tr("MÃ ĐƠN")}
      </Text>
      <Text
        selectable
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
        className="flex-1 text-ink text-[13.5px] font-extrabold"
        style={{ fontFamily: MONO, letterSpacing: 0.3 }}
      >
        {code}
      </Text>
    </View>
  );
}