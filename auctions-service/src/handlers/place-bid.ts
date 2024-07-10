import { AuctionID, UserUseCases } from 'auctions-core'
import { UserAuctionsService } from '../services/user-auctions.service'
import { middleware, Utils } from '../utils'

const userAuctionsService = new UserAuctionsService(Utils.getAuctionsTableName())

export const handler = middleware<{ amount: number }, { id: AuctionID }, {}>().handler(async event => {
  const bidder = event?.requestContext?.authorizer?.lambda.email
  const { id } = event.pathParameters
  const { amount } = event.body

  const useCase = new UserUseCases.PlaceBidUseCase(userAuctionsService)
  const result = await useCase.execute({ id, amount, bidder })

  if (result.isLeft()) {
    console.error('[error] place bid', result.value)
    return Utils.response(400, result.value)
  }

  return Utils.response(201, result.value)
})
