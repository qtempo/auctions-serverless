import { AuctionID, UserUseCases } from 'auctions-core'
import { UserAuctionsService } from '../services/user-auctions.service'
import { UploadAuctionPictureService } from '../services/auctions-upload-picture.service'
import { middleware, Utils } from '../utils'

const userAuctionsService = new UserAuctionsService(Utils.getAuctionsTableName())
const uploadAuctionPictureService = new UploadAuctionPictureService()

export const handler = middleware<{ pictureBase64: string }, {}, {}>().handler(async event => {
  const seller = event?.requestContext?.authorizer?.lambda.email
  const { id } = event.pathParameters as { id: AuctionID }
  const { pictureBase64 } = event.body

  const useCase = new UserUseCases.UploadAuctionPictureUseCase(userAuctionsService, uploadAuctionPictureService)
  const createResult = await useCase.execute({ id, seller, pictureBase64 })

  if (createResult.isLeft()) {
    console.error('[error] upload picture', createResult.value)
    return Utils.response(400, createResult.value)
  }

  return Utils.response(201, createResult.value)
})
