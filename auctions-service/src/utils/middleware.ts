
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { Utils } from './utils'

/**
 * ===== MIDDLEWARE TYPES =====
 */

interface EventBody<B> {
  body: B
}

interface EventPathParameters<P> {
  pathParameters: P
}

interface EventQueryStringParameters<Q> {
  queryStringParameters: Q
}

type APIGatewayProxyEventParsed<B, P, Q> =
  Omit<APIGatewayProxyEvent, 'body' | 'pathParameters' | 'queryStringParameters'>
  & EventBody<B> & EventPathParameters<P> & EventQueryStringParameters<Q>

interface AuctionsLambdaHandler<B, P, Q> {
  (event: APIGatewayProxyEventParsed<B, P, Q>, context: Context): Promise<APIGatewayProxyResult>
}

interface AuctionsMiddleware<B, P, Q> {
  (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>
  handler: (handler: AuctionsLambdaHandler<B, P, Q>) => AuctionsMiddleware<B, P, Q>
}

/**
 * ===== MIDDLEWARE =====
 */

export const middleware = <B, P, Q>() => {
  let auctionLambda: AuctionsLambdaHandler<B, P, Q>

  const middlewareHandler: AuctionsMiddleware<B, P, Q> = async (event, context) => {
    try {
      const eventBody: EventBody<B> = {
        body: JSON.parse(event.body ?? '{}') as B,
      }
      const eventPathParameters: EventPathParameters<P> = {
        pathParameters: (event.pathParameters ?? {}) as P,
      }
      const eventQueryStringParameters: EventQueryStringParameters<Q> = {
        queryStringParameters: (event.queryStringParameters ?? {}) as Q,
      }
      const newEvent: APIGatewayProxyEventParsed<B, P, Q> = {
        ...event,
        ...eventBody,
        ...eventPathParameters,
        ...eventQueryStringParameters,
      }

      return await auctionLambda(newEvent, context)
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        return Utils.response(500, { message: error.message })
      }
      return Utils.response(500, { message: 'Whoops! Something went wrong!' })
    }
  }

  middlewareHandler.handler = (handler: AuctionsLambdaHandler<B, P, Q>) => {
    auctionLambda = handler
    return middlewareHandler
  }

  return middlewareHandler
}
