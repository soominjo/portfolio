// Switches the test setup reads. Tests flip them before rendering;
// setup.ts resets them after every test.
export const reducedMotion = { value: false }

// `isIntersecting` applies to every observed element; `byId` overrides it for
// elements with a matching id (for code that observes several sections).
export const intersection: { isIntersecting: boolean; byId: Record<string, boolean> } = {
  isIntersecting: false,
  byId: {},
}
