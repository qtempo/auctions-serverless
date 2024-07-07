import { APIGatewayProxyEventV2WithLambdaAuthorizer, APIGatewayProxyResult, Handler } from 'aws-lambda'
import { AuctionID, UserUseCases } from 'auctions-core'
import { Utils, LambdaError } from '../utils'
import { UserAuctionsService } from '../services/user-auctions.service'

interface PlaceBidEventBody {
  amount: number
}

const userAuctionsService = new UserAuctionsService(Utils.getAuctionsTableName())

export const handler: Handler<
  APIGatewayProxyEventV2WithLambdaAuthorizer<{ email: string }>,
  APIGatewayProxyResult
> = async event => {
  try {
    const { id } = event.pathParameters as { id: AuctionID }
    const { amount } = Utils.parseEventBody<PlaceBidEventBody>(event.body)
    const bidder = event.requestContext.authorizer.lambda.email

    const useCase = new UserUseCases.PlaceBidUseCase(userAuctionsService)
    const result = await useCase.execute({ id, amount, bidder })

    if (result.isLeft()) {
      console.error('[error] place bid', result.value)
      return Utils.response(400, result.value)
    }

    return Utils.response(201, result.value)
  } catch (error) {
    console.error(error)
    return Utils.response(500, LambdaError.internalServer('Unexpected error'))
  }
}
