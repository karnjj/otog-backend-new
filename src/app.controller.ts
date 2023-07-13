import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { AccessState } from './core/constants';
import { OfflineAccess } from './core/decorators/offline-mode.decorator';
import {
  TsRestHandler,
  nestControllerContract,
  tsRestHandler,
} from '@ts-rest/nest';
import { appRouter } from './api';

const c = nestControllerContract(appRouter);

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @TsRestHandler(c.time)
  @OfflineAccess(AccessState.Public)
  serverTime() {
    return tsRestHandler(c.time, async () => {
      return { status: 200, body: new Date() };
    });
  }

  @TsRestHandler(c.ping)
  pingServer() {
    return tsRestHandler(c.ping, async () => {
      return { status: 200, body: 'pong' };
    });
  }
}
