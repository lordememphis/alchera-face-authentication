import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AppService } from './app.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('imagePicker') imagePicker!: ElementRef;
  title = 'alchera-face-authentication';
  src!: string | ArrayBuffer | null;
  alt!: string | null;
  previewing = false;
  processing = false;
  streaming = false;

  video!: HTMLVideoElement;
  canvas!: HTMLCanvasElement;
  stream!: MediaStream | null;
  img!: File;

  constructor(
    private service: AppService,
    public snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) {}

  @ViewChild('video') set v(el: ElementRef) {
    this.video = el.nativeElement;
  }

  @ViewChild('canvas') set c(el: ElementRef) {
    this.canvas = el.nativeElement;
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  preview(): void {
    this.previewing = true;
    this.stream = null;
    this.streaming = false;
    this.readImage(this.imagePicker.nativeElement.files[0]);
  }

  webcam(): void {
    this.previewing = false;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(
        (stream: MediaStream) => {
          this.stream = stream;
          this.streaming = true;
        },
        (e) => console.error(e)
      );
      this.video
        .play()
        .then(() => {
          this.canvas
            .getContext('2d')
            ?.drawImage(this.video, 0, 0, 64 * 4, 48 * 4);

          this.canvas.toBlob((blob) => {
            this.img = new File(
              [blob as Blob],
              `IMG_${this.datePipe.transform(
                new Date(),
                'yyyyMMdd'
              )}_${Math.floor(Math.random() * 1000000)}.png`,
              { type: (blob as Blob).type }
            );
            this.readImage(this.img);
          });
        })
        .then(() => {
          setTimeout(() => {
            this.previewing = true;
            this.stream = null;
            this.streaming = false;
          }, 3000);
        });
    }
  }

  run(type: string): void {
    this.processing = true;
    const data = new FormData();

    if (this.img === undefined) {
      this.img = this.imagePicker.nativeElement.files[0];
    }
    data.append('image', this.img);

    switch (type) {
      case 'REGISTER':
        this.service.registerFace(data).subscribe(
          () => this.openSnackBar('Face registered successfully', 'Done'),
          () => this.openSnackBar('Face registration failed', 'Retry')
        );
        break;
      case 'UPDATE':
        this.service.updateFace(data).subscribe(
          () => this.openSnackBar('Face updated successfully', 'Done'),
          () => this.openSnackBar('Face update failed', 'Retry')
        );
        break;
      case 'COMPARE':
        this.service.compareFace(data).subscribe(
          (res) => {
            if (res.match) {
              this.openSnackBar('Comparison successful', 'Done');
            } else {
              this.openSnackBar('Comparison failed', 'Retry');
            }
          },
          () => this.openSnackBar('Comparison failed', 'Retry')
        );
        break;
      case 'RECOGNISE':
        this.service.recogniseFace(data).subscribe(
          (res) => {
            if (res.match) {
              this.openSnackBar('Face match successful', 'Done');
            } else {
              this.openSnackBar('Face match failed', 'Retry');
            }
          },
          () => this.openSnackBar('Face match failed', 'Retry')
        );
        break;
      case 'DELETE':
        this.service.deleteFace().subscribe(
          () => this.openSnackBar('Profile deleted successfully', 'Done'),
          () => this.openSnackBar('Profile delete failed', 'Retry')
        );
        break;
    }
  }

  private readImage(img: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.src = reader.result;
      this.alt = img.name;
    };
    reader.readAsDataURL(img);
  }

  private openSnackBar(message: string, action: string): void {
    this.processing = false;
    this.snackBar.open(message, action, {
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
