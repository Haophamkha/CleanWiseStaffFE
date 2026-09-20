import { z } from "zod";

const phoneRegex = /^(0[35789])[0-9]{8}$/;

const birthDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const loginSchema = z.object({
  phone: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại")
    .regex(phoneRegex, "Số điện thoại không hợp lệ"),

  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const forgotPasswordSchema = z.object({
  contact: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
});

export const registerWorkerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập tên đăng nhập")
      .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
      .max(30, "Tên đăng nhập không được quá 30 ký tự"),

    email: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập email")
      .email("Email không hợp lệ"),

    first_name: z.string().trim().min(1, "Vui lòng nhập họ"),

    last_name: z.string().trim().min(1, "Vui lòng nhập tên"),

    phone_number: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập số điện thoại")
      .regex(phoneRegex, "Số điện thoại không hợp lệ"),

    gender: z.enum(["MALE", "FEMALE", "OTHER"], {
      message: "Vui lòng chọn giới tính",
    }),

    birth_date: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập ngày sinh")
      .regex(birthDateRegex, "Ngày sinh phải có định dạng YYYY-MM-DD")
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
        {
          message: "Ngày sinh không hợp lệ",
        },
      ),

    password: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu")
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),

    password_confirm: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["password_confirm"],
  });
