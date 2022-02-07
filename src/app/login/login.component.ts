import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LoginService } from '../login/login.service';
import { retry, delay } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public loginCode = "";
  public authCode = "";
  public accessToken = "";
  public hasAccessToken = false;
  public isGettingToken = false;
  public hasUser = false;
  public userName = "";
  public userImageUrl = "";

  constructor(public facebookService : LoginService, private changeDetector: ChangeDetectorRef) { }

  async ngOnInit() {
    chrome.storage.sync.get(["userCode","authCode","accessToken"], (result) => this.initController(result));
  }

  initController(result:any){
    console.error(Date.now() + " Init DATA" + JSON.stringify(result));
    let accessToken = result['accessToken'];
    this.loginCode = result['userCode'];
    this.authCode = result['authCode'];
    this.changeDetector.detectChanges();
    if(accessToken){
      this.loadUserData();
      return;
    }

    if(this.loginCode){
      this.getAuthToken(this.authCode);
      return;
    }

    this.getLoginCode();
  }

  getLoginCode(): void {
    this.facebookService.requestLoginCode()
      .subscribe(result => 
        {
          chrome.storage.sync.set({ "userCode": result.user_code});
          chrome.storage.sync.set({ "authCode": result.code});
          this.loginCode = result.user_code;
          this.authCode = result.code;
          this.changeDetector.detectChanges();
          delay(5000);
          this.getAuthToken(result.code);
      });
  }

  getAuthToken(code: string): void{
    this.hasAccessToken = false;
    this.isGettingToken = true;
    this.hasUser = false;
    this.changeDetector.detectChanges();
    this.facebookService.requestAuthToken(code).pipe(
      retry(10), // you retry 3 times
      delay(5000) // each retry will start after 1 second,
   ).subscribe(
      result => 
      {
        if(result.error == null)
        {
          chrome.storage.sync.set({"accessToken" : result.access_token});
          this.accessToken = result.access_token;
          this.hasAccessToken = true;
          this.isGettingToken = false;
          this.hasUser = false;
          this.changeDetector.detectChanges();
        }
      });
  }

  loadUserData(): void{
    chrome.storage.sync.get("accessToken",(result)=>{
      this.facebookService.requestProfile(result['accessToken']).subscribe(
        result => 
        {
          this.hasAccessToken = false;
          this.isGettingToken = false;
          this.userName = result.name;
          this.userImageUrl = result.picture.data.url;
          this.hasUser = true;
          this.changeDetector.detectChanges();
        });;
    });
    
  }

  openFacebookPage(): void{
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.executeScript(
        tabs[0].id!,
        { code: `window.open("https://www.facebook.com/device");` }
      );
    });
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  logout():void{
    chrome.storage.sync.clear();
    this.initController({});
  }
}
