import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, '../proto/interface.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const emotionProto = grpc.loadPackageDefinition(packageDefinition).emotion as any;

export const grpcClient = new emotionProto.EmotionService(
  process.env.GRPC_SERVER_URL || 'localhost:50051',
  grpc.credentials.createInsecure()
);
