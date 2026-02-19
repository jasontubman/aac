// Validation utilities

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateName(name: string): boolean {
  return name.trim().length >= 1 && name.trim().length <= 50;
}

export function validateGridSize(cols: number, rows: number): boolean {
  return cols >= 2 && cols <= 6 && rows >= 2 && rows <= 6;
}

export function validateButtonLabel(label: string): boolean {
  return label.trim().length >= 1 && label.trim().length <= 50;
}

export function validateSpeechText(text: string): boolean {
  return text.trim().length >= 1 && text.trim().length <= 200;
}
