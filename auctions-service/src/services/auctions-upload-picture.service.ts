import { S3 } from 'aws-sdk'
import { AuctionID, UploadAuctionPictureRepository } from 'auctions-core'
import { Utils } from '../utils'

export class UploadAuctionPictureService extends UploadAuctionPictureRepository {
  constructor(private readonly s3 = new S3()) {
    super()
  }

  protected async persistPicture(id: AuctionID, pictureBuffer: Buffer): Promise<string> {
    const request = this.s3.upload({
      ContentType: 'image/jpeg',
      ContentEncoding: 'base64',
      Bucket: Utils.getAuctionsBucketName(),
      Key: `${id}.jpg`,
      Body: pictureBuffer,
    })
    const { Location: pictureUrl } = await request.promise()

    return pictureUrl
  }
}
