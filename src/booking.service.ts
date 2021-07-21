import { Injectable, Logger } from '@nestjs/common';
import * as config from '../config.json';
import axios from 'axios';
import { Message, TextChannel } from 'discord.js';
import { Server } from './objects/server.interface';
import { MessageType } from './objects/message-types.enum';
import { MessageService } from './message.service';
import { ServerStatus } from './objects/server-status.enum';
import { DiscordClient } from 'discord-nestjs';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private readonly bot: DiscordClient
  ) {
  }

  async bookServer(message: Message) {
    const servers = await this.status()

    if (servers.length > 0) {
      const embed = this.generateConnectEmbed(servers[0])
      return await message.reply("A server is already running.", embed)
    }

    const server = await this.sendCreateRequest({
      game: config.game,
      region: config.region.slug,
      provider: config.region.provider,
      password: config.instance.password,
      callbackUrl: `${config.localhost}/booking/callback`,
      closePref: {
        minPlayers: config.timer.minPlayer,
        idleTime: config.timer.idleTime,
        waitTime: config.timer.waitTime
      },
      data: {
        git_repository: config.instance.git_repository,
        git_deploy_key: config.instance.git_deploy_key
      }
    });

    return await message.reply(MessageService.buildTextMessage(
      MessageType.INFO, "Server will be started.\nThis may take few mins.", "Server"))
  }

  async unbookServer(message: Message) {
    const servers = await this.status()

    if (servers.length == 0) {
      return await message.reply(MessageService.buildTextMessage(
        MessageType.WARNING, "No servers are currently running.", "Server"))
    }

    await this.sendDestroyRequest(servers[0]._id);
    return await message.reply(MessageService.buildTextMessage(
      MessageType.INFO, "Server will be closed.", "Server"))
  }

  async handleServerStatusChange(server: Server, status: ServerStatus) {
    this.logger.log(`Received server (${server._id}) status (${status}) update callback.`);

    if (status === ServerStatus.IDLE) {
      const channel = await this.bot.channels.fetch(config.channels.users) as TextChannel;
      const embed = this.generateConnectEmbed(server)
      await channel.send("Server is now in IDLE state\nIt will be automatically closed after inactivity, make sure the game has been saved.", embed)
    } else if (status === ServerStatus.CLOSED) {
      const channel = await this.bot.channels.fetch(config.channels.users) as TextChannel;
      await channel.send(MessageService.buildTextMessage(
        MessageType.SUCCESS, "Server has been closed.", "Server"))
    }
  }


  async sendCreateRequest(options): Promise<Server> {
    const res = await axios.post(`${config.lighthouse.host}/api/v1/servers`, options, {
      headers: {
        "Authorization": `Bearer ${config.lighthouse.clientSecret}`
      }
    });
    return res.data;
  }

  async sendDestroyRequest(id): Promise<Server> {
    const res = await axios.delete(`${config.lighthouse.host}/api/v1/servers/${id}`, {
      headers: {
        "Authorization": `Bearer ${config.lighthouse.clientSecret}`
      }
    });
    return res.data;
  }

  async status() {
    const res = await axios.get(`${config.lighthouse.host}/api/v1/servers/client`, {
      headers: {
        "Authorization": `Bearer ${config.lighthouse.clientSecret}`
      }
    });
    return res.data;
  }

  generateConnectEmbed(server: Server) {
    let connectString;

    switch (server.game) {
      case "minecraft":
        connectString = `${server.ip}:${server.port}`
        break
      default:
        connectString = `connect ${server.ip}:${server.port}; password ${server.password};`
        break
    }

    return MessageService.buildMessageEmbed(MessageType.SUCCESS)
      .setTitle("Server")
      .setDescription(`The server is running\n**Connect String**\`\`\`${connectString}\`\`\``)
      .addField("Region", `\`${server.region}\``, true)
  }
}