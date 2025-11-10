import { createServer } from 'http';
import app from './server';
import { env } from './config/env';
import { connectDatabase } from './config/mongodb';
import { initSocket } from './sockets';

const port = env.PORT;

async function bootstrap() {
  try {
    await connectDatabase();
    const server = createServer(app);
    initSocket(server);
    server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

void bootstrap();
