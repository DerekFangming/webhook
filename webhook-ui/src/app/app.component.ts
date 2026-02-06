import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { environment } from '../environments/environment'
import { NgxJsonViewerModule } from 'ngx-json-viewer'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NgxJsonViewerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  connected = true
  copied = false
  requests: any[] = []
  selectedRequest: any = null
  ws: WebSocket | undefined
  
  constructor(){}

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

      that.requests = reqs.concat(that.requests)
    }

    this.ws.onclose = function (data) {
      that.connected = false
      
      setTimeout(function() {
        if (!that.connected) that.ngOnInit()
      }, 5000)
    }

    this.ws.onerror = function (data) {
      that.ws?.close()
    }

  }

  clearRequests() {
    this.ws!.send('clearRequests')
    this.requests = []
  }

  viewRequest(req: any) {
    this.selectedRequest = req
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
