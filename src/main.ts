import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { register as registerSwiper } from 'swiper/element/bundle';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { Amplify } from 'aws-amplify';
import { ConfigService } from './app/service/config.service';

registerLocaleData(localeEs, 'es');
registerSwiper();

const configService = new ConfigService();
configService.load().then(() => {
  const config = configService.appConfig;

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: config.cognito.userPoolId,
        userPoolClientId: config.cognito.userPoolClientId,
      },
    },
  });

  bootstrapApplication(AppComponent, {
    ...appConfig,
    providers: [
      ...appConfig.providers,
      { provide: ConfigService, useValue: configService },
    ],
  }).catch((err) => console.error(err));
});
