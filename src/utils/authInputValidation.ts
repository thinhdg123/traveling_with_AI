import { LoginFormData, RegisterFormData, AuthError } from '../types/AuthType';

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return 'Email không được để trống';
  }
  if (!emailRegex.test(email)) {
    return 'Email không đúng định dạng';
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Mật khẩu không được để trống';
  }
  if (password.length < 6) {
    return 'Mật khẩu phải có ít nhất 6 ký tự';
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Mật khẩu phải có ít nhất một chữ thường';
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Mật khẩu phải có ít nhất một chữ hoa';
  }
  if (!/(?=.*\d)/.test(password)) {
    return 'Mật khẩu phải có ít nhất một số';
  }
  return null;
};

export const validateLoginForm = (data: LoginFormData): AuthError[] => {
  const errors: AuthError[] = [];

  const emailError = validateEmail(data.email);
  if (emailError) {
    errors.push({ message: emailError, field: 'email' });
  }

  const passwordError = validatePassword(data.password);
  if (passwordError) {
    errors.push({ message: passwordError, field: 'password' });
  }

  return errors;
};

export const validateRegisterForm = (data: RegisterFormData & { confirmPassword?: string }): AuthError[] => {
  const errors: AuthError[] = [];

  const emailError = validateEmail(data.email);
  if (emailError) {
    errors.push({ message: emailError, field: 'email' });
  }

  const passwordError = validatePassword(data.password);
  if (passwordError) {
    errors.push({ message: passwordError, field: 'password' });
  }

  // Validate password confirmation
  if (!data.confirmPassword) {
    errors.push({ message: 'Vui lòng xác nhận lại mật khẩu', field: 'confirmPassword' });
  } else if (data.password !== data.confirmPassword) {
    errors.push({ message: 'Mật khẩu xác nhận không khớp', field: 'confirmPassword' });
  }

  return errors;
};

export const extractFormData = (form: HTMLFormElement): LoginFormData | RegisterFormData => {
  const formData = new FormData(form);
  const data: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    data[key] = value.toString().trim();
  }

  return data as unknown as LoginFormData | RegisterFormData;
};