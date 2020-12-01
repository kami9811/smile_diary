import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { GlobalService } from '../global.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  latitude: Number = 0.0;
  longitude: Number = 0.0;

  // API用
  postObj: any = {};
  returnObj: any = {};
  articleObj: any = {};
  objWord: any;

  // 記事
  articleList: any[] = [];

  constructor(
    private geolocation: Geolocation,
    private alertController: AlertController,
    private router: Router,
    private nativeStorage: NativeStorage,
    public gs: GlobalService,
  ) {}

  // 自動ログイン管理, 記事取得
  ngOnInit(){
    console.log("Init!");
    this.nativeStorage.getItem('login').then(
      data => {
        console.log(data);
        this.postObj["id"] = data["id"];
        this.postObj["password"] = data["password"];
        this.postObj["prefecture"] = data["prefecture"];
        const body = this.postObj;

        this.gs.http('https://kn46itblog.com/hackathon/CCCu22/php_apis/login.php', body).subscribe(
          res => {
            this.returnObj = res;
            if(this.returnObj["status"] == 200){
              this.nativeStorage.setItem('login', {
                id: data["id"],
                attribute: data["attribute"],
                prefecture: data["prefecture"],
                password: data["password"],
                hash: this.returnObj["hash"]
              }).then(
                () => console.log('Auto login successed!'),
                (error) => console.error(error)
              );

              // 記事取得
              // 座標取得
              this.geolocation.getCurrentPosition().then((resp) => {
                this.latitude = resp.coords.latitude;
                this.longitude = resp.coords.longitude;

                this.postObj["hash"] = this.returnObj['hash'];
                this.postObj["latitude"] = this.latitude;
                this.postObj["longitude"] = this.longitude;
                const body = this.postObj;

                this.gs.http('https://kn46itblog.com/hackathon/CCCu22/php_apis/getDiaryArticle.php', body).subscribe(
                  res => {
                    /*
                    {
                    	"status": 200,
                    	"message": "日記記事一覧取得に成功しました.",
                    	"article_num": ARTICLE_NUM,
                    	"article_list": {
                    		"article1": {
                    			"title": "TITLE",
                    			"text": "TEXT",
                    			"article_id": ARTICLE_ID,
                    			"id": "ID",
                    			"distance": DISTANCE
                    		},
                    		"article2": {
                    			...
                    		},
                    		...
                    	}
                    }
                    */
                    console.log(res);
                    this.articleObj = res;
                    this.articleList = [];
                    for(let i: any = 0; i < this.articleObj['article_num']; i++){
                      let n = i + 1;
                      this.objWord = 'article' + n;
                      this.articleList.push(this.articleObj['article_list'][this.objWord]);
                    }
                    console.log(this.articleList);
                  },
                  error => console.error(error)
                );
              }).catch((error) => {
                console.log('Error getting location', error);
              });
            }
            else{
              this.router.navigate(['/login']);
            }
          },
          error => console.error(error)
        );
      },
      error => {
        console.error(error)
        this.router.navigate(['/login']);
      }
    );
  }

  async alertGps() {
    const alert = await this.alertController.create({
      header: '座標が観測されました',
      message: '緯度: ' + this.latitude + '<br>経度: ' + this.longitude,
      buttons: ['OK']
    })

    await alert.present();
  }

  onGps = () => {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;
      this.alertGps(); 
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  navigateToSelf = () => {
    this.router.navigate(['/self', 1, '1']);
  }
  navigateToEdit = () => {
    this.router.navigate(['/edit', 1]);
  }

}
/* Alert
  import { Component } from '@angular/core';
  import { AlertController } from '@ionic/angular';
    constructor(public alertController: AlertController) {}

    async presentAlert() {
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Alert',
        subHeader: 'Subtitle',
        message: 'This is an alert message.',
        buttons: ['OK']
      });

      await alert.present();
    }
*/
/* GPS
import { Geolocation } from '@ionic-native/geolocation/ngx';

...

constructor(private geolocation: Geolocation) {}

...

this.geolocation.getCurrentPosition().then((resp) => {
 // resp.coords.latitude
 // resp.coords.longitude
}).catch((error) => {
  console.log('Error getting location', error);
});

let watch = this.geolocation.watchPosition();
watch.subscribe((data) => {
 // data can be a set of coordinates, or an error (if an error occurred).
 // data.coords.latitude
 // data.coords.longitude
});
*/
