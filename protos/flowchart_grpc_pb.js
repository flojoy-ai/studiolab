// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var flowchart_pb = require('./flowchart_pb.js');
var google_protobuf_any_pb = require('google-protobuf/google/protobuf/any_pb.js');

function serialize_flowchart_FlowchartReply(arg) {
  if (!(arg instanceof flowchart_pb.FlowchartReply)) {
    throw new Error('Expected argument of type flowchart.FlowchartReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_flowchart_FlowchartReply(buffer_arg) {
  return flowchart_pb.FlowchartReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_flowchart_FlowchartRequest(arg) {
  if (!(arg instanceof flowchart_pb.FlowchartRequest)) {
    throw new Error('Expected argument of type flowchart.FlowchartRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_flowchart_FlowchartRequest(buffer_arg) {
  return flowchart_pb.FlowchartRequest.deserializeBinary(new Uint8Array(buffer_arg));
}


var FlowchartService = exports.FlowchartService = {
  runFlowchart: {
    path: '/flowchart.Flowchart/RunFlowchart',
    requestStream: true,
    responseStream: true,
    requestType: flowchart_pb.FlowchartRequest,
    responseType: flowchart_pb.FlowchartReply,
    requestSerialize: serialize_flowchart_FlowchartRequest,
    requestDeserialize: deserialize_flowchart_FlowchartRequest,
    responseSerialize: serialize_flowchart_FlowchartReply,
    responseDeserialize: deserialize_flowchart_FlowchartReply,
  },
};

exports.FlowchartClient = grpc.makeGenericClientConstructor(FlowchartService);
