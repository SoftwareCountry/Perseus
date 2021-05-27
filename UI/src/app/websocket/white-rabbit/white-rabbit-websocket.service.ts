import { OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { WebsocketService } from '../websocket.service';
import { IFrame, Stomp } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { isProd, whiteRabbitWsUrl } from '../../app.constants';
import { Client } from '@stomp/stompjs/esm6/client';
import { fromPromise } from 'rxjs/internal-compatibility';
import { AuthService } from '../../services/auth/auth.service';

export abstract class WhiteRabbitWebsocketService extends WebsocketService implements OnDestroy {

  protected abstract endPoint: string

  private socket: SockJS;

  private stompClient: Client;

  private customSessionId: string

  protected constructor(private authService: AuthService) {
    super()
    this.customSessionId = this.authService.user.token.substr(0, 10)
  }

  get sessionId(): string {
    return this.customSessionId
  }

  ngOnDestroy(): void {
    if (this.stompClient?.active) {
      this.disconnect();
    }
  }

  connect(): Observable<boolean> {
    this.initStompClient();
    this.stompClient.activate();

    this.stompClient.onConnect = (frame: IFrame) => {
      this.connection$.next(frame.command === 'CONNECTED');
    };

    this.stompClient.onWebSocketClose = event => {
      if (event.code !== 1000) { // 1000 = Normal close
        fromPromise(this.stompClient.deactivate())
          .subscribe(() => this.connection$.error(event));
      }
    };

    return this.status$;
  }

  disconnect() {
    fromPromise(this.stompClient.deactivate())
      .subscribe(() => {
        this.connection$.next(false);
        this.connection$.complete();
      });
  }

  on(): Observable<string> {
    return new Observable(subscriber => {
      this.stompClient.subscribe('/user/queue/reply', message => {
        subscriber.next(message.body);
      });
    });
  }

  private initStompClient(): void {
    this.stompClient = Stomp.over(() => {
      this.socket = new SockJS(`${whiteRabbitWsUrl}/${this.endPoint}`, [], {
        sessionId: () => this.sessionId
      });
      return this.socket;
    });

    this.stompClient.splitLargeFrames = true; // Need to send large messages
    // todo reconnect
    // this.stompClient.reconnectDelay = 1000;
    if (isProd) { // Disable logging
      this.stompClient.debug = msg => {};
    }
  }
}
