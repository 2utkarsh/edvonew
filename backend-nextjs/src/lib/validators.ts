export type RegisterInput = {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  mobile?: string;
};

export type LoginInput = {
  email?: string;
  password?: string;
};

export function validateRegisterInput(input: RegisterInput) {
  if (!input.name || input.name.trim().length < 2) return 'Name must be at least 2 characters';
  if (!input.email || !/\S+@\S+\.\S+/.test(input.email)) return 'Valid email is required';
  if (!input.password || input.password.length < 8) return 'Password must be at least 8 characters';
  if (input.password !== input.password_confirmation) return 'Passwords do not match';
  return null;
}

export function validateLoginInput(input: LoginInput) {
  if (!input.email || !/\S+@\S+\.\S+/.test(input.email)) return 'Valid email is required';
  if (!input.password || input.password.length < 6) return 'Password is required';
  return null;
}

export function validateEmail(value?: string) {
  if (!value || !/\S+@\S+\.\S+/.test(value)) return 'Valid email is required';
  return null;
}

