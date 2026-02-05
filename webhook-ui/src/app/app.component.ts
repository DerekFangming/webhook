import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { Router, RouterOutlet } from '@angular/router'
import { environment } from '../environments/environment'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  connected = true
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

}
