module.exports = function () {
	var argv = require('optimist').boolean(['v','a','no-errors', 'er', 'ep', 'ed']).argv;

	return {
		read : function (settings, argv) {
			return {
				directory : argv._.length > 0 ? argv._.slice(-1)[0] : ".",
				verbose : argv.v,
				includeAllFiles : argv.a,
				excludeReadErrors : argv.er,
				quitFirstError : argv["no-errors"],
				excludeParseErrors : argv.ep,
				includeEmptyDirectories : argv.ed,
				excludeFileNameRegex: Array.isArray(argv.ex) ? argv.ex : [argv.ex]
			};
		},
		argv : argv
	};
}();
