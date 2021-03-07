import { Body, Controller, Logger, Post, Query } from '@nestjs/common';
import { Message } from 'discord.js';
import { MessageFilter, OnUserCommand } from './utils';
import { BookingService } from './booking.service';
import { Server } from './objects/server.interface';
import { ServerStatus } from './objects/server-status.enum';
import { DiscordClient, On } from 'discord-nestjs';
import { MessageService } from './message.service';

@Controller()
export class BookingController {
  private readonly logger = new Logger(BookingController.name);

  constructor(
    private readonly bookingService: BookingService,
    private readonly messageService: MessageService,
    private readonly bot: DiscordClient
  ) {
  }

  @Post("/booking/callback")
  async callback(@Body() body: Server, @Query("status") status: ServerStatus): Promise<void> {
    await this.bookingService.handleServerStatusChange(body, status);
  }

  @On({event: 'ready'})
  onReady(): void {
    this.logger.log(`Logged in as ${this.bot.user.tag}!`);
  }

  @OnUserCommand("start")
  @MessageFilter()
  async userBook(message: Message): Promise<void> {
    await this.bookingService.bookServer(message)
  }

  @OnUserCommand("stop")
  @MessageFilter()
  async userUnbook(message: Message): Promise<void> {
    await this.bookingService.unbookServer(message)
  }
}