import { Inject, Injectable } from '@angular/core';
import { WhiteRabbitWebsocketService } from '../white-rabbit-websocket.service';
import { FakeDataParams } from '../../../models/scan-data/fake-data-params';
import { FakeDataService } from '../../../services/white-rabbit/fake-data.service';
import { switchMap } from 'rxjs/operators';
import { authInjector } from '../../../services/auth/auth-injector';

@Injectable()
export class FakeDataWebsocketService extends WhiteRabbitWebsocketService {

  endPoint = 'fake-data'

  constructor(private fakeDataService: FakeDataService, @Inject(authInjector) authService) {
    super(authService)
  }

  send(data: {params: FakeDataParams, report: File}): void {
    const {params, report} = data
    this.fakeDataService.getUserSchema()
      .pipe(
        switchMap(schema =>
          this.fakeDataService.generateFakeData({
            ...params, dbSettings: {
              ...params.dbSettings,
              schema
            }
          }, this.sessionId, report)
        )
      )
      .subscribe(
        () => this.connection$.next(true),
        error => this.connection$.error(error)
      )
  }
}
