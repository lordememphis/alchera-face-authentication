import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AppService } from './app.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  template: `
    <main>
      <section *ngIf="processing" class="progress">
        <mat-progress-bar
          style="margin: 0 10px"
          color="primary"
          mode="indeterminate"
          value="50"
        >
        </mat-progress-bar>
      </section>
      <section class="content">
        <div>
          <input
            #imagePicker
            type="file"
            accept="image/*"
            hidden
            (change)="preview()"
          />
          <button mat-raised-button (click)="imagePicker.click()">
            Pick image
          </button>
          <button mat-raised-button color="primary" (click)="run('REGISTER')">
            Register face
          </button>
          <button mat-raised-button color="primary" (click)="run('UPDATE')">
            Update face
          </button>
          <button mat-raised-button color="accent" (click)="run('COMPARE')">
            Compare face
          </button>
          <button mat-raised-button color="accent" (click)="run('RECOGNISE')">
            Recognise face
          </button>
          <button mat-raised-button color="warn" (click)="run('DELETE')">
            Delete profile
          </button>
        </div>
        <div *ngIf="previewing">
          <mat-card>
            <img [src]="src" [alt]="alt" />
          </mat-card>
        </div>
      </section>
    </main>
  `,
  styles: [
    `
      .progress {
        position: absolute;
        width: 100vw;
        display: flex;
        align-content: center;
        align-items: center;
        height: 60px;
      }

      .content {
        padding: 5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      button {
        margin: 0 1rem;
      }

      div {
        margin: 1rem 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      img {
        width: 20rem;
        height: 20rem;
        object-fit: cover;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  @ViewChild('imagePicker') imagePicker!: ElementRef;
  title = 'alchera-face-authentication';
  src!: string | ArrayBuffer | null;
  alt = '';
  previewing = false;
  processing = false;

  constructor(private service: AppService, public snackBar: MatSnackBar) {}

  ngOnInit(): void {}

  preview(): void {
    this.previewing = true;
    for (const img of this.imagePicker.nativeElement.files) {
      const reader = new FileReader();
      const alt = img.name;
      reader.onload = () => {
        this.src = reader.result;
        this.alt = alt;
      };
      reader.readAsDataURL(img);
    }
  }

  run(type: string): void {
    this.processing = true;
    const data = new FormData();
    const face = this.imagePicker.nativeElement.files[0];
    data.append('image', face);

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
