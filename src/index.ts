import {Readable, PassThrough} from "stream";

export type ReadableFactory = () => Promise<Readable>;

export function MultiStream(sfs: ReadableFactory[]) {
    const pt = new PassThrough();
    const getReadableFromFactory = function(factory: () => Promise<Readable>, callback: (readable?: Readable, err?: any) => void) {
        factory()
        .then((readable) => {
            callback(readable, null);
        }).catch((err) => {
            callback(null, err);
        });
    };
    const getReadableAndPipe = (factory: () => Promise<Readable>, callback: (err: any) => void) => {
        getReadableFromFactory(factory, (readable, err) => {
            if (err) {
                callback(err);
            } else {
                readable.on("data", (chunk) => {
                    pt.write(chunk);
                }).on("end", () => {
                    callback(null);
                }).on("error", (err) => {
                    callback(err);
                });
            }
        });
    }
    const getIterativeRunner = (index: number) => {
        return () => {
            getReadableAndPipe(sfs[index], (err: any) => {
                if (err) {
                    pt.emit("error", err);
                } else {
                    if (index+1 < sfs.length) {
                        getIterativeRunner(index+1)();
                    } else {
                        pt.end();
                    }                    
                }
            });
        };
    };
    if (sfs.length > 0) {
        getIterativeRunner(0)();
    } else {
        pt.end();
    }
    return pt as Readable;
}