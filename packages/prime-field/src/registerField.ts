export interface RegisterField {
  InputComponent?: React.ReactNode;
  SchemaSettingsComponent: React.ReactNode;
}

export function registerField(name: string, field: RegisterField): RegisterField {
  const win: any =
    typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : undefined;
  if (win && win.prime && win.prime.registerField) {
    win.prime.registerField(name, field);
  }

  return field;
}
