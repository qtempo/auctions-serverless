import { Auction, UserUseCases } from 'auctions-core'
import { UserAuctionsService } from '../services/user-auctions.service'
import { middleware, Utils } from '../utils'

const userAuctionsService = new UserAuctionsService(Utils.getAuctionsTableName())

export const handler = middleware<{}, {}, { status: Auction['status'] }>().handler(async event => {
  const { status } = event.queryStringParameters
  const useCase = new UserUseCases.GetAuctionsByStatusUseCase(userAuctionsService)
  const result = await useCase.execute(status)

  if (result.isLeft()) {
    console.error('[error] get auctions', result.value)
    return Utils.response(400, result.value)
  }

  return Utils.response(200, result.value)
})
