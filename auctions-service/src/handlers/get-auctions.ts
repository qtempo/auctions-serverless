import { APIGatewayProxyEventV2WithLambdaAuthorizer, APIGatewayProxyResult, Handler } from 'aws-lambda'
import { Auction, UserUseCases } from 'auctions-core'
import { Utils, LambdaError } from '../utils'
import { UserAuctionsService } from '../services/user-auctions.service'

const userAuctionsService = new UserAuctionsService(Utils.getAuctionsTableName())

export const handler: Handler<
  APIGatewayProxyEventV2WithLambdaAuthorizer<{ email: string }>,
  APIGatewayProxyResult
> = async event => {
  try {
    const { status } = (event.queryStringParameters ?? {}) as { status: Auction['status'] }
    const useCase = new UserUseCases.GetAuctionsByStatusUseCase(userAuctionsService)
    const result = await useCase.execute(status)

    if (result.isLeft()) {
      console.error('[error] get auctions', result.value)
      return Utils.response(400, result.value)
    }

    return Utils.response(200, result.value)
  } catch (error) {
    console.error(error)
    return Utils.response(500, LambdaError.internalServer('Unexpected error'))
  }
}
