// Legacy CommonJS filename retained for backwards-compatible imports. The ESM
// list command is canonical; disable this duplicate to prevent duplicate output.
const handler = async m => m
handler.disabled = true
module.exports = handler
