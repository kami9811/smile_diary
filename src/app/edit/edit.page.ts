import { Component, OnInit } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';
import { GlobalService } from '../global.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AlertController } from '@ionic/angular';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit {
  imageFlag: Boolean = false;
  image: string;

  title: string = '';
  text: string = '';

  article_id: Number = 0;
  latitude: Number;
  longitude: Number;

  postObj: any = {};
  returnObj: any = {};

  tab: Number;
  tabFlag: Boolean = false;

  constructor(
    private camera: Camera,
    private gs: GlobalService,
    private geolocation: Geolocation,
    private alertController: AlertController,
    private router: Router,
    private route: ActivatedRoute,
    private nativeStorage: NativeStorage,
  ) { }

  ngOnInit() {
    this.route.params.subscribe(
      params => {
        this.tab = params['tab'];
        if(this.tab == 1){
          this.tabFlag = true;
        }
      },
      error => console.error(error)
    );
  }

  takePicture = () => {
    const options: CameraOptions = {
      quality: 10,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      allowEdit: true,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };

    this.camera.getPicture(options).then(
      (imageData) => {
        this.image = 'data:image/jpeg;base64,' + imageData;
        this.imageFlag = true;
      },
      (err) => {
        // Handle error
        console.log("Camera issue:" + err);
      }
    );
  }

  postArticle = () => {
    this.geolocation.getCurrentPosition().then(
      (resp) => {
        this.latitude = resp.coords.latitude;
        this.longitude = resp.coords.longitude;
        this.nativeStorage.getItem('login').then(
          data => {
            this.postObj['id'] = data['id'];
            this.postObj['article_id'] = this.article_id;
            this.postObj['prefecture'] = data['prefecture'];
            this.postObj['latitude'] = this.latitude;
            this.postObj['longitude'] = this.longitude;
            this.postObj['title'] = this.title;
            this.postObj['text'] = this.text;
            this.postObj['image'] = this.image;
            this.postObj['hash'] = data['hash'];

            const body = this.postObj;
            if(this.tab == 1){
              this.gs.http('https://kn46itblog.com/hackathon/CCCu22/php_apis/registerDiaryArticle.php', body).subscribe(
                res => {
                  console.log(res);
                  this.navigate();
                  this.alertPost();
                },
                error => console.error(error)
              );
            }
            else if (this.tab == 2){
              this.gs.http('https://kn46itblog.com/hackathon/CCCu22/php_apis/registerTipsArticle.php', body).subscribe(
                res => {
                  console.log(res);
                  this.navigate();
                  this.alertPost();
                },
                error => console.error(error)
              );
            }
          },
        );
      },
      error => console.error(error)
    );
  }

  async alertPost() {
    const alert = await this.alertController.create({
      message: '日誌が投稿されました',
      buttons: ['OK']
    })

    await alert.present();
  }

  navigate = () => {
    let tabPos = 'tab' + this.tab;
    this.router.navigate(['/tabs', tabPos, 'edited']);
  }

}
