import { z } from "zod";

const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

export const loginSchema = z.object({
  phone: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại")
    .regex(phoneRegex, "Số điện thoại không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const forgotPasswordSchema = z.object({
  contact: z.string().min(1, "Vui lòng nhập email"),
});
