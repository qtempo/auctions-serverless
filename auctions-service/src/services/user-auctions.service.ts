import { DynamoDB } from 'aws-sdk'
import { UserAuctionsRepository, Auction, AuctionID, UserUseCases } from 'auctions-core'

export class UserAuctionsService extends UserAuctionsRepository {
  constructor(
    private readonly auctionsTableName: string,
    private readonly dynamodbClient = new DynamoDB.DocumentClient(),
  ) {
    super()
  }

  protected async persist(auction: Auction): Promise<void> {
    const request = await this.dynamodbClient.put({
      TableName: this.auctionsTableName,
      Item: auction,
    })
    await request.promise()
  }

  protected async queryById(id: AuctionID): Promise<Auction> {
    const request = this.dynamodbClient.get({
      TableName: this.auctionsTableName,
      Key: { id },
    })
    const { Item } = await request.promise()

    return Item as Auction
  }

  protected async queryByStatus(status: Auction['status']): Promise<Auction[]> {
    const request = this.dynamodbClient.query({
      TableName: this.auctionsTableName,
      IndexName: 'statusAndEndDate',
      KeyConditionExpression: '#status = :status',
      ExpressionAttributeValues: { ':status': status ?? 'OPEN' },
      ExpressionAttributeNames: { '#status': 'status' },
    })
    const { Items } = await request.promise()

    return (Items as Auction[]) ?? []
  }

  protected async persistBid({ id, amount, bidder }: UserUseCases.AuctionPlaceBidRequest): Promise<Auction> {
    const request = this.dynamodbClient.update({
      TableName: this.auctionsTableName,
      Key: { id },
      UpdateExpression: 'set highestBid.amount = :amount, highestBid.bidder = :bidder',
      ExpressionAttributeValues: {
        ':amount': amount,
        ':bidder': bidder,
      },
      ReturnValues: 'ALL_NEW',
    })
    const { Attributes } = await request.promise()

    return Attributes as Auction
  }

  protected async persistAuctionPictureUrl(id: AuctionID, pictureUrl: string): Promise<Auction> {
    const request = this.dynamodbClient.update({
      TableName: this.auctionsTableName,
      Key: { id },
      ReturnValues: 'ALL_NEW',
      UpdateExpression: 'set pictureUrl = :pictureUrl',
      ExpressionAttributeValues: {
        ':pictureUrl': pictureUrl,
      },
    })
    const { Attributes } = await request.promise()

    return Attributes as Auction
  }
}
