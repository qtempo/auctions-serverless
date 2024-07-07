import { DynamoDB } from 'aws-sdk'
import { Auction, AuctionID, AutomaticProcessAuctionsRepository } from 'auctions-core'

export class AutomaticProcessAuctionsService extends AutomaticProcessAuctionsRepository {
  constructor(
    private readonly auctionsTableName: string,
    private readonly dynamodbClient = new DynamoDB.DocumentClient(),
  ) {
    super()
  }

  protected async persistClose(id: AuctionID): Promise<void> {
    const request = this.dynamodbClient.update({
      TableName: this.auctionsTableName,
      Key: { id },
      UpdateExpression: 'set #status = :status',
      ExpressionAttributeValues: { ':status': 'CLOSED' },
      ExpressionAttributeNames: { '#status': 'status' },
    })
    await request.promise()
  }

  public async getExpiredAuctions(): Promise<Auction[]> {
    const request = this.dynamodbClient.query({
      TableName: this.auctionsTableName,
      IndexName: 'statusAndEndDate',
      KeyConditionExpression: '#status = :status AND endingAt <= :now',
      ExpressionAttributeValues: {
        ':status': 'OPEN',
        ':now': new Date().toISOString(),
      },
      ExpressionAttributeNames: {
        '#status': 'status',
      },
    })
    const { Items } = await request.promise()

    return (Items as Auction[]) ?? []
  }
}
