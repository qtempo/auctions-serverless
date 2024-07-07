import { SES } from 'aws-sdk'
import { AuctionsNotification, NotificationUseCases, right, left } from 'auctions-core'

const ses = new SES({ region: 'eu-west-1' })
const sourceEmail = 'yaroslavprt+auctions@gmail.com'

export const sesService: NotificationUseCases.SendNotificationPort = {
  send: async (notification: AuctionsNotification) => {
    try {
      const { recipient, subject, body } = notification.get()
      await ses.sendEmail({
        Source: sourceEmail,
        Destination: {
          ToAddresses: [recipient],
        },
        Message: {
          Body: {
            Text: {
              Data: body,
            },
          },
          Subject: {
            Data: subject,
          },
        },
      }).promise()

      return right(void 0)
    } catch (error) {
      return left(error as Error)
    }
  },
}
