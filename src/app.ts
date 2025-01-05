import { ServerApp } from './server';
import { AppRoutes } from './routes/index.routes';
import { envs } from './config/adapters';

(async () => {
    await main();
})();

async function main() {
    const server = new ServerApp({
        port: envs.PORT,
        routes: AppRoutes.routes,
        public_path: envs.PUBLIC_PATH,
    });

    server.start();
}
