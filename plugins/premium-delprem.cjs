// Legacy CommonJS filename retained for old imports. The ESM delete command is
// canonical; disable this duplicate so only one handler processes delprem.
const handler = async m => m
handler.disabled = true
module.exports = handler
