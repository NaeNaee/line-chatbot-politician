import express from 'express';
import { WebhookController } from './controllers';

const app: express.Application = express();
const port: number = (process.env as any).PORT || 3000;

app.use('/webhook', WebhookController);

app.listen(port, () => {
    console.log('Listen on port ' + port);
});