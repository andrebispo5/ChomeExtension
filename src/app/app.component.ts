import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-chrome-extension';
  color = '#00ff00';
  public colorize(color: string) {
    console.log(color); 
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.executeScript(
        tabs[0].id!,
        { code: `document.body.style.backgroundColor = '${ color }';` }
      );
    });
  }
}
