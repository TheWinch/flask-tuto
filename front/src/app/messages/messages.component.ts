import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'osc-messages',
  template: `
    <p *ngFor="let msg of messages">
      <ngb-alert [type]="msg.type" (close)="closeAlert(alert)">{{msg.text}}</ngb-alert>
    </p>
  `,
  styles: []
})
export class MessagesComponent implements OnInit {
  messages: IAlert[] = [];
  messageIndex: number = 0;

  constructor() { }

  ngOnInit() {
  }

  public info(message: string): void {
    this.messages.push({id: this.messageIndex++, text: message, type: 'info'});
    console.log('INFO: ' + message);
  }
  public warn(message: string): void {
    this.messages.push({id: this.messageIndex++, text: message, type: 'warning'});
    console.log('WARN: ' + message);
  }
  public error(message: string): void {
    this.messages.push({id: this.messageIndex++, text: message, type: 'danger'});
    console.log('ERROR: ' + message);
  }

  closeAlert(alert: any) {
    const index: number = this.messages.indexOf(alert);
    this.messages.splice(index, 1);
  }
}

export interface IAlert {
  id: number;
  type: string;
  text: string;
}
