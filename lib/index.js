var async = require("async"),
fs = require("fs"),
path = require("path");

module.exports = (function () {
	function merge (memo, key, src, callback) {
		if (memo[key]) {
			var dest = memo[key];
			async.each(Object.keys(src),
				function (item, cb) {
					if (dest[key]) {
						cb(key);
					} else {
						memo[key][item] = src[item];
					}
				},
				function (error) {
					callback(error, memo);
				});
			callback(undefined, memo);
		} else {
			memo[key] = src;
			callback(undefined, memo);
		}
	}
	var my = function (configuration) {
		this.configuration = configuration;
	};

	my.prototype = {
		debug : function (message) {
			if (this.configuration.verbose) {
				console.log(message);
			}
		},
		readdir : function (callback, dir) {
			dir = dir || this.configuration.directory;
			this.debug(dir);
			fs.readdir(dir, this.parseFiles.bind(this, callback, dir));
		},
		parseFiles : function (callback, dir, error, files) {
			if (error) {
				callback(error);
				return;
			}
			async.reduce(files,{},this.parseFile.bind(this, dir),callback);
		},
		parseFile : function (dir, memo, file, callback) {
			fs.stat(path.join(dir, file), this.parseFileStat.bind(this, dir, memo, file, callback))
		},
		parseFileStat : function (dir, memo, file, callback, error, stat) {
			if (error) {
				callback(error);
			} else if (stat.isFile()) {
				if (path.extname(file) == ".json") {
					fs.readFile(path.join(dir, file), this.parseData.bind(this, memo, path.basename(file, ".json"), callback));
				} else {
					if (this.includes(file)) {
						memo[file] = null;
					}
					callback(undefined, memo);
				}
			} else {
				this.readdir(this.dirread.bind(this, memo, file, callback), path.join(dir, file));
			}
		},
		includes : function (fileName) {
			return this.configuration.includeAllFiles && (!this.configuration.excludeFileNameRegex || !this.configuration.excludeFileNameRegex.some(function (element) {
				return (new RegExp(element, "i")).test(fileName);
			}));
		},
		parseData : function (memo, file, callback, error, data) {
			if (error) {
				if (this.configuration.excludeReadErrors) {
					memo[file] = error;
				}
				if (this.configuration.quitFirstError) {
					callback(error, memo);
				} else {
					callback(undefined, memo);
				}
			} else {
				try {
					merge(memo, file, JSON.parse(data), callback);
				} catch(exception) {
					if (this.configuration.excludeParseErrors) {
						memo[file] = exception;
					}
					if (this.configuration.quitFirstError) {
						callback(error, memo);
					} else {
						callback(null, memo);
					}
				}
			}
		},
		dirread : function (memo, file, callback, error, obj) {
			if (Object.keys(obj).length > 0 || this.configuration.includeEmptyDirectories) {
				merge(memo, file, obj, callback);
			} else {
				callback(undefined, memo);
			}
		}

	};

	return {
		readdir : function (configuration, callback) {
			var that = new my(configuration);
			return that.readdir(callback);
		}
	};
})();