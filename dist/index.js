"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stream_1 = require("stream");
function MultiStream(sfs) {
    var pt = new stream_1.PassThrough();
    var getReadableFromFactory = function (factory, callback) {
        factory()
            .then(function (readable) {
            callback(readable, null);
        }).catch(function (err) {
            callback(null, err);
        });
    };
    var getReadableAndPipe = function (factory, callback) {
        getReadableFromFactory(factory, function (readable, err) {
            if (err) {
                callback(err);
            }
            else {
                readable.on("data", function (chunk) {
                    pt.write(chunk);
                }).on("end", function () {
                    callback(null);
                }).on("error", function (err) {
                    callback(err);
                });
            }
        });
    };
    var getIterativeRunner = function (index) {
        return function () {
            getReadableAndPipe(sfs[index], function (err) {
                if (err) {
                    pt.emit("error", err);
                }
                else {
                    if (index + 1 < sfs.length) {
                        getIterativeRunner(index + 1)();
                    }
                    else {
                        pt.end();
                    }
                }
            });
        };
    };
    if (sfs.length > 0) {
        getIterativeRunner(0)();
    }
    else {
        pt.end();
    }
    return pt;
}
exports.MultiStream = MultiStream;
//# sourceMappingURL=index.js.map