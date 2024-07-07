import { SQS } from 'aws-sdk'
import { AuctionsNotification, DomainEvents } from 'auctions-core'

export class AuctionsNotificationRegister {
  constructor(
    private readonly mailQueueUrl: string,
    private readonly sqsClient = new SQS(),
  ) { }

  public async register(): Promise<void> {
    DomainEvents.register(AuctionsNotification.name, async properties => {
      const request = this.sqsClient.sendMessage({
        QueueUrl: this.mailQueueUrl,
        MessageBody: JSON.stringify(properties),
      })
      await request.promise()
    })
  }
}
