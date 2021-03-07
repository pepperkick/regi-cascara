import {MessageType} from "./objects/message-types.enum";
import { GuildMember, Message, MessageEmbed, TextChannel, User } from "discord.js";
import * as config from "../config.json";
import {Injectable} from "@nestjs/common";

@Injectable()
export class MessageService {
    /**
     * Reply to a message
     *
     * @param message
     * @param type
     * @param text
     */
    async replyMessage(message: Message, type: MessageType, text: string): Promise<Message> {
        return this.sendMessage(message, message.author, type, text);
    }

    /**
     * Edit a message
     *
     * @param message
     * @param type
     * @param text
     */
    async editMessage(message: Message, type: MessageType, text: string): Promise<Message> {
        return message.edit(message.content, MessageService.buildTextMessage(type, text));
    }

    /**
     * Send a message
     *
     * @param target
     * @param user
     * @param type
     * @param text
     */
    async sendMessage(target: Message | TextChannel, user: User | GuildMember, type: MessageType, text: string): Promise<Message> {
        if (target instanceof Message)
            return target.reply("", MessageService.buildTextMessage(type, text));
        else if (target instanceof TextChannel)
            return target.send(user, MessageService.buildTextMessage(type, text));
    }

    /**
     * Build a embed message with pre filled info for the bot
     *
     * @param type
     */
    static buildMessageEmbed(type: MessageType): MessageEmbed {
        return new MessageEmbed()
            .setAuthor(config.bot.name, config.bot.avatar)
            .setFooter(config.bot.footer.text, config.bot.footer.icon)
            .setImage(config.bot.image)
            .setTimestamp(new Date())
            .setColor(
                type === MessageType.SUCCESS  ? "#06D6A0" :
                type === MessageType.INFO     ? "#03A9F4" :
                type === MessageType.WARNING  ? "#FF9800" :
                type === MessageType.ERROR    ? "#f44336" : "#212121"
            );
    }

    /**
     * Build a text message
     *
     * @param type Message Type
     * @param text Message text
     * @param title Message title
     */
    static buildTextMessage(type: MessageType, text: string, title = "Booking") {
        return MessageService.buildMessageEmbed(type)
            .setTitle(title)
            .setDescription(text)
    }
}