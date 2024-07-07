import { SQSHandler } from 'aws-lambda'
import { AuctionsNotification, NotificationUseCases } from 'auctions-core'
import { sesService } from '../services/ses.service'

interface EventBody {
  recipient: string
  subject: string
  body: string
}

export const handler: SQSHandler = async event => {
  try {
    const { recipient, subject, body } = JSON.parse(event.Records[0].body) as EventBody
    const auctionNotification = new AuctionsNotification(recipient, subject, body)
    const useCase = new NotificationUseCases.SendNotificationUseCase(sesService)
    const result = await useCase.execute(auctionNotification)
    if (result.isLeft())
      console.error(result.value)
  } catch (error) {
    console.log(error)
  }
}
