from concurrent import futures

import grpc

from captain.routers.blocks import Flowchart

# from captain.routers import blocks, status
from protos import flowchart_pb2_grpc, hello_pb2, hello_pb2_grpc

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware


#
# app = FastAPI()
#
# app.include_router(blocks.router)
# app.include_router(status.router)
#
#
# origins = [
#     "http://localhost",
#     "http://localhost:2334",
# ]
#
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
#


class Greeter(hello_pb2_grpc.GreeterServicer):
    def SayHello(self, request, context):
        return hello_pb2.HelloReply(message="Hello, %s!" % request.name)


def serve():
    port = "2333"
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    hello_pb2_grpc.add_GreeterServicer_to_server(Greeter(), server)
    flowchart_pb2_grpc.add_FlowchartServicer_to_server(Flowchart(), server)
    server.add_insecure_port("[::]:" + port)
    server.start()
    print("Server started, listening on " + port, flush=True)
    server.wait_for_termination()


if __name__ == "__main__":
    # import uvicorn
    #
    # uvicorn.run("main:app", port=2333, reload=True)

    serve()
