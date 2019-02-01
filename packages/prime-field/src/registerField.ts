export interface RegisterField {
  InputComponent?: React.ReactNode;
  SchemaSettingsComponent: React.ReactNode;
}

export function registerField(name: string, field: RegisterField): RegisterField {
  if (typeof window !== 'undefined') {
    const win: any = window;
    if (win.prime && win.prime.registerField) {
      win.prime.registerField(name, field);
    }
  }

  return field;
}
