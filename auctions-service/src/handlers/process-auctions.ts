import { AutomaticUseCases } from 'auctions-core'
import { AutomaticProcessAuctionsService } from '../services/automatic-process-auctions.service'
import { AuctionsNotificationRegister } from '../services/auctions-notification-register.service'
import { middleware, Utils } from '../utils'

const processAuctionsService = new AutomaticProcessAuctionsService(Utils.getAuctionsTableName())
new AuctionsNotificationRegister(Utils.getMailQueueUrl()).register()

export const handler = middleware<{}, {}, {}>().handler(async _ => {
  const useCase = new AutomaticUseCases.ProcessAuctionsUseCase(processAuctionsService)
  const createResult = await useCase.execute()

  if (createResult.isLeft()) {
    console.error('[error] process auctions', createResult.value)
    return Utils.response(400, createResult.value)
  }

  return Utils.response(200, { auctionAmount: createResult.value })
})
