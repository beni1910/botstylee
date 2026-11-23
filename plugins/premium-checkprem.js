// Legacy CommonJS filename retained for old imports. The ESM check command is
// canonical; disable this duplicate to avoid command registration collisions.
const handler = async m => m
handler.disabled = true
module.exports = handler
