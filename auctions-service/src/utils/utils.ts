import { ok } from 'node:assert'
import { APIGatewayProxyResult } from 'aws-lambda'
import { LambdaError } from './lambda.error'

export class Utils {
  public static parseEventBody<T>(eventBody: string | null | undefined): T {
    return JSON.parse(eventBody ?? '{}')
  }

  public static response(statusCode: number, body: string | { [k: string]: any }): APIGatewayProxyResult {
    return {
      statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }
  }

  public static getAuctionsTableName(): string {
    const tableName = process.env.AUCTIONS_TABLE_NAME
    ok(tableName, new LambdaError(500, '"Auctions" can\'t be reached'))
    return tableName
  }

  public static getMailQueueUrl(): string {
    const mailQueueUrl = process.env.MAIL_QUEUE_URL
    ok(mailQueueUrl, new LambdaError(500, '"Mail Queue" can\'t be reached'))
    return mailQueueUrl
  }

  public static getAuctionsBucketName(): string {
    const bucketNAme = process.env.AUCTIONS_BUCKET_NAME
    ok(bucketNAme, new LambdaError(500, '"Bucket Name" can\'t be reached'))
    return bucketNAme
  }
}
