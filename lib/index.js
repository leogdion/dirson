var async = require("async"),
	fs = require("fs"),
	path = require("path");

module.exports = (function () {
	var my = function (configuration) {
		this.configuration = configuration;
	};

	my.readdir = function (configuration, callback) {
		var that = new my(configuration);
		return that.readdir(callback);
	};

	my.prototype = {
		readdir : function (callback, dir) {
			dir = dir || this.configuration.directory;
			fs.readdir(dir, this.parseItems.bind(this, callback, dir));
		},
		parseItems : function (callback, dir, error, files) {
			if (error) {
				callback(error);
				return;
			}
			async.reduce(files,{},this.parseItem.bind(this, dir),callback);
		},
		parseItem : function (dir, memo, file, callback) {
			fs.stat(path.join(dir, file), this.stat.bind(this, dir, memo, file, callback))
		},
		stat : function (dir, memo, file, callback, error, stat) {
			if (error) {
				callback(error);
			} else if (stat.isFile()) {
				if (path.extname(file) == ".json") {
					fs.readFile(path.join(dir, file), this.filedata.bind(this, memo, path.basename(file, ".json"), callback));
				} else {
					callback(undefined, memo);
				}
			} else {
				this.readdir(this.dirread.bind(this, memo, file, callback), path.join(dir, file));
			}
		},
		filedata : function (memo, file, callback, error, data) {
			if (error) {
				memo[file] = error;
				callback(undefined, memo);
			} else {
				try {
				  memo[file] = JSON.parse(data);
			      callback(null, memo);
			    } catch(exception) {
				  memo[file] = exception;
			      callback(null, memo);
			    }				
			}
		},
		dirread : function (memo, file, callback, error, obj) {
			if (obj.length > 0 || this.configuration.includeEmptyDirectories) {
				var result = {};
				memo[file] = obj;
			}
			callback(undefined, memo);
		}

	};

	return my;
})();