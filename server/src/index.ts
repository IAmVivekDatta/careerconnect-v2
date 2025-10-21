import app from './server';
import { env } from './config/env';
import { connectDatabase } from './config/mongodb';

const port = env.PORT;

async function bootstrap() {
  try {
    await connectDatabase();
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

void bootstrap();
