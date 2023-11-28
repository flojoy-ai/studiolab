// package: flowchart
// file: flowchart.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as google_protobuf_any_pb from "google-protobuf/google/protobuf/any_pb";

export class FlowchartRequest extends jspb.Message { 

    hasStart(): boolean;
    clearStart(): void;
    getStart(): FlowchartStartRequest | undefined;
    setStart(value?: FlowchartStartRequest): FlowchartRequest;

    hasCancel(): boolean;
    clearCancel(): void;
    getCancel(): FlowchartCancelRequest | undefined;
    setCancel(value?: FlowchartCancelRequest): FlowchartRequest;

    hasControl(): boolean;
    clearControl(): void;
    getControl(): FlowchartControlRequest | undefined;
    setControl(value?: FlowchartControlRequest): FlowchartRequest;

    getRequestCase(): FlowchartRequest.RequestCase;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): FlowchartRequest.AsObject;
    static toObject(includeInstance: boolean, msg: FlowchartRequest): FlowchartRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: FlowchartRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): FlowchartRequest;
    static deserializeBinaryFromReader(message: FlowchartRequest, reader: jspb.BinaryReader): FlowchartRequest;
}

export namespace FlowchartRequest {
    export type AsObject = {
        start?: FlowchartStartRequest.AsObject,
        cancel?: FlowchartCancelRequest.AsObject,
        control?: FlowchartControlRequest.AsObject,
    }

    export enum RequestCase {
        REQUEST_NOT_SET = 0,
        START = 1,
        CANCEL = 2,
        CONTROL = 3,
    }

}

export class FlowchartStartRequest extends jspb.Message { 

    hasRf(): boolean;
    clearRf(): void;
    getRf(): google_protobuf_any_pb.Any | undefined;
    setRf(value?: google_protobuf_any_pb.Any): FlowchartStartRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): FlowchartStartRequest.AsObject;
    static toObject(includeInstance: boolean, msg: FlowchartStartRequest): FlowchartStartRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: FlowchartStartRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): FlowchartStartRequest;
    static deserializeBinaryFromReader(message: FlowchartStartRequest, reader: jspb.BinaryReader): FlowchartStartRequest;
}

export namespace FlowchartStartRequest {
    export type AsObject = {
        rf?: google_protobuf_any_pb.Any.AsObject,
    }
}

export class FlowchartCancelRequest extends jspb.Message { 

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): FlowchartCancelRequest.AsObject;
    static toObject(includeInstance: boolean, msg: FlowchartCancelRequest): FlowchartCancelRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: FlowchartCancelRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): FlowchartCancelRequest;
    static deserializeBinaryFromReader(message: FlowchartCancelRequest, reader: jspb.BinaryReader): FlowchartCancelRequest;
}

export namespace FlowchartCancelRequest {
    export type AsObject = {
    }
}

export class FlowchartControlRequest extends jspb.Message { 
    getBlockId(): string;
    setBlockId(value: string): FlowchartControlRequest;

    hasValue(): boolean;
    clearValue(): void;
    getValue(): google_protobuf_any_pb.Any | undefined;
    setValue(value?: google_protobuf_any_pb.Any): FlowchartControlRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): FlowchartControlRequest.AsObject;
    static toObject(includeInstance: boolean, msg: FlowchartControlRequest): FlowchartControlRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: FlowchartControlRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): FlowchartControlRequest;
    static deserializeBinaryFromReader(message: FlowchartControlRequest, reader: jspb.BinaryReader): FlowchartControlRequest;
}

export namespace FlowchartControlRequest {
    export type AsObject = {
        blockId: string,
        value?: google_protobuf_any_pb.Any.AsObject,
    }
}

export class FlowchartReply extends jspb.Message { 
    getBlockId(): string;
    setBlockId(value: string): FlowchartReply;

    hasValue(): boolean;
    clearValue(): void;
    getValue(): google_protobuf_any_pb.Any | undefined;
    setValue(value?: google_protobuf_any_pb.Any): FlowchartReply;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): FlowchartReply.AsObject;
    static toObject(includeInstance: boolean, msg: FlowchartReply): FlowchartReply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: FlowchartReply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): FlowchartReply;
    static deserializeBinaryFromReader(message: FlowchartReply, reader: jspb.BinaryReader): FlowchartReply;
}

export namespace FlowchartReply {
    export type AsObject = {
        blockId: string,
        value?: google_protobuf_any_pb.Any.AsObject,
    }
}
