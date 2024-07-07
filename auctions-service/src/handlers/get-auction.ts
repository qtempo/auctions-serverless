import { APIGatewayProxyEventV2WithLambdaAuthorizer, APIGatewayProxyResult, Handler } from 'aws-lambda'
import { AuctionID, UserUseCases } from 'auctions-core'
import { Utils, LambdaError } from '../utils'
import { UserAuctionsService } from '../services/user-auctions.service'

const userAuctionsService = new UserAuctionsService(Utils.getAuctionsTableName())

export const handler: Handler<
  APIGatewayProxyEventV2WithLambdaAuthorizer<{ email: string }>,
  APIGatewayProxyResult
> = async event => {
  try {
    const { id } = event.pathParameters as { id: AuctionID }
    const useCase = new UserUseCases.GetAuctionUseCase(userAuctionsService)
    const result = await useCase.execute(id)

    if (result.isLeft()) {
      console.error('[error] get auction', result.value)
      return Utils.response(400, result.value)
    }

    return Utils.response(200, result.value)
  } catch (error) {
    console.error(error)
    return Utils.response(500, LambdaError.internalServer('Unexpected error'))
  }
}
