module.exports = function () {
	return {
		read : function (settings, arguments) {
			return {
				directory : arguments[0] || "."
			};
		}
	};
}();
