const { MongoMemoryServer } = require('mongodb-memory-server');

async function main() {
  const server = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      ip: '127.0.0.1',
      dbName: 'edvo_backend'
    }
  });

  console.log('Mongo memory server started');
  console.log(server.getUri());

  const shutdown = async () => {
    await server.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});