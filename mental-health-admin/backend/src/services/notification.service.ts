export class NotificationService {
  async sendEmail(to: string, subject: string, _body: string): Promise<void> {
    console.log(`Sending email to ${to}: ${subject}`);
  }

  async sendSMS(phoneNumber: string, message: string): Promise<void> {
    console.log(`Sending SMS to ${phoneNumber}: ${message}`);
  }
}
