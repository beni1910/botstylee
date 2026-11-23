// The ESM command plugin is canonical. Disable the legacy duplicate to avoid
// registering the same Tic-Tac-Toe command twice.
const handler = m => m
handler.disabled = true
module.exports = handler
