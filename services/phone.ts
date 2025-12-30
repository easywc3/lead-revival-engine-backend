export function normalizePhone(input: string): string {
  if (!input) return "";

  // Remove everything except digits
  let digits = input.replace(/\D/g, "");

  // Handle US numbers
  if (digits.length === 10) {
    return "+1" + digits;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return "+" + digits;
  }

  // Already in E.164
  if (input.startsWith("+") && digits.length >= 11) {
    return "+" + digits;
  }

  throw new Error("Invalid phone number format");
}
