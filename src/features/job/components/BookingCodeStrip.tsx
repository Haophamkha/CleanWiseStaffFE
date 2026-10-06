import { COLORS } from "@/constants/theme";
import { Platform, Text, View } from "react-native";

const MONO = Platform.select({ ios: "Menlo", default: "monospace" });

export function BookingCodeStrip({ code }: { code: string }) {
  return (
    <View
      className="flex-row flex-wrap items-center rounded-xl px-3 py-2.5 mb-3"
      style={{ backgroundColor: COLORS.accentLight }}
    >
      <Text
        className="text-ink-muted text-[10.5px] font-bold mr-2"
        style={{ letterSpacing: 0.6 }}
      >
        MÃ ĐƠN
      </Text>
      <Text
        selectable
        className="text-ink text-[15px] font-extrabold"
        style={{ fontFamily: MONO, letterSpacing: 0.8 }}
      >
        {code}
      </Text>
    </View>
  );
}
