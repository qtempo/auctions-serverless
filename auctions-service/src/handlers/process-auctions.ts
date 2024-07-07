import { APIGatewayProxyEventV2WithLambdaAuthorizer, APIGatewayProxyResult, Handler } from 'aws-lambda'
import { AutomaticUseCases } from 'auctions-core'
import { Utils, LambdaError } from '../utils'
import { AutomaticProcessAuctionsService } from '../services/automatic-process-auctions.service'
import { AuctionsNotificationRegister } from '../services/auctions-notification-register.service'

const processAuctionsService = new AutomaticProcessAuctionsService(Utils.getAuctionsTableName())
new AuctionsNotificationRegister(Utils.getMailQueueUrl()).register()

export const handler: Handler<
  APIGatewayProxyEventV2WithLambdaAuthorizer<{ email: string }>,
  APIGatewayProxyResult
> = async () => {
  try {
    const useCase = new AutomaticUseCases.ProcessAuctionsUseCase(processAuctionsService)
    const createResult = await useCase.execute()

    if (createResult.isLeft()) {
      console.error('[error] process auctions', createResult.value)
      return Utils.response(400, createResult.value)
    }

    return Utils.response(200, { auctionAmount: createResult.value })
  } catch (error) {
    console.error(error)
    return Utils.response(500, LambdaError.internalServer('Unexpected error'))
  }
}
