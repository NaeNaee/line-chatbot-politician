import { Router, Request, Response } from 'express';
import { EventMessage, middleware, ReplyableEvent, WebhookEvent } from '@line/bot-sdk';
import { HttpStatusCode } from '../mics/Enumeration';
import Config from '../config/LineConfig';
import GlobalConfig from '../config/GlobalConfig';
import Client from '@line/bot-sdk/dist/client';
import axios from 'axios';

const router: Router = Router();
const client: Client = new Client(Config);
const api = axios.create({
    baseURL: GlobalConfig.url
});

function random(count: number, exist: number[]) {
    let result = Math.floor(Math.random() * count);

    while (exist.includes(result)) {
        result = Math.floor(Math.random() * count);
    }

    return result;
}

router.post('/', middleware(Config), (req: Request, res: Response) => {
    if (!Array.isArray(req.body.events)) {
        return res.sendStatus(HttpStatusCode.InternalServerError).end();
    }

    const event: WebhookEvent & ReplyableEvent = req.body.events[0];

    switch (event.type) {
        case 'message':
            const message: EventMessage = event.message;

            if (message.type === 'text') {
                if (message.text === 'ทั้งหมด') {
                    api.get('/politician')
                        .then(res => {
                            const data: any[] = res.data.items;
                            const columns: any[] = [];
                            const randomIndex: number[] = [];

                            for (let i = 0; i < 10; i++) {
                                const index = random(data.length, randomIndex);

                                columns.push({
                                    "thumbnailImageUrl": data[index].picture,
                                    "title": data[index].name,
                                    "text": data[index].partyName,
                                    "actions": [
                                        {
                                            "type": "message",
                                            "label": "รายละเอียด",
                                            "text": data[index].name
                                        },
                                    ]
                                })

                                randomIndex.push(index);
                            }

                            client.replyMessage(event.replyToken, {
                                "type": "template",
                                "altText": "รายชื่อนักการเมือง",
                                "template": {
                                    "type": "carousel",
                                    "columns": columns.slice(0, 9)
                                }
                            })
                        })
                        .catch(err => console.log('errrr', err))
                } else {
                    client.replyMessage(event.replyToken, {
                        type: 'text',
                        text: message.text
                    })
                }
            }
    }

    res.end();
});

export const WebhookController: Router = router;
