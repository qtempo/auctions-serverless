import { APIGatewayProxyEventV2WithLambdaAuthorizer, APIGatewayProxyResult, Handler } from 'aws-lambda'
import { UserUseCases } from 'auctions-core'
import { Utils, LambdaError } from '../utils'
import { UserAuctionsService } from '../services/user-auctions.service'

interface CreateAuctionEventBody {
  title: string;
}

const userAuctionsService = new UserAuctionsService(Utils.getAuctionsTableName())

export const handler: Handler<
  APIGatewayProxyEventV2WithLambdaAuthorizer<{ email: string }>,
  APIGatewayProxyResult
> = async event => {
  try {
    const { title } = Utils.parseEventBody<CreateAuctionEventBody>(event.body)
    const seller = event.requestContext.authorizer.lambda.email

    const useCase = new UserUseCases.CreateAuctionUseCase(userAuctionsService)
    const createResult = await useCase.execute({ title, seller })

    if (createResult.isLeft()) {
      console.error('[error] create auction', createResult.value)
      return Utils.response(400, createResult.value)
    }

    return Utils.response(201, createResult.value)
  } catch (error) {
    console.error(error)
    return Utils.response(500, LambdaError.internalServer('Unexpected error'))
  }
}
