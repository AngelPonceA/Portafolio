import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { environment } from 'src/environments/environment';
import { LOCALE_ID } from '@angular/core';
import localeEsCl from '@angular/common/locales/es-CL';
import { registerLocaleData } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { HttpClientModule } from '@angular/common/http';
import { BotonSoporteComponent } from './components/boton-soporte/boton-soporte.component';

register();
registerLocaleData(localeEsCl);
@NgModule({
  declarations: [AppComponent, BotonSoporteComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, CommonModule, HttpClientModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, NativeStorage, 
    provideFirebaseApp(() => initializeApp(environment.firebase)), 
    provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideDatabase(() => getDatabase()), 
    provideFunctions(() => getFunctions()), provideMessaging(() => getMessaging()), provideStorage(() => getStorage()),
    { provide: LOCALE_ID, useValue: 'es-CL' },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
