import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export interface MailerConfigInterface {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export type TemplateNameTypes = "notify.html";

export class MailerConfig {
  private config: MailerConfigInterface;

  // Construct set Config
  constructor() {
    this.config = {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT as string),
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };
  }

  // Get Template Body from HTML
  getTemplateHtml(templateName: TemplateNameTypes) {
    const filepath = path.join(process.cwd(), "src", "lib", "mailer", "template", templateName);
    return fs.readFileSync(filepath, "utf-8");
  }

  // Create new Transport
  createTransport() {
    return nodemailer.createTransport({
      ...this.config,
    });
  }
}
