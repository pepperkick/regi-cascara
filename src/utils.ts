import * as config from "../config.json";
import * as moment from "moment";
import { DiscordClient, OnCommand } from "discord-nestjs";
import { DMChannel, GuildMember, Message, User } from "discord.js";
import { MessageException } from "./objects/message.exception";

export function OnUserCommand(name: string) {
  return OnCommand({
    name,
    allowChannels: [ config.channels.users ],
    isRemovePrefix: true,
    isIgnoreBotMessage: true,
    isRemoveCommandName: true
  });
}

export function MessageFilter() {
  return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;

    descriptor.value = async function (...args) {
      try {
        await original.apply(this, args);
      } catch (error) {
        for (const arg of args) {
          if (arg instanceof Message) {
            if (error instanceof MessageException) {
              await this.messageService.replyMessage(arg, error.type, error.message);
              return;
            }
          }
        }
        console.log(error);
      }
    }
  }
}

export function parseMessageArgs(message: Message) {
  let args = message.content.split(" ");
  args = args.filter(arg => arg !== "");
  return args;
}