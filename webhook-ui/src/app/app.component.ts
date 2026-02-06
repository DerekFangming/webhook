import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Component, OnInit } from '@angular/core'
import { environment } from '../environments/environment'
import { NgxJsonViewerModule } from 'ngx-json-viewer'
import {Title} from "@angular/platform-browser"

declare var $: any

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxJsonViewerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  connected = true
  copied = false
  requests: any[] = []
  response: any = {
    status: 200,
    body: '{}'
  }
  selectedRequest: any = null
  ws: WebSocket | undefined
  
  constructor(private title:Title){}

  ngOnInit() {

    let wsHost = environment.socketAddress
    console.log('Connecting to ' + wsHost)

    this.ws = new WebSocket(wsHost)
    let that = this

    this.ws.onopen = function (event) {
      console.log('Connected to ' + wsHost)
      that.connected = true
    }

    this.ws.onmessage = function (data) {
      console.log('received: %s', data.data)

      let reqs = JSON.parse(data.data)

      if (reqs.data) {
        that.requests = reqs.data.concat(that.requests)
        if (that.requests.length == 0) {
          that.title.setTitle('Webhook')
        } else {
          that.title.setTitle(`(${that.requests.length}) Webhook`)
        }
      }

      if (reqs.response) {
        that.response = reqs.response
      }

    }

    this.ws.onclose = function (data) {
      that.connected = false
      that.requests = []
      
      setTimeout(function() {
        if (!that.connected) that.ngOnInit()
      }, 5000)
    }

    this.ws.onerror = function (data) {
      that.ws?.close()
    }

  }

  clearRequests() {
    this.ws!.send(JSON.stringify({op: 'clearRequests'}))
    this.requests = []
    this.title.setTitle('Webhook')
  }

  viewRequest(req: any) {
    this.selectedRequest = req
  }

  openResponseModal() {
    $("#responseModal").modal('show')
  }

  saveResponse() {
    this.ws!.send(JSON.stringify({op: 'saveResponse', response: this.response}))
  }

  copyText(text: string){
    navigator.clipboard.writeText(text).then(()=> {
      this.copied = true
    }).catch(err => {
      alert('Unable to copy text: ' + err)
    })
  }

  dateToLocal(date: string) {
    return (new Date(date)).toLocaleString()
  }

}
