# Giao diện sáng / tối – app nhân viên

Vào **Cá nhân → Cài đặt → Giao diện** để chọn **Sáng** hoặc **Tối**. Mặc định là Sáng; lựa chọn Theo hệ thống đã lưu từ phiên bản cũ cũng trở về Sáng. Lựa chọn được áp dụng ngay và lưu vào AsyncStorage với khóa `cleanwise_staff_appearance`, độc lập với app khách và phiên đăng nhập.

`tokens.js` chứa hai bảng màu. NativeWind dùng biến màu để cập nhật các class hiện có. Các component sử dụng màu trực tiếp lấy `COLORS` / `GRADIENTS` từ `useAppTheme()` trong `src/features/theme/ThemeProvider.tsx`. Không dùng bộ màu sáng tĩnh cho UI mới. Màu nền nút đỏ dùng `primaryFill` / `bg-primary-fill`; chữ, icon nhấn mạnh dùng `primary` / `text-primary`.

Theme được tải trước khi hiện màn hình, đồng bộ với điều hướng, nền hệ thống, status bar và bàn phím hỗ trợ `keyboardAppearance`. Đổi theme không dựng lại cây màn hình nên giữ nội dung đang nhập và trạng thái bảng Cài đặt. Các yêu cầu lưu được xếp hàng để lần chọn cuối không bị ghi đè khi bấm nhanh. Nếu bộ nhớ lỗi, ứng dụng vẫn đổi giao diện và báo chưa lưu được.

Kiểm tra tự động: `npm run test:theme` và `npx tsc --noEmit`. Các bài kiểm tra chạy provider, SettingsSheet và PrimaryButton thật với adapter nền tảng giả lập; kiểm tra khôi phục lựa chọn, mặc định Sáng, không phụ thuộc giao diện hệ thống, lỗi bộ nhớ, thứ tự lưu và độ tương phản. Cần kiểm tra thêm trên Android/iOS thật với bàn phím, thanh hệ thống, bảng trượt và các cỡ chữ lớn.
