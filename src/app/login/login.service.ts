import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface requestAuthTokenResult{
  token:string;
}

@Injectable({
  providedIn: 'root'
})

export class LoginService {
  facebookAppID = "#####";
  requestCodeUrl = "https://graph.facebook.com/v2.6/device/login";
  requestTokenUrl = "https://graph.facebook.com/v2.6/device/login_status";

  constructor(private http: HttpClient) 
  { 
  }

  requestLoginCode() : Observable<any>{
    let body = {'access_token': this.facebookAppID, 'scope':'public_profile,user_likes'};

    console.error(Date.now() + " SERVICE requestLoginCode");
    return this.http.post<any>(this.requestCodeUrl, body )
    .pipe(
      catchError((error: HttpErrorResponse): Observable<any> => {
        this.cleanStorageData();
        console.error(Date.now() + " error: Deu merda capitao requestLoginCode " + error.message + " - " + error.error ); 
        return of();
      })
    );
  }

  requestAuthToken(code : string) : Observable<any>{
    let options = { headers: new HttpHeaders({'Content-Type': 'application/json' }) };
    let body = {'access_token': this.facebookAppID, 'code': code};
    console.error(Date.now() + " SERVICE requestAuthToken code:" + code );
    return this.http.post<requestAuthTokenResult>(this.requestTokenUrl, body )
    .pipe(
      catchError((error: HttpErrorResponse): Observable<requestAuthTokenResult> => {
        this.cleanStorageData();
        console.error(Date.now() + " error: Deu merda capitao requestAuthToken " + error.message + " - " + error.error ); 
        return of();
      })
    );
  }

  requestProfile(accessToken:any) : Observable<any>{

    console.error(Date.now() + " SERVICE requestProfile token:" + accessToken );

    let options = { headers: new HttpHeaders({'Content-Type': 'application/json' }) };
    let body = {'access_token': accessToken, 'fields': 'name,picture'};

    return this.http.post<any>("https://graph.facebook.com/v2.3/me?", body, options )
    .pipe(
      catchError((error: HttpErrorResponse): Observable<any> => {
        console.error(Date.now() + " error: Deu merda capitao requestProfile " + error.message + " - " + error.error ); 
        return of();
      })
    );
  }

  cleanStorageData():void{
    chrome.storage.sync.clear();
  }

}
