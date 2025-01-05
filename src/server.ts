import express, { Router } from 'express';

import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

interface Options {
    port: number;
    routes: Router;
    public_path: string;
}

export class ServerApp {
    public readonly app = express();
    private readonly pathRoutes: string = '/api/v1';
    private readonly port: number;
    private readonly publicPath: string;
    private readonly routes: Router;
    private serverListener?: any;

    constructor(options: Options) {
        const { port, routes, public_path } = options;

        this.port = port;
        this.publicPath = public_path;
        this.routes = routes;
    }

    public async start() {
        // * Middlewares
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(compression());

        // * CORS
        this.app.use(cors());

        // * Security
        this.app.use(
            helmet({
                xXssProtection: true,
            }),
        );

        // * Rate Limit
        this.app.use(
            rateLimit({
                windowMs: 1 * 60 * 1000, // 1 minutes
                max: 100, // Limit each IP to 100 requests per `window` (here, per 1 minutes).
                standardHeaders: 'draft-7',
                legacyHeaders: false,
            }),
        );

        // * Public Folder
        this.app.use(express.static(this.publicPath));

        // * Routes
        this.app.use(this.pathRoutes, this.routes);

        // * Run Server
        this.serverListener = this.app.listen(this.port, () => {
            const link = `http://localhost:${this.port}`;
            console.log(
                `🚀🙌🎉🔥🔥🚀 Server ignited and running on port ${this.port} 🚀🙌🎉🔥🔥🚀`,
            );
            console.log(`✅ Access it at: ➡️ ${link} ✅`);
        });
    }

    public close() {
        this.serverListener.close();
    }
}
