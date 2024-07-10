import { AuctionID, UserUseCases } from 'auctions-core'
import { UserAuctionsService } from '../services/user-auctions.service'
import { middleware, Utils } from '../utils'

const userAuctionsService = new UserAuctionsService(Utils.getAuctionsTableName())

export const handler = middleware<{}, { id: AuctionID }, {}>().handler(async event => {
  const { id } = event.pathParameters
  const useCase = new UserUseCases.GetAuctionUseCase(userAuctionsService)
  const result = await useCase.execute(id)

  if (result.isLeft()) {
    console.error('[error] get auction', result.value)
    return Utils.response(400, result.value)
  }

  return Utils.response(200, result.value)
})
