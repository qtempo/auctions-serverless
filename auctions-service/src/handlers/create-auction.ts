import { UserUseCases } from 'auctions-core'
import { UserAuctionsService } from '../services/user-auctions.service'
import { middleware, Utils } from '../utils'

const userAuctionsService = new UserAuctionsService(Utils.getAuctionsTableName())

export const handler = middleware<{ title: string }, {}, {}>().handler(async event => {
  const seller = event?.requestContext?.authorizer?.lambda.email
  const { title } = event.body

  const useCase = new UserUseCases.CreateAuctionUseCase(userAuctionsService)
  const createResult = await useCase.execute({ title, seller })

  if (createResult.isLeft()) {
    console.error('[error] create auction', createResult.value)
    return Utils.response(400, createResult.value)
  }

  return Utils.response(201, createResult.value)
})