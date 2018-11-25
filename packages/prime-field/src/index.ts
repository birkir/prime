export default class PrimeField {

  // Internal Hooks
  internalExpressHook({ app }) {}
  internalApolloHook({ queries, mutations }) {}

  // External Lifecycle hooks
  findAllHook({ findOptions }) {}
  findHook({ findOptions }) {}
  createHook() {}
  updateHook() {}
  deleteHook() {}
  apolloHook() {}

  // GraphQL types
  GraphQL() {}
  GraphQLInput() {}
  GraphQLWhere() {}
}

export function registerField(name: string, field: any) {
  if (typeof window !== 'undefined') {
    if ((window as any).prime && (window as any).prime.registerField) {
      (window as any).prime.registerField(name, field);
    }
  }
  return field;
}
