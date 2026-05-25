export type SignUpFormData = {
  name: string;
  email: string;
  password: string; // 🔥 Added password field type
  domain: string;
  stack: string; // Single string for 1 selection
  role: string;
};