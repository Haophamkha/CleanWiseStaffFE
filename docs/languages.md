# Tiếng Việt / English – App nhân viên

Vào **Cá nhân → Cài đặt → Ngôn ngữ** để chọn **Tiếng Việt** hoặc **English**. Mặc định Tiếng Việt, độc lập với ngôn ngữ điện thoại và lựa chọn Sáng/Tối. Lựa chọn lưu trong AsyncStorage với khóa `cleanwise_staff_language`, độc lập với app khách và phiên đăng nhập.

## Cấu trúc

- `src/features/language/i18n.ts`: i18next instance, locale ngày giờ `vi-VN` / `en-US`, hai bộ bản dịch đóng gói cùng app, dùng được offline.
- `locales/vi.json`, `locales/en.json`: câu gốc tiếng Việt làm khóa; tắt `keySeparator` / `nsSeparator`. Nội dung động dùng `{{value0}}`, `{{value1}}`…; nhãn đếm dùng `count` để hỗ trợ số ít/số nhiều.
- `LanguageProvider.tsx`: khôi phục lựa chọn trước khi mount theme và màn hình; mặc định Việt khi bộ nhớ lỗi hoặc giá trị không hợp lệ. Đổi ngôn ngữ không remount màn hình, không đóng Cài đặt, không đổi theme hoặc trạng thái thông báo. Ghi bộ nhớ theo thứ tự để lần chọn cuối không bị ghi đè. Lỗi lưu được báo bằng ngôn ngữ đang chọn.
- `LanguageSettings.tsx`: hai radio Tiếng Việt / English, có trạng thái chọn cho trình đọc màn hình. Bảng Cài đặt cuộn được trên màn hình nhỏ.

Trong React component/hook dùng `const { t: tr } = useTranslation()` để cập nhật khi đổi ngôn ngữ. Alias `tr` tránh trùng các biến `t` có sẵn. Hàm thuần dùng `translate` / `getLocale` từ `i18n.ts`. Bảng nhãn và schema là factory `getLocalized…()` để không giữ bản dịch lúc import. Memo/callback tạo nội dung giao diện cần phụ thuộc `tr`.

## Phạm vi

Đã bản địa hóa nội dung thuộc app: điều hướng, đăng nhập/đăng ký, hồ sơ và xét duyệt, nhận việc/lời mời, check-in/hoàn thành/hủy nhận, lịch làm, thu nhập/ví, tài khoản nhận tiền, thông báo, khiếu nại, chat, trợ lý và cài đặt. Ngày giờ, tên thứ và phân cách số theo locale; tiền vẫn là VND, không đổi tỷ giá.

Mã trạng thái, giá trị biểu mẫu, ngày sinh gửi API (`YYYY-MM-DD`), số tiền và quy tắc nghiệp vụ giữ nguyên. Không tự dịch tin nhắn, tên người, địa chỉ, tên/mô tả dịch vụ, hướng dẫn, nội dung trả lời trợ lý, lý do khiếu nại hay lỗi trả từ backend. Những nội dung đó cần bản dịch từ backend để hỗ trợ hai ngôn ngữ đầy đủ. Bản đồ và widget hệ thống có thể vẫn theo ngôn ngữ thiết bị/nhà cung cấp.

## Kiểm tra

```powershell
npm run test:language
npm run test:theme
node node_modules/typescript/bin/tsc --noEmit
```

Kiểm thử dùng provider, ThemeProvider, AppearanceSettings, LanguageSettings và SettingsSheet thật với adapter nền tảng giả lập; kiểm tra khôi phục trước mount, đổi Việt/Anh, giữ draft/theme/thông báo/bảng Cài đặt, lỗi lưu, ghi nhanh, khóa/tham số bản dịch, ngày giờ/VND, validation và mã trạng thái. Kiểm thử hồi quy chat hai app cũng được chạy từ app khách.

Đã xem thử SettingsSheet thật ở khung 390px: đổi English, cuộn đủ nội dung và tải lại giữ ngôn ngữ. Harness độc lập không thay đổi đăng nhập hoặc gọi API. Ảnh ở `../output/staff-language/settings-english.png` tính từ thư mục project. Android Hermes export ở `../output/staff-language/android` là bundle, chưa phải APK cài trên điện thoại.

Cần kiểm tra thêm trên Android/iOS thật, cỡ chữ lớn và các luồng có dữ liệu backend thực tế.


## Rà soát chuyển Việt ↔ Anh — 04/11/2026

Nhánh Quang, sau cập nhật main. Đã phát hiện: StatusBadge không subscribe ngôn ngữ và kết quả map trạng thái bị React Compiler giữ lại; câu trống ở ChatInbox thiếu khóa English; mini calendar Trang chủ giữ THG, tháng trong các buổi dạng gói giữ Th, biểu đồ Thu nhập nhận T2…CN từ backend; tên dịch vụ/schema/nhãn giao dịch và nội dung thông báo hệ thống lấy nguyên tiếng Việt.

Sửa các helper/factory để nhận translator tr từ useTranslation làm dependency rõ ràng (kể cả locale/tiền/ngày). Thêm subscription vào các leaf chỉ dùng nhãn được tính từ global. Không remount app khi đổi ngôn ngữ. Chỉ localize metadata dịch vụ; không sửa key/value/conditions hoặc nội dung khách nhập. Preset schema và catalog hiện có được bổ sung bản dịch đóng gói. Giao dịch ví chỉ dịch mẫu hệ thống, giữ mã đơn và ghi chú tự do.

localizeNotificationText nhận diện whitelist/mẫu thông báo do hệ thống sinh, gồm mẫu cũ trong database. Dịch tiêu đề/thân bài và nhãn Lý do/Ghi chú; giữ nguyên tên người, mã đơn, thời gian được nhúng và nội dung ghi chú tự do. Mẫu điều chỉnh ví giữ dấu +/− và số tiền; không đổi tỷ giá. Thông báo tự do do admin soạn không khớp mẫu được giữ nguyên.

Đã kiểm tra trong phiên nhân viên người dùng đăng nhập: đổi en/vi/en/vi/en ở Cá nhân không reload; menu 8 mục và trạng thái hồ sơ đồng bộ. Công việc giữ tab Hoàn thành khi đổi lại Việt. Trang chủ English hiển thị NOV; lịch làm việc Việt đúng ngày/thứ; Thu nhập dùng Mon…Sun ở English và T2…CN khi đổi Việt, tiền dùng VND/đ theo locale. Thông báo thực tế đã dịch đủ ba mẫu trong phiên kiểm tra. Sau đó tiếp tục 4 vòng en/vi/en/vi không reload, không có menu mismatch; kết thúc ở tiếng Việt.

TypeScript đạt, 34 test đạt, Android Hermes export đạt (2259 modules). Kiểm thử Babel React Compiler thực tái hiện StatusBadge sai trước sửa rồi đạt sau sửa; bao phủ notification metadata, tabs, service schema/task list, mini calendar, earnings chart và template thông báo. Test hook profile đi qua Babel pipeline với hành vi fallback của compiler hiện tại. Test provider giữ draft, theme và preference. Không gửi nhận việc, check-in/out, thay đổi hồ sơ, chuyển tiền, đọc tất cả/xóa thông báo hoặc đăng xuất để kiểm tra.

Ảnh và log: ../output/staff-language-switch/. Chưa commit/push thay đổi trong lượt này. Chưa kiểm tra đầy đủ giao diện native Android/iOS sau sửa; Android đã kiểm tra khả năng build bundle.
