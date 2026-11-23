// Legacy CommonJS filename kept for compatibility with existing imports.
// premium-addprem.js is canonical; disabling this duplicate prevents the same
// command from being registered twice by the plugin loader.
const handler = async m => m
handler.disabled = true
module.exports = handler
