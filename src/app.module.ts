import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { MessageService } from './message.service';
import { DiscordModule } from 'discord-nestjs';
import * as config from "../config.json";

@Module({
  imports: [
    DiscordModule.forRoot({
      token: config.token,
      commandPrefix: config.prefix
    }),
  ],
  controllers: [ BookingController ],
  providers: [ BookingService, MessageService ],
})
export class AppModule {
}
