import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../global.service';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
  id: string = '';
  password: string = '';

  status: Number = 0;
  // status: Number = 200;  // デバッグ用

  postObj: any = {};
  returnObj: any = {};

  constructor(
    private router: Router,
    public gs: GlobalService,
    private nativeStorage: NativeStorage,
  ) { }

  ngOnInit() {
    this.status = 0;
  }
  ngOnDestroy() {
    if(this.status != 200){
      this.router.navigate(['/login']);
    }
  }

  navigate = () => {
    this.postObj['id'] = this.id;
    this.postObj['password'] = this.password;

    const body = this.postObj;

    this.gs.http('https://kn46itblog.com/hackathon/CCCu22/php_apis/login.php', body).subscribe(
      res => {
        console.log(res);
        this.returnObj = res;
        this.status = this.returnObj["status"];
        // console.log(this.returnObj["status"]);
        if(this.status == 200){
          this.nativeStorage.setItem('login', {
            id: this.id,
            attribute: this.returnObj["attribute"],
            prefecture: this.returnObj["prefecture"],
            password: this.password,
            hash: this.returnObj["hash"]
          }).then(
            () => {
              console.log('Stored item!');
              this.router.navigate(['/tabs', 'tab3', 'login']);
              this.router.navigate(['/tabs', 'tab2', 'login']);
              this.router.navigate(['/tabs', 'tab1', 'login']);
            },
            error => console.log('Error storing', error)
          )
        }
      },
      error => {
        console.log("error: " + error);
      }
    );
    // this.router.navigate(['/tabs']);
  }
  navigateToSignup = () => {
    this.router.navigate(['/signup']);
  }

  login = () => {

  }

}
