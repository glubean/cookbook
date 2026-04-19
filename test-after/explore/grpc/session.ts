import { configure, defineSession } from "@glubean/sdk";
import { grpc } from "@glubean/grpc";
import * as grpcJs from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const PROTO_PATH = "protos/greeter.proto";

// ---------------------------------------------------------------------------
// Module-level: start a local gRPC server
// ---------------------------------------------------------------------------

const pkgDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpcJs.loadPackageDefinition(pkgDef);
const pkg = (proto.demo as grpcJs.GrpcObject).greeter as grpcJs.GrpcObject;
const v1 = pkg.v1 as grpcJs.GrpcObject;
const Service = v1.GreeterService as grpcJs.ServiceClientConstructor;

const server = new grpcJs.Server();
server.addService(Service.service, {
  SayHello: (
    call: grpcJs.ServerUnaryCall<{ name: string }, { message: string }>,
    cb: grpcJs.sendUnaryData<{ message: string }>,
  ) => {
    cb(null, { message: `Hello, ${call.request.name}!` });
  },
});

const port = await new Promise<number>((resolve, reject) => {
  server.bindAsync(
    "127.0.0.1:0",
    grpcJs.ServerCredentials.createInsecure(),
    (err, p) => (err ? reject(err) : resolve(p)),
  );
});

// ---------------------------------------------------------------------------
// Client via configure() — auto-wires trace events to Glubean runtime
// ---------------------------------------------------------------------------

export const { greeter: client } = configure({
  plugins: {
    greeter: grpc({
      proto: PROTO_PATH,
      address: `127.0.0.1:${port}`,
      package: "demo.greeter.v1",
      service: "GreeterService",
    }),
  },
});

// ---------------------------------------------------------------------------
// Session lifecycle
// ---------------------------------------------------------------------------

export default defineSession({
  async setup(ctx) {
    ctx.log(`gRPC server listening on 127.0.0.1:${port}`);
  },
  async teardown(ctx) {
    client.close();
    server.forceShutdown();
    ctx.log("gRPC server stopped");
  },
});
