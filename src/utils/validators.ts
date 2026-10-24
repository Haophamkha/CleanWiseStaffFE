import { translate as tr } from "@/features/language/i18n";
import { z } from "zod";

const phoneRegex = /^(0[35789])[0-9]{8}$/;

const birthDateRegex = /^\d{4}-\d{2}-\d{2}$/;

const calcAge = (year: number, month: number, day: number) => {
  const today = new Date();
  let age = today.getFullYear() - year;
  const hadBirthday =
    today.getMonth() + 1 > month ||
    (today.getMonth() + 1 === month && today.getDate() >= day);
  if (!hadBirthday) age--;
  return age;
};

export function getLocalizedLoginSchema() {
  return z.object({
    phone: z
      .string()
      .min(1, tr("Vui lòng nhập số điện thoại"))
      .regex(phoneRegex, tr("Số điện thoại không hợp lệ")),

    password: z.string().min(1, tr("Vui lòng nhập mật khẩu")),
  });
}

export function getLocalizedForgotPasswordSchema() {
  return z.object({
    contact: z.string().min(1, tr("Vui lòng nhập email")).email(tr("Email không hợp lệ")),
  });
}

export function getLocalizedRegisterWorkerSchema() {
  return z
    .object({
      username: z
        .string()
        .trim()
        .min(1, tr("Vui lòng nhập tên đăng nhập"))
        .min(3, tr("Tên đăng nhập phải có ít nhất 3 ký tự"))
        .max(30, tr("Tên đăng nhập không được quá 30 ký tự")),

      email: z
        .string()
        .trim()
        .min(1, tr("Vui lòng nhập email"))
        .email(tr("Email không hợp lệ")),

      // first_name = Tên, last_name = Họ và tên đệm (khớp BE)
      first_name: z.string().trim().min(1, tr("Vui lòng nhập tên")),

      last_name: z.string().trim().min(1, tr("Vui lòng nhập họ và tên đệm")),

      phone_number: z
        .string()
        .trim()
        .min(1, tr("Vui lòng nhập số điện thoại"))
        .regex(phoneRegex, tr("Số điện thoại không hợp lệ")),

      gender: z.enum(["MALE", "FEMALE", "OTHER"], {
        message: tr("Vui lòng chọn giới tính"),
      }),

      birth_date: z
        .string()
        .trim()
        .min(1, tr("Vui lòng nhập ngày sinh"))
        .regex(birthDateRegex, tr("Ngày sinh phải có định dạng YYYY-MM-DD"))
        .refine(
          (value) => {
            const [year, month, day] = value.split("-").map(Number);
            const date = new Date(year, month - 1, day);

            return (
              date.getFullYear() === year &&
              date.getMonth() === month - 1 &&
              date.getDate() === day
            );
          },
          { message: tr("Ngày sinh không hợp lệ") },
        )
        .refine(
          (value) => {
            const [year, month, day] = value.split("-").map(Number);
            return calcAge(year, month, day) >= 18;
          },
          { message: tr("Nhân viên phải đủ 18 tuổi") },
        ),

      password: z
        .string()
        .min(1, tr("Vui lòng nhập mật khẩu"))
        .min(8, tr("Mật khẩu phải có ít nhất 8 ký tự")),

      password_confirm: z.string().min(1, tr("Vui lòng xác nhận mật khẩu")),
    })
    .refine((data) => data.password === data.password_confirm, {
      message: tr("Mật khẩu xác nhận không khớp"),
      path: ["password_confirm"],
    });
}
