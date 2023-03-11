import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

export class AttachmentUtils {
  constructor(
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET
  ) {}

  getUploadUrl(todoId: string, userId: string) {
    return s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: `${todoId}-${userId}`,
      Expires: this.urlExpiration
    })
  }

  getAttachmentUrl(todoId: string, userId: string) {
    return `https://${this.bucketName}.s3.amazonaws.com/${todoId}-${userId}`
  }
}
