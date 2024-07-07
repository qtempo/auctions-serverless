import { APIGatewayProxyEventV2WithLambdaAuthorizer, APIGatewayProxyResult, Handler } from 'aws-lambda'
import { AuctionID, UserUseCases } from 'auctions-core'
import { Utils, LambdaError } from '../utils'
import { UserAuctionsService } from '../services/user-auctions.service'
import { UploadAuctionPictureService } from '../services/auctions-upload-picture.service'

const userAuctionsService = new UserAuctionsService(Utils.getAuctionsTableName())
const uploadAuctionPictureService = new UploadAuctionPictureService()

export const handler: Handler<
  APIGatewayProxyEventV2WithLambdaAuthorizer<{ email: string }>,
  APIGatewayProxyResult
> = async event => {
  try {
    const { id } = event.pathParameters as { id: AuctionID }
    const seller = event.requestContext.authorizer.lambda.email
    const pictureBase64 = event.body ?? ''

    const useCase = new UserUseCases.UploadAuctionPictureUseCase(userAuctionsService, uploadAuctionPictureService)
    const createResult = await useCase.execute({ id, seller, pictureBase64 })

    if (createResult.isLeft()) {
      console.error('[error] upload picture', createResult.value)
      return Utils.response(400, createResult.value)
    }

    return Utils.response(201, createResult.value)
  } catch (error) {
    console.error(error)
    return Utils.response(500, LambdaError.internalServer('Unexpected error'))
  }
}
