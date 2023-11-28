// package: flowchart
// file: flowchart.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "grpc";
import * as flowchart_pb from "./flowchart_pb";
import * as google_protobuf_any_pb from "google-protobuf/google/protobuf/any_pb";

interface IFlowchartService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    runFlowchart: IFlowchartService_IRunFlowchart;
}

interface IFlowchartService_IRunFlowchart extends grpc.MethodDefinition<flowchart_pb.FlowchartRequest, flowchart_pb.FlowchartReply> {
    path: "/flowchart.Flowchart/RunFlowchart";
    requestStream: true;
    responseStream: true;
    requestSerialize: grpc.serialize<flowchart_pb.FlowchartRequest>;
    requestDeserialize: grpc.deserialize<flowchart_pb.FlowchartRequest>;
    responseSerialize: grpc.serialize<flowchart_pb.FlowchartReply>;
    responseDeserialize: grpc.deserialize<flowchart_pb.FlowchartReply>;
}

export const FlowchartService: IFlowchartService;

export interface IFlowchartServer {
    runFlowchart: grpc.handleBidiStreamingCall<flowchart_pb.FlowchartRequest, flowchart_pb.FlowchartReply>;
}

export interface IFlowchartClient {
    runFlowchart(): grpc.ClientDuplexStream<flowchart_pb.FlowchartRequest, flowchart_pb.FlowchartReply>;
    runFlowchart(options: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<flowchart_pb.FlowchartRequest, flowchart_pb.FlowchartReply>;
    runFlowchart(metadata: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<flowchart_pb.FlowchartRequest, flowchart_pb.FlowchartReply>;
}

export class FlowchartClient extends grpc.Client implements IFlowchartClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public runFlowchart(options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<flowchart_pb.FlowchartRequest, flowchart_pb.FlowchartReply>;
    public runFlowchart(metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<flowchart_pb.FlowchartRequest, flowchart_pb.FlowchartReply>;
}
