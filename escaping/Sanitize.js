var Caja = require('./GoogleCaja.js');

module.exports = function sanitize_Data () {
	return Caja.escape(this.str);
};