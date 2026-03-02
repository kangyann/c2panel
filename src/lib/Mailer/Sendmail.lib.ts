import { MailerConfig } from "../../config/Mailer.config";

export type SendMailToTypes = {
  fromMail?: string;
  typeofmessage: "html" | "text";
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

// Create class SendMail extending with MailerConfig
export class SendMail extends MailerConfig {
  private user: string;

  // Construct
  constructor() {
    super();
    this.user = process.env.SMTP_USER;
  }

  // Send To Mail
  async sendTo(props: SendMailToTypes) {
    const transporter = this.createTransport();

    // Config
    const type = props.typeofmessage == "html" ? { html: props.html } : { text: props.text };
    const from = props.fromMail ?? this.user;
    const { typeofmessage, fromMail, text, html, ...newprops } = props;

    // Send
    const send = await transporter.sendMail({
      from: `\"C2 Host\" ${from}`,
      ...type,
      ...newprops,
    });

    return send;
  }
}
