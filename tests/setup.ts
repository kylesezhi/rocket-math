// jsdom does not implement URL.createObjectURL/revokeObjectURL.
// Provide minimal stubs so components that generate PDF object URLs can render in tests.
if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = () => 'blob:mock-object-url';
}
if (typeof URL.revokeObjectURL !== 'function') {
  URL.revokeObjectURL = () => {};
}