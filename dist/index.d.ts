/// <reference types="node" />
import { Readable } from "stream";
export declare type ReadableFactory = () => Promise<Readable>;
export declare function MultiStream(sfs: ReadableFactory[]): Readable;
